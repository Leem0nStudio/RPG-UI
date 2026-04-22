export const env = {
  supabaseUrl: typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null : null,
  supabaseAnonKey: typeof process !== 'undefined' && process.env 
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? null)
    : null,
  appUrl: typeof process !== 'undefined' && process.env ? process.env.APP_URL ?? null : null,
};

export function hasSupabaseEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
