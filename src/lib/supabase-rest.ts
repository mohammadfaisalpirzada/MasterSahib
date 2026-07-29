const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) console.warn('Supabase environment variables are missing.');

export async function supabaseRest(path: string, init: RequestInit = {}) {
  if (!url || !serviceKey) throw new Error('Server database configuration is incomplete.');
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    cache: 'no-store'
  });
}
