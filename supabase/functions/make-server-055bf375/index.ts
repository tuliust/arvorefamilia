import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve((_req: Request) => {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "legacy_function_disabled",
      message: "This legacy endpoint has been disabled. Use the current application APIs.",
    }),
    {
      status: 410,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
});
