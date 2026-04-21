function readEnv(name: string): string | null {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export const env = {
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  appUrl: readEnv('APP_URL'),
};

export function hasSupabaseEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
