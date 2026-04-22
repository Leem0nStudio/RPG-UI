function readEnv(name: string): string | null {
  if (typeof process === 'undefined' || !process.env) return null;
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export const env = {
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  appUrl: readEnv('APP_URL'),
};

export function hasSupabaseEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
