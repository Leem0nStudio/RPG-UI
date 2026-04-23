import { create } from 'zustand';
import { calculateUnitStats, scaleBaseStats } from '@/core/stats';
import type {
  BattleState,
  CurrencyCode,
  Element,
  EnemyDefinition,
  GameBootstrap,
  ItemDefinition,
  ItemType,
  OwnedUnit,
  QuestDefinition,
  StatBlock,
  UnitDefinition
} from '@/backend-contracts/game';
import { bootstrapData } from '@/content/game-content';
import { loadGameContent } from '@/services/content-service';
import { loadPlayerBootstrap } from '@/services/player-service';
import { canEvolve, getJob, getAvailableEvolutions } from '@/core/progression';
import { calculateRewardModifier } from '@/core/balance-system';
import { prepareQuest } from '@/services/quest-service';

export type AppView = 'home' | 'unitList' | 'character' | 'inventory' | 'quest' | 'battle' | 'summon' | 'qrScanner' | 'dailyQuests' | 'campaign' | 'story';

type BadgeCount = {
  quests?: number;
  units?: number;
  summon?: number;
  home?: number;
};

interface NotificationPayload {
  type: 'reward' | 'achievement' | 'levelup' | 'rare' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface GameStoreState {
  isBootstrapping: boolean;
  view: AppView;
  targetSlot: ItemType | null;
  bootstrap: GameBootstrap;
  selectedUnitInstanceId: string | null;
  
  // Party system
  partySlots: string[];
  unlockedPartySlots: number;
  
  // Badge counts for navbar
  badgeCounts: BadgeCount;

  // Battle state
  currentQuest: QuestDefinition | null;
  currentEnemies: EnemyDefinition[];
  battleState: BattleState | null;
  lastBattleResult: BattleState | null;

  // Notification queue
  notifications: NotificationPayload[];
  showCelebration: boolean;
  celebrationData: {
    type: 'levelup' | 'summon' | 'reward' | 'achievement' | 'battle_win';
    title: string;
    subtitle?: string;
    items?: Array<{ name: string; icon?: string; rarity?: number }>;
  } | null;

  setView: (view: AppView) => void;
  selectUnit: (instanceId: string) => void;
  openInventoryForSlot: (slot: ItemType) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: ItemType) => void;
  addGeneratedUnit: (unitData: { instanceId: string; unitId: string; jobId: string; level: number; stats: StatBlock; rarity: number; name: string; title: string; element: Element; skills?: any[]; spriteUrl?: string; cssFilter?: string }) => void;
  setBadgeCount: (key: keyof BadgeCount, value: number | undefined) => void;
  bootstrapGame: () => Promise<void>;
  pushNotification: (notification: NotificationPayload) => void;
  showLevelUpCelebration: (newLevel: number, unitName?: string) => void;
  showSummonCelebration: (unitName: string, rarity: number) => void;
  showGachaReward: (rewards: Array<{ name: string; type: string; rarity: string }>) => void;
  showBattleWinCelebration: () => void;
  hideCelebration: () => void;
  getPlayerLevel: () => number;
  
  // Battle actions
  startQuest: (quest: QuestDefinition) => void;
  enterBattle: () => void;
  setBattleState: (state: BattleState | null) => void;
  completeBattle: (result: BattleState) => Promise<void>;
  cancelBattle: () => void;
  refreshEnemies: () => void;
  
  // Party actions
  setPartySlots: (slots: string[]) => void;
  addToParty: (unitId: string) => void;
  removeFromParty: (slotIndex: number) => void;
  reorderParty: (fromIndex: number, toIndex: number) => void;
  unlockPartySlot: () => boolean;
  
  // Unit actions
  evolveUnit: (unitId: string, targetJobId: string) => boolean;
}

function findUnitDefinition(units: UnitDefinition[], unitId: string) {
  return units.find((unit) => unit.id === unitId) ?? units[0] ?? null;
}

function findOwnedUnit(bootstrap: GameBootstrap, instanceId: string | null): OwnedUnit | null {
  if (!instanceId) return bootstrap.roster[0] ?? null;
  return bootstrap.roster.find((unit) => unit.instanceId === instanceId) ?? bootstrap.roster[0] ?? null;
}

function findItem(bootstrap: GameBootstrap, itemId: string | null): ItemDefinition | null {
  if (!itemId) return null;
  return bootstrap.content.items.find((item) => item.id === itemId) ?? null;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  isBootstrapping: false,
  view: 'home',
  targetSlot: null,
  bootstrap: bootstrapData,
  selectedUnitInstanceId: bootstrapData.roster[0]?.instanceId ?? null,
  
  // Party system
  partySlots: [],
  unlockedPartySlots: 3,
  
  // Battle state
  currentQuest: null,
  currentEnemies: [],
  battleState: null,
  lastBattleResult: null,

  // Notification state
  notifications: [],
  showCelebration: false,
  celebrationData: null,
  
  // Badge counts
  badgeCounts: { home: 0, quests: 0, units: 0, summon: 0 },

  setView: (view) => set({ view }),
  selectUnit: (instanceId) => set({ selectedUnitInstanceId: instanceId, view: 'character' }),
  openInventoryForSlot: (slot) => set({ targetSlot: slot, view: 'inventory' }),
  equipItem: (itemId) => {
    const state = get();
    const ownedUnit = findOwnedUnit(state.bootstrap, state.selectedUnitInstanceId);
    const slot = state.targetSlot;
    if (!ownedUnit || !slot) return;

    set({
      bootstrap: {
        ...state.bootstrap,
        roster: state.bootstrap.roster.map((unit) =>
          unit.instanceId === ownedUnit.instanceId
            ? {
                ...unit,
                equipment: {
                  ...unit.equipment,
                  [slot]: itemId,
                },
              }
            : unit
        ),
      },
      view: 'character',
      targetSlot: null,
    });
  },
  unequipItem: (slot) => {
    const state = get();
    const ownedUnit = findOwnedUnit(state.bootstrap, state.selectedUnitInstanceId);
    if (!ownedUnit) return;

    set({
      bootstrap: {
        ...state.bootstrap,
        roster: state.bootstrap.roster.map((unit) =>
          unit.instanceId === ownedUnit.instanceId
            ? {
                ...unit,
                equipment: {
                  ...unit.equipment,
                  [slot]: null,
                },
              }
            : unit
        ),
      },
      targetSlot: null,
    });
  },
  setBadgeCount: (key, value) => {
    set((state) => ({
      badgeCounts: {
        ...state.badgeCounts,
        [key]: value,
      },
    }));
  },
  addGeneratedUnit: (unitData) => {
    const state = get();
    const newOwned: OwnedUnit = {
      instanceId: unitData.instanceId,
      unitId: unitData.unitId,
      level: unitData.level,
      exp: 0,
      jobId: unitData.jobId ?? 'novice',
      jobLevel: 1,
      jobExp: 0,
      locked: false,
      equipment: { Weapon: null, Armor: null, Accessory: null },
      unlockedJobs: ['novice'],
      equippedCards: [],
      equippedSkills: [],
    };
    set({
      bootstrap: {
        ...state.bootstrap,
        roster: [...state.bootstrap.roster, newOwned],
        content: {
          ...state.bootstrap.content,
          units: [
            ...state.bootstrap.content.units,
            {
              id: unitData.unitId,
              name: unitData.name,
              title: unitData.title,
              element: unitData.element,
              rarity: unitData.rarity,
              maxLevel: 50,
              jobId: unitData.jobId,
              maxJobLevel: 50,
              cost: 5,
              baseStats: unitData.stats,
              skills: unitData.skills || [],
              spriteUrl: unitData.spriteUrl || '',
              cssFilter: unitData.cssFilter || '',
            },
          ],
        },
      },
      selectedUnitInstanceId: unitData.instanceId,
      badgeCounts: {
        ...state.badgeCounts,
        units: (state.badgeCounts.units ?? 0) + 1,
      },
    });
  },
  pushNotification: (notification) => {
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
  },
  showLevelUpCelebration: (newLevel, unitName) => {
    set({
      showCelebration: true,
      celebrationData: {
        type: 'levelup',
        title: unitName ? `${unitName} Level Up!` : 'Level Up!',
        subtitle: `Reached level ${newLevel}`,
      },
    });
  },
  showSummonCelebration: (unitName, rarity) => {
    set({
      showCelebration: true,
      celebrationData: {
        type: 'summon',
        title: 'New Unit Summoned!',
        subtitle: unitName,
        items: [{ name: unitName, rarity }],
      },
    });
  },
  showGachaReward: (rewards: Array<{ name: string; type: string; rarity: string }>) => {
    set({
      showCelebration: true,
      celebrationData: {
        type: 'summon',
        title: 'Gacha Pull!',
        subtitle: `${rewards.length} reward${rewards.length > 1 ? 's' : ''}`,
        items: rewards.map(r => ({ name: r.name, rarity: r.rarity === 'mythic' ? 5 : r.rarity === 'legendary' ? 4 : r.rarity === 'epic' ? 3 : r.rarity === 'rare' ? 2 : 1 })),
      },
    });
  },
  showBattleWinCelebration: () => {
    set({
      showCelebration: true,
      celebrationData: {
        type: 'battle_win',
        title: 'Victory!',
        subtitle: 'Battle won!',
      },
    });
  },
  hideCelebration: () => {
    set({ showCelebration: false, celebrationData: null });
  },
  bootstrapGame: async () => {
    try {
      set({ isBootstrapping: true });

      const [content, player] = await Promise.all([loadGameContent(), loadPlayerBootstrap()]);
      const mergedBootstrap: GameBootstrap = {
        ...player,
        content,
      };

      set({
        isBootstrapping: false,
        bootstrap: mergedBootstrap,
        selectedUnitInstanceId: mergedBootstrap.roster[0]?.instanceId ?? null,
        partySlots: mergedBootstrap.roster.slice(0, 3).map(u => u.instanceId),
      });
    } catch (error) {
      console.error('[store] bootstrapGame failed:', error);
      set({ isBootstrapping: false });
    }
},
    
  startQuest: async (quest: QuestDefinition) => {
    const state = get();
    const availableEnemies = state.bootstrap.content.enemies;
    const playerLevel = state.getPlayerLevel();
    const playerProgress = state.bootstrap.content.units.length > 0 
      ? state.bootstrap.roster.filter(u => u.level >= playerLevel).length * 10 
      : 0;
    
    const { adjustedEnemies } = prepareQuest({
      playerLevel,
      playerProgress,
      quest,
      availableEnemies,
    });
    
    set({
      currentQuest: quest,
      currentEnemies: adjustedEnemies,
      view: 'battle',
    });
  },
  
  enterBattle: async () => {
    const state = get();
    if (!state.currentQuest || state.currentEnemies.length === 0) return;

    const enemy = state.currentEnemies[0];
    const enemyHp = enemy.baseStats.hp;

    const partySlots = state.partySlots ?? state.bootstrap.roster.slice(0, 3).map(u => u.instanceId);
    const playerUnits = state.bootstrap.roster
      .filter(owned => partySlots.includes(owned.instanceId))
      .slice(0, 5)
      .map((owned) => {
      const unitDefinition = state.bootstrap.content.units.find((unit) => unit.id === owned.unitId);
      const jobDefinition = unitDefinition
        ? state.bootstrap.content.jobs.find((job) => job.id === unitDefinition.jobId)
        : undefined;

      const equippedItems = ['Weapon', 'Armor', 'Accessory'] as const;
      const itemStats = equippedItems.map((slot) =>
        state.bootstrap.content.items.find((item) => item.id === owned.equipment[slot]) ?? null
      );

      const stats = unitDefinition && jobDefinition
        ? calculateUnitStats(unitDefinition, owned, itemStats, jobDefinition)
        : { hp: 1, atk: 1, def: 0, rec: 0 };

      return {
        instanceId: owned.instanceId,
        currentHp: stats.hp,
        bbGauge: 0,
      };
    });

    set({
      battleState: {
        questId: state.currentQuest.id,
        enemyInstanceId: enemy.id,
        enemyHp,
        enemyMaxHp: enemyHp,
        enemyElement: enemy.element,
        playerUnits,
        battlePhase: 'player_turn',
        turnNumber: 0,
      },
    });
  },
  
  setBattleState: (newState: BattleState | null) => {
    set({ battleState: newState });
  },
  
  completeBattle: async (result: BattleState) => {
    // Update battle state and keep the last result.
    set({
      battleState: result,
      lastBattleResult: result,
    });
  },
  
  cancelBattle: () => {
    set({
      currentQuest: null,
      currentEnemies: [],
      battleState: null,
    });
  },
  
  refreshEnemies: () => {
    const state = get();
    if (state.currentQuest) {
      const enemies = state.bootstrap.content.enemies.filter((e) =>
        state.currentQuest!.enemyIds.includes(e.id)
      );
      set({ currentEnemies: enemies });
    }
  },
  
  getPlayerLevel: () => {
    const state = get();
    const owned = selectCurrentOwnedUnit(state);
    return owned?.level ?? 1;
  },
  
  setPartySlots: (slots: string[]) => {
    set({ partySlots: slots.slice(0, 5) });
  },
  
  addToParty: (unitId: string) => {
    const state = get();
    const currentSlots = state.partySlots ?? [];
    const maxSlots = state.unlockedPartySlots ?? 3;
    
    if (currentSlots.length >= maxSlots) return;
    if (currentSlots.includes(unitId)) return;
    
    set({ partySlots: [...currentSlots, unitId] });
  },
  
  removeFromParty: (slotIndex: number) => {
    const state = get();
    const currentSlots = [...(state.partySlots ?? [])];
    if (slotIndex < 0 || slotIndex >= currentSlots.length) return;
    
    currentSlots.splice(slotIndex, 1);
    set({ partySlots: currentSlots });
  },
  
  reorderParty: (fromIndex: number, toIndex: number) => {
    const state = get();
    const currentSlots = [...(state.partySlots ?? [])];
    if (fromIndex < 0 || fromIndex >= currentSlots.length) return;
    if (toIndex < 0 || toIndex >= currentSlots.length) return;
    
    const [moved] = currentSlots.splice(fromIndex, 1);
    currentSlots.splice(toIndex, 0, moved);
    set({ partySlots: currentSlots });
  },
  
  unlockPartySlot: () => {
    const state = get();
    const currentMax = state.unlockedPartySlots ?? 3;
    const playerLevel = state.getPlayerLevel();
    
    if (currentMax >= 5) return false;
    
    const requiredLevels = [10, 30, 60];
    const nextUnlockIndex = currentMax - 3;
    if (playerLevel < requiredLevels[nextUnlockIndex]) return false;
    
    set({ unlockedPartySlots: currentMax + 1 });
    return true;
  },
  
  evolveUnit: (unitInstanceId: string, targetJobId: string) => {
    const state = get();
    const unit = state.bootstrap.roster.find(u => u.instanceId === unitInstanceId);
    if (!unit) return false;
    
    const result = canEvolve(unit, targetJobId);
    if (!result.canEvolve) return false;
    
    const zel = state.bootstrap.player.currencies.zel;
    if (zel < result.cost.zel) return false;
    
    const targetJob = getJob(targetJobId);
    if (!targetJob) return false;
    
    set(state => ({
      bootstrap: {
        ...state.bootstrap,
        player: {
          ...state.bootstrap.player,
          currencies: {
            ...state.bootstrap.player.currencies,
            zel: state.bootstrap.player.currencies.zel - result.cost.zel,
          },
        },
        roster: state.bootstrap.roster.map(u => 
          u.instanceId === unitInstanceId 
            ? { ...u, jobId: targetJobId, unlockedJobs: [...u.unlockedJobs, targetJobId] }
            : u
        ),
      },
    }));
    
    return true;
  },
}));

export function selectCurrentOwnedUnit(state: GameStoreState): OwnedUnit | null {
  return findOwnedUnit(state.bootstrap, state.selectedUnitInstanceId);
}

export function selectCurrentUnitDefinition(state: GameStoreState): UnitDefinition | null {
  const owned = selectCurrentOwnedUnit(state);
  return owned ? findUnitDefinition(state.bootstrap.content.units, owned.unitId) : null;
}

export function selectEquippedItems(state: GameStoreState) {
  const owned = selectCurrentOwnedUnit(state);
  if (!owned) return { Weapon: null, Armor: null, Accessory: null };

  return {
    Weapon: findItem(state.bootstrap, owned.equipment.Weapon),
    Armor: findItem(state.bootstrap, owned.equipment.Armor),
    Accessory: findItem(state.bootstrap, owned.equipment.Accessory),
  };
}
