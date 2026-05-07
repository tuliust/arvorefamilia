import {
  getServiceClient,
  handleOptions,
  jsonResponse,
  requireUser,
} from "../_shared/googleCalendar.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const user = await requireUser(req);
    const supabase = getServiceClient();
    const { data: connection, error: connectionError } = await supabase
      .from("google_calendar_connections")
      .select("access_token,refresh_token")
      .eq("user_id", user.id)
      .maybeSingle();

    if (connectionError) throw connectionError;

    if (connection?.access_token) {
      const token = connection.refresh_token || connection.access_token;
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
        method: "POST",
      }).catch((error) => {
        console.warn("[disconnect-google-calendar] Falha ao revogar token no Google:", error);
      });
    }

    const { error: connectionUpdateError } = await supabase
      .from("google_calendar_connections")
      .update({ ativo: false })
      .eq("user_id", user.id);

    if (connectionUpdateError) throw connectionUpdateError;

    return jsonResponse({ success: true, connected: false });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[disconnect-google-calendar]", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Erro ao desconectar Google Calendar." },
      500,
    );
  }
});
