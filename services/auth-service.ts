import { getSupabaseBrowserClient } from './supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

export interface SignInResult extends AuthResult {
  needsConfirmation?: boolean;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<SignInResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user && !data.session) {
    return {
      success: true,
      user: data.user,
      error: 'Please check your email to confirm your account',
    };
  }

  return { success: true, user: data.user };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(
  email: string
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/auth/reset-password` }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUserPassword(
  newPassword: string
): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user ?? null);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}