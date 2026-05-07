import {
  GOOGLE_SCOPE,
  getEnv,
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
    const state = crypto.randomUUID();
    const supabase = getServiceClient();

    const { error } = await supabase
      .from("google_calendar_oauth_states")
      .insert({
        state,
        user_id: user.id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (error) throw error;

    const params = new URLSearchParams({
      client_id: getEnv("GOOGLE_CLIENT_ID"),
      redirect_uri: getEnv("GOOGLE_REDIRECT_URI"),
      response_type: "code",
      scope: GOOGLE_SCOPE,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    });

    return jsonResponse({
      success: true,
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[google-calendar-auth]", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Erro ao iniciar OAuth Google." },
      500,
    );
  }
});
