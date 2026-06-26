import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('SITE_SETTINGS_CRON_SECRET');

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase service credentials are not configured.' }, 500);
  }

  if (CRON_SECRET) {
    const receivedSecret = request.headers.get('x-cron-secret') ?? '';
    if (receivedSecret !== CRON_SECRET) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.rpc('publish_due_site_visual_settings');

  if (error) {
    console.error('[publish-scheduled-site-settings] publish failed', error);
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ result: data });
});
