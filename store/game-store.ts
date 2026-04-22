import { create } from 'zustand';
import type { 
  BattleState, 
  CurrencyCode, 
  EnemyDefinition, 
  GameBootstrap, 
  ItemDefinition, 
  ItemType, 
  OwnedUnit, 
  QuestDefinition, 
  UnitDefinition 
} from '@/backend-contracts/game';
import { bootstrapData } from '@/content/game-content';
import { loadGameContent } from '@/services/content-service';
import { loadPlayerBootstrap } from '@/services/player-service';
import { loadEnemies } from '@/services/battle-service';

export type AppView = 'home' | 'unitList' | 'character' | 'inventory' | 'quest' | 'battle' | 'summon';

interface GameStoreState {
  isBootstrapping: boolean;
  view: AppView;
  targetSlot: ItemType | null;
  bootstrap: GameBootstrap;
  selectedUnitInstanceId: string | null;
  
  // Battle state
  currentQuest: QuestDefinition | null;
  currentEnemies: EnemyDefinition[];
  battleState: BattleState | null;
  lastBattleResult: BattleState | null;
  
  setView: (view: AppView) => void;
  selectUnit: (instanceId: string) => void;
  openInventoryForSlot: (slot: ItemType) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: ItemType) => void;
  bootstrapGame: () => Promise<void>;
  
  // Battle actions
  startQuest: (quest: QuestDefinition) => Promise<void>;
  enterBattle: () => Promise<void>;
  setBattleState: (state: BattleState | null) => void;
  completeBattle: (result: BattleState) => Promise<void>;
  cancelBattle: () => void;
  refreshEnemies: () => Promise<void>;
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
  
  // Battle state
  currentQuest: null,
  currentEnemies: [],
  battleState: null,
  lastBattleResult: null,
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
      });
    } catch (error) {
      console.error('[store] bootstrapGame failed:', error);
      set({ isBootstrapping: false });
    }
  },
  
  startQuest: async (quest: QuestDefinition) => {
    try {
      const state = get();
      
      const enemies = await loadEnemies(quest.enemyIds);
      
      set({
        currentQuest: quest,
        currentEnemies: enemies,
        view: 'battle',
      });
    } catch (error) {
      console.error('[store] startQuest failed:', error);
    }
  },
  
  enterBattle: async () => {
    const state = get();
    
    if (!state.currentQuest) return;
    
    set({
      battleState: {
        questId: state.currentQuest.id,
        enemyInstanceId: '',
        enemyHp: 0,
        enemyMaxHp: 0,
        enemyElement: 'Water',
        playerUnits: state.bootstrap.roster.slice(0, 4).map(u => ({
          instanceId: u.instanceId,
          currentHp: 0,
          bbGauge: 0,
        })),
        battlePhase: 'player_turn',
        turnNumber: 0,
      },
    });
  },
  
  setBattleState: (newState: BattleState | null) => {
    set({ battleState: newState });
  },
  
  completeBattle: async (result: BattleState) => {
    const state = get();
    
    // Update battle state
    set({
      battleState: result,
      lastBattleResult: result,
    });
    
    // Update local currencies (optimistic update)
    if (result.battlePhase === 'victory') {
      set({
        bootstrap: {
          ...state.bootstrap,
          player: {
            ...state.bootstrap.player,
            currencies: {
              ...state.bootstrap.player.currencies,
              zel: state.bootstrap.player.currencies.zel + 100,
            },
          },
        },
      });
    }
  },
  
  cancelBattle: () => {
    set({
      currentQuest: null,
      currentEnemies: [],
      battleState: null,
    });
  },
  
  refreshEnemies: async () => {
    const state = get();
    if (state.currentQuest) {
      const enemies = await loadEnemies(state.currentQuest.enemyIds);
      set({ currentEnemies: enemies });
    }
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
