import {
  exchangeCodeForTokens,
  getFrontendRedirectUrl,
  getServiceClient,
  handleOptions,
} from "../_shared/googleCalendar.ts";

function redirectToCalendar(params: Record<string, string>) {
  const url = new URL(getFrontendRedirectUrl("/calendario-familiar"));
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return Response.redirect(url.toString(), 302);
}

async function getGoogleAccountEmail(accessToken: string) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    if (oauthError) {
      return redirectToCalendar({ google_calendar: "error", message: oauthError });
    }

    if (!code || !state) {
      return redirectToCalendar({ google_calendar: "error", message: "callback_invalido" });
    }

    const supabase = getServiceClient();
    const { data: stateRow, error: stateError } = await supabase
      .from("google_calendar_oauth_states")
      .select("*")
      .eq("state", state)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (stateError) throw stateError;
    if (!stateRow) {
      return redirectToCalendar({ google_calendar: "error", message: "state_expirado" });
    }

    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + Number(tokens.expires_in ?? 3600) * 1000).toISOString();
    const googleAccountEmail = await getGoogleAccountEmail(tokens.access_token);

    const { data: currentConnection } = await supabase
      .from("google_calendar_connections")
      .select("refresh_token,google_account_email")
      .eq("user_id", stateRow.user_id)
      .maybeSingle();

    const refreshToken = tokens.refresh_token ?? currentConnection?.refresh_token;
    if (!refreshToken) {
      throw new Error("Google nao retornou refresh token. Remova o acesso no Google e conecte novamente.");
    }

    const { error: upsertError } = await supabase
      .from("google_calendar_connections")
      .upsert(
        {
          user_id: stateRow.user_id,
          google_account_email: googleAccountEmail ?? currentConnection?.google_account_email ?? null,
          google_calendar_id: "primary",
          access_token: tokens.access_token,
          refresh_token: refreshToken,
          token_type: tokens.token_type ?? "Bearer",
          scope: tokens.scope,
          expires_at: expiresAt,
          ativo: true,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) throw upsertError;

    await supabase
      .from("google_calendar_oauth_states")
      .update({ used_at: new Date().toISOString() })
      .eq("state", state);

    return redirectToCalendar({ google_calendar: "connected" });
  } catch (error) {
    console.error("[google-calendar-callback]", error);
    return redirectToCalendar({
      google_calendar: "error",
    });
  }
});
