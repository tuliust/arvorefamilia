import {
  createOrUpdateGoogleCalendarEvent,
  getServiceClient,
  getValidConnection,
  handleOptions,
  jsonResponse,
  parseCompleteFamilyDate,
  refreshGoogleAccessToken,
  requireUser,
} from "../_shared/googleCalendar.ts";

type PessoaRecord = {
  id: string;
  nome_completo: string;
  data_nascimento?: string | number | null;
  data_falecimento?: string | number | null;
};

type FamilyCalendarEvent = {
  key: string;
  pessoaId: string;
  pessoaNome: string;
  tipo: "aniversario" | "memoria";
  month: number;
  day: number;
  originalYear: number;
};

type SyncBody = {
  incluirAniversarios?: boolean;
  incluirMemorias?: boolean;
};

function buildFamilyEvents(pessoas: PessoaRecord[]) {
  const events: FamilyCalendarEvent[] = [];

  for (const pessoa of pessoas) {
    const nascimento = parseCompleteFamilyDate(pessoa.data_nascimento);
    if (nascimento) {
      events.push({
        key: `${pessoa.id}-aniversario`,
        pessoaId: pessoa.id,
        pessoaNome: pessoa.nome_completo,
        tipo: "aniversario",
        month: nascimento.month,
        day: nascimento.day,
        originalYear: nascimento.year,
      });
    }

    const falecimento = parseCompleteFamilyDate(pessoa.data_falecimento);
    if (falecimento) {
      events.push({
        key: `${pessoa.id}-memoria`,
        pessoaId: pessoa.id,
        pessoaNome: pessoa.nome_completo,
        tipo: "memoria",
        month: falecimento.month,
        day: falecimento.day,
        originalYear: falecimento.year,
      });
    }
  }

  return events;
}

function formatDateForCurrentYear(month: number, day: number) {
  const currentYear = new Date().getUTCFullYear();
  let year = currentYear;
  let date = new Date(Date.UTC(year, month - 1, day));

  while (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    year += 1;
    date = new Date(Date.UTC(year, month - 1, day));
  }

  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start: date.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function buildGoogleEvent(event: FamilyCalendarEvent) {
  const dates = formatDateForCurrentYear(event.month, event.day);
  return {
    summary: event.tipo === "aniversario"
      ? `Aniversário de ${event.pessoaNome}`
      : `Memória de ${event.pessoaNome}`,
    description: event.tipo === "aniversario"
      ? "Data registrada na Árvore Família."
      : "Data de memória registrada na Árvore Família.",
    start: { date: dates.start },
    end: { date: dates.end },
    recurrence: ["RRULE:FREQ=YEARLY"],
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 1440 }],
    },
    extendedProperties: {
      private: {
        arvorefamilia_event_key: event.key,
        arvorefamilia_pessoa_id: event.pessoaId,
        arvorefamilia_event_type: event.tipo,
      },
    },
  };
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const user = await requireUser(req);
    const body = req.method === "POST" ? ((await req.json().catch(() => ({}))) as SyncBody) : {};
    const incluirAniversarios = body.incluirAniversarios !== false;
    const incluirMemorias = body.incluirMemorias !== false;
    const connection = await getValidConnection(user.id);
    if (!connection) {
      return jsonResponse({ success: false, error: "Google Agenda não conectado" }, 400);
    }
    const accessToken = await refreshGoogleAccessToken(connection);

    const supabase = getServiceClient();
    const { data: pessoas, error: pessoasError } = await supabase
      .from("pessoas")
      .select("id,nome_completo,data_nascimento,data_falecimento")
      .order("nome_completo", { ascending: true });

    if (pessoasError) throw pessoasError;

    const events = buildFamilyEvents((pessoas ?? []) as PessoaRecord[]).filter((event) => {
      if (event.tipo === "aniversario") return incluirAniversarios;
      if (event.tipo === "memoria") return incluirMemorias;
      return false;
    });
    let totalCriados = 0;
    let totalAtualizados = 0;
    let totalIgnorados = 0;
    const erros: Array<{ evento_familiar_id: string; erro: string }> = [];

    for (const event of events) {
      const { data: existing, error: existingError } = await supabase
        .from("google_calendar_synced_events")
        .select("id,google_event_id")
        .eq("user_id", user.id)
        .eq("family_event_key", event.key)
        .maybeSingle();

      if (existingError) throw existingError;

      try {
        const googleEvent = await createOrUpdateGoogleCalendarEvent({
          accessToken,
          googleCalendarId: connection.google_calendar_id,
          googleEventId: existing?.google_event_id ?? null,
          event: buildGoogleEvent(event),
        });

        if (existing) {
          const { error: updateError } = await supabase
            .from("google_calendar_synced_events")
            .update({
              google_event_id: googleEvent.id,
              google_calendar_id: connection.google_calendar_id,
              event_month: event.month,
              event_day: event.day,
            })
            .eq("id", existing.id);
          if (updateError) throw updateError;
          totalAtualizados += 1;
        } else {
          const { error: insertError } = await supabase
            .from("google_calendar_synced_events")
            .insert({
              user_id: user.id,
              pessoa_id: event.pessoaId,
              event_type: event.tipo,
              family_event_key: event.key,
              google_event_id: googleEvent.id,
              google_calendar_id: connection.google_calendar_id,
              event_month: event.month,
              event_day: event.day,
            });

          if (insertError) throw insertError;
          totalCriados += 1;
        }
      } catch (error) {
        erros.push({
          evento_familiar_id: event.key,
          erro: error instanceof Error ? error.message : "Erro desconhecido.",
        });
      }
    }

    totalIgnorados = buildFamilyEvents((pessoas ?? []) as PessoaRecord[]).length - events.length;

    const { error: syncError } = await supabase
      .from("google_calendar_connections")
      .update({ last_sync_at: new Date().toISOString(), ativo: true })
      .eq("id", connection.id);

    if (syncError) throw syncError;

    return jsonResponse({
      success: erros.length === 0,
      totalCriados,
      totalAtualizados,
      totalIgnorados,
      erros,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[sync-google-calendar]", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Erro ao sincronizar Google Calendar." },
      500,
    );
  }
});
