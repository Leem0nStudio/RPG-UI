import type { GameBootstrap, GameContent } from '@/backend-contracts/game';

export const gameContent: GameContent = {
  units: [],
  items: [],
  quests: [],
  banners: [],
  jobs: [],
};

export const bootstrapData: GameBootstrap = {
  player: {
    id: 'player_local',
    name: 'Summoner',
    level: 1,
    energy: {
      current: 20,
      max: 20,
      recoverAt: null,
    },
    currencies: {
      gems: 25,
      zel: 0,
      karma: 0,
    },
  },
  roster: [],
  items: [],
  content: gameContent,
};

export const defaultPlayerProfile = bootstrapData.player;
export const defaultRoster = bootstrapData.roster;
export const defaultInventory = bootstrapData.items;