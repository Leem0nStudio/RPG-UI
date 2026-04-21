export interface EnergyState {
  current: number;
  max: number;
  recoverAt: string | null;
}

const RECOVERY_MS = 10 * 60 * 1000;

export function syncEnergy(state: EnergyState, now = Date.now()): EnergyState {
  if (!state.recoverAt || state.current >= state.max) {
    return {
      current: Math.min(state.current, state.max),
      max: state.max,
      recoverAt: state.current >= state.max ? null : state.recoverAt,
    };
  }

  let current = state.current;
  let nextRecoverAt = new Date(state.recoverAt).getTime();

  while (current < state.max && nextRecoverAt <= now) {
    current += 1;
    nextRecoverAt += RECOVERY_MS;
  }

  return {
    current: Math.min(current, state.max),
    max: state.max,
    recoverAt: current >= state.max ? null : new Date(nextRecoverAt).toISOString(),
  };
}

export function spendEnergy(state: EnergyState, amount: number, now = Date.now()): EnergyState {
  const synced = syncEnergy(state, now);
  if (synced.current < amount) return synced;

  return {
    current: synced.current - amount,
    max: synced.max,
    recoverAt: synced.current === synced.max ? new Date(now + RECOVERY_MS).toISOString() : synced.recoverAt,
  };
}
