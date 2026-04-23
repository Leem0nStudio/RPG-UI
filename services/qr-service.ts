import { getSupabaseBrowserClient } from './supabase/client';

interface ClaimQRResultRow {
  success: boolean;
  error?: string;
  type?: 'item' | 'unit' | 'currency';
  reward?: Record<string, unknown>;
  location?: string;
  message?: string;
  next_reset?: string;
}

interface QRCodeRow {
  code: string;
  location_name: string;
}

export interface QRReward {
  type: 'item' | 'unit' | 'currency';
  reward: {
    itemId?: string;
    quantity?: number;
    unitId?: string;
    level?: number;
    gems?: number;
    zel?: number;
    karma?: number;
  };
  location: string;
  message: string;
}

export interface ClaimQRResult {
  success: boolean;
  error?: string;
  reward?: QRReward;
  nextReset?: string;
}

export async function claimQRReward(code: string): Promise<ClaimQRResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase.rpc<ClaimQRResultRow>('claim_qr_reward', {
    p_code: code.trim().toUpperCase(),
    p_player_id: session.user.id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data?.success) {
    return {
      success: false,
      error: data?.error,
      nextReset: data?.next_reset,
    };
  }

  return {
    success: true,
    reward: {
      type: data.type ?? 'item',
      reward: data.reward ?? {},
      location: data.location ?? '',
      message: data.message ?? '',
    },
  };
}

export async function getQRAvailableCodes(): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from<QRCodeRow>('qr_codes')
    .select('code, location_name')
    .eq('is_active', true);

  if (error) return [];

  return data?.map((qr) => qr.code) ?? [];
}

export function isValidQRFormat(data: string): boolean {
  return data.length > 0 && data.length <= 100;
}

export function generateQRPayload(code: string): string {
  return `RPGUI:${code}`;
}

export function parseQRPayload(data: string): string | null {
  if (data.startsWith('RPGUI:')) {
    return data.substring(6).trim();
  }
  if (data.includes(':')) {
    const parts = data.split(':');
    if (parts[0] === 'RPGUI' || parts[0] === 'RPG') {
      return parts[1]?.trim() ?? null;
    }
  }
  if (data.length > 0 && data.length <= 50) {
    return data.trim().toUpperCase();
  }
  return null;
}