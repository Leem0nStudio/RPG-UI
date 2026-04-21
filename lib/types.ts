import type { ItemDefinition, ItemType as BackendItemType, SkillDefinition, UnitDefinition, Element } from '@/backend-contracts/game';

export type ItemType = BackendItemType;

export interface Item extends ItemDefinition {}

export interface CharacterSkill extends SkillDefinition {}

export interface CharacterData extends Omit<UnitDefinition, 'maxLevel'> {
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
  element: Element;
}

export type CharEquipment = { Weapon: Item | null; Armor: Item | null; Accessory: Item | null };
