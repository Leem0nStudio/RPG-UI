'use client';

import React from 'react';
import { Swords, Users, Sparkles, ScanLine, Gem, Zap, Star, Trophy, Flame, Snowflake, Leaf, Sun, Moon, ChevronRight, TrendingUp, Target, Award, Scroll, BookOpen } from 'lucide-react';
import type { GameBootstrap } from '@/backend-contracts/game';
import { RarityBadge } from '@/components/ui/GameEffects';

type Props = {
  bootstrap: GameBootstrap;
  onOpenUnits: () => void;
  onOpenQuest: () => void;
  onOpenSummon: () => void;
  onOpenQR: () => void;
  onOpenDailyQuests: () => void;
  onOpenCampaign: () => void;
};

export function HomeHubView({ bootstrap, onOpenUnits, onOpenQuest, onOpenSummon, onOpenQR, onOpenDailyQuests, onOpenCampaign }: Props) {
  const { player, roster, items, content } = bootstrap;
  const energyPercent = Math.round((player.energy.current / player.energy.max) * 100);
  const unitCount = roster.length;
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  
  const activeBanner = content.banners.find((banner) => banner.active);

  const getEnergyColor = () => {
    if (energyPercent > 60) return { bar: 'bg-gradient-to-r from-[#4ade80] to-[#22c55e]', text: 'text-[#4ade80]' };
    if (energyPercent > 30) return { bar: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]', text: 'text-[#fbbf24]' };
    return { bar: 'bg-gradient-to-r from-[#f87171] to-[#ef4444]', text: 'text-[#f87171]' };
  };

  const energyColor = getEnergyColor();

  return (
    <div className="w-full flex-1 flex flex-col gap-3 animate-in fade-in duration-300 ui-text">
      {/* Welcome Header */}
      <section className="ui-panel p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#ffd66e]/30 to-transparent rounded-bl-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] text-[#a58d78]">Level {player.level}</span>
            <span className="text-[#6a5a4a]">•</span>
            <span className="text-[12px] text-[#c9a872] font-bold">{player.name}</span>
          </div>
          <h1 className="ui-heading text-[22px] leading-none text-white text-stroke-black">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="mt-2 text-[11px] text-[#3c2a16]">
            Tu aventura continúa, {player.name}. La gloria te espera.
          </p>
        </div>
      </section>

      {/* Energy Bar */}
      <section className="ui-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#ffd66e]" />
            <span className="text-[11px] font-bold text-[#a58d78] uppercase tracking-wider">Energía</span>
          </div>
          <span className={`text-[14px] font-bold ${energyColor.text}`}>
            {player.energy.current}/{player.energy.max}
          </span>
        </div>
        <div className="h-3 bg-[#1a0a05] rounded-full overflow-hidden border border-[#3a2820]">
          <div 
            className={`h-full ${energyColor.bar} rounded-full transition-all duration-500 relative`}
            style={{ width: `${energyPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
          </div>
        </div>
        <div className="mt-1 text-[10px] text-[#6a5a4a] text-right">
          {energyPercent}% • Recarga automática activa
        </div>
      </section>

      {/* Main Actions Grid 2x2 */}
      <section className="grid grid-cols-2 gap-2">
        {/* Quests - Primary */}
        <button 
          onClick={onOpenQuest}
          className="ui-panel p-4 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ff6b6b]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <Swords size={28} className="text-[#ff6b6b]" />
              <div className="px-2 py-1 bg-[#ff6b6b]/20 rounded text-[10px] font-bold text-[#ff6b6b]">
                {player.energy.current} ⚡
              </div>
            </div>
            <h3 className="ui-heading text-[16px] text-white text-stroke-sm mb-1">Quests</h3>
            <p className="text-[10px] text-[#3c2a16] leading-tight">
              Explora mundos, combate enemigos y gana recompensas épicas.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[#ff6b6b] text-[10px] font-bold">
              <Target size={12} />
              {content.quests.length} misiones disponibles
              <ChevronRight size={12} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Units - Primary */}
        <button 
          onClick={onOpenUnits}
          className="ui-panel p-4 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#60a5fa]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <Users size={28} className="text-[#60a5fa]" />
              <div className="px-2 py-1 bg-[#60a5fa]/20 rounded text-[10px] font-bold text-[#60a5fa]">
                {unitCount} 👥
              </div>
            </div>
            <h3 className="ui-heading text-[16px] text-white text-stroke-sm mb-1">Unidades</h3>
            <p className="text-[10px] text-[#3c2a16] leading-tight">
              Gestiona tu roster, equipa armas y evolve tus personajes.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[#60a5fa] text-[10px] font-bold">
              <TrendingUp size={12} />
              Potencia tu ejército
              <ChevronRight size={12} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Summon - Secondary */}
        <button 
          onClick={onOpenSummon}
          className="ui-panel p-3 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#b388ff]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2 bg-[#b388ff]/10 rounded-lg">
              <Sparkles size={22} className="text-[#b388ff]" />
            </div>
            <div className="flex-1">
              <h3 className="ui-heading text-[14px] text-white text-stroke-sm">Invocar</h3>
              <p className="text-[9px] text-[#3c2a16]">Consigue nuevas unidades legendario</p>
              {activeBanner && (
                <div className="mt-1 px-2 py-0.5 bg-[#ffd66e]/20 rounded text-[9px] text-[#ffd66e] font-bold">
                  {activeBanner.name}
                </div>
              )}
            </div>
          </div>
        </button>

{/* QR Hunt - Secondary */}
        <button 
          onClick={onOpenQR}
          className="ui-panel p-3 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#4ade80]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2 bg-[#4ade80]/10 rounded-lg">
              <ScanLine size={22} className="text-[#4ade80]" />
            </div>
            <div className="flex-1">
              <h3 className="ui-heading text-[14px] text-white text-stroke-sm">QR Hunt</h3>
              <p className="text-[9px] text-[#3c2a16]">Escanea códigos reales para loot</p>
              <div className="mt-1 px-2 py-0.5 bg-[#4ade80]/20 rounded text-[9px] text-[#4ade80] font-bold flex items-center gap-1">
                <span className="animate-pulse">●</span> NEW
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Campaign & Daily Quests */}
      <section className="grid grid-cols-2 gap-2">
        {/* Campaign - New */}
        <button 
          onClick={onOpenCampaign}
          className="ui-panel p-3 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#b388ff]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2 bg-[#b388ff]/10 rounded-lg">
              <Scroll size={22} className="text-[#b388ff]" />
            </div>
            <div className="flex-1">
              <h3 className="ui-heading text-[14px] text-white text-stroke-sm">Campaña</h3>
              <p className="text-[9px] text-[#3c2a16]">Historia y decisiones ��picas</p>
              <div className="mt-1 px-2 py-0.5 bg-[#b388ff]/20 rounded text-[9px] text-[#b388ff] font-bold">
                Cap 1-5
              </div>
            </div>
          </div>
        </button>

        {/* Daily Quests - New */}
        <button 
          onClick={onOpenDailyQuests}
          className="ui-panel p-3 text-left relative overflow-hidden active:scale-[0.98] transition-transform group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#ffd66e]/20 to-transparent rounded-bl-full" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="p-2 bg-[#ffd66e]/10 rounded-lg">
              <Trophy size={22} className="text-[#ffd66e]" />
            </div>
            <div className="flex-1">
              <h3 className="ui-heading text-[14px] text-white text-stroke-sm">Misiones</h3>
              <p className="text-[9px] text-[#3c2a16]">Recompensas diarias y semanales</p>
              <div className="mt-1 px-2 py-0.5 bg-[#ffd66e]/20 rounded text-[9px] text-[#ffd66e] font-bold flex items-center gap-1">
                <span className="animate-pulse">●</span> NEW
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Stats Overview */}
      <section className="ui-panel p-3">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-[#ffd700]" />
          <span className="text-[11px] font-bold text-[#a58d78] uppercase tracking-wider">Tu Progreso</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1a0a05] rounded-lg p-2 text-center border border-[#3a2820]">
            <Users size={16} className="mx-auto text-[#60a5fa] mb-1" />
            <div className="text-[16px] font-bold text-white">{unitCount}</div>
            <div className="text-[9px] text-[#6a5a4a]">Unidades</div>
          </div>
          <div className="bg-[#1a0a05] rounded-lg p-2 text-center border border-[#3a2820]">
            <Target size={16} className="mx-auto text-[#ff6b6b] mb-1" />
            <div className="text-[16px] font-bold text-white">{questCount}</div>
            <div className="text-[9px] text-[#6a5a4a]">Quests</div>
          </div>
          <div className="bg-[#1a0a05] rounded-lg p-2 text-center border border-[#3a2820]">
            <Award size={16} className="mx-auto text-[#ffd66e] mb-1" />
            <div className="text-[16px] font-bold text-white">{itemCount}</div>
            <div className="text-[9px] text-[#6a5a4a]">Items</div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="ui-panel p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Gem size={16} className="text-[#00ffcc]" />
            <span className="text-[11px] font-bold text-white">{player.currencies.gems}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={16} className="text-[#ffd66e]" />
            <span className="text-[11px] font-bold text-white">{player.currencies.zel.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-[#b388ff]" />
            <span className="text-[11px] font-bold text-white">{player.currencies.karma}</span>
          </div>
        </div>
      </section>

      {/* Daily Reward Streak */}
      <section className="ui-panel p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[#ff6b6b]" />
            <span className="text-[11px] font-bold text-[#a58d78] uppercase tracking-wider">Racha Diaria</span>
          </div>
          <span className="text-[12px] font-bold text-white">Día 1</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`
                flex-1 h-10 rounded-lg flex items-center justify-center
                ${day === 1 
                  ? 'bg-gradient-to-b from-[#ffd66e] to-[#f59e0b] shadow-[0_0_10px_rgba(255,214,110,0.4)]' 
                  : 'bg-[#1a0a05] border border-[#3a2820]'}
              `}
            >
              {day === 1 ? (
                <Gem size={18} className="text-white" />
              ) : (
                <span className="text-[10px] text-[#6a5a4a]">{day}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Element Showcase */}
      <section className="ui-panel p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sun size={16} className="text-[#ffd66e]" />
          <span className="text-[11px] font-bold text-[#a58d78] uppercase tracking-wider">Elementos</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#ff5500]/10 rounded-lg p-2 text-center border border-[#ff5500]/20">
            <Flame size={18} className="mx-auto text-[#ff5500] mb-1" />
            <span className="text-[10px] text-[#ff5500] font-bold">Fuego</span>
          </div>
          <div className="flex-1 bg-[#00ccff]/10 rounded-lg p-2 text-center border border-[#00ccff]/20">
            <Snowflake size={18} className="mx-auto text-[#00ccff] mb-1" />
            <span className="text-[10px] text-[#00ccff] font-bold">Agua</span>
          </div>
          <div className="flex-1 bg-[#55ff00]/10 rounded-lg p-2 text-center border border-[#55ff00]/20">
            <Leaf size={18} className="mx-auto text-[#55ff00] mb-1" />
            <span className="text-[10px] text-[#55ff00] font-bold">Tierra</span>
          </div>
          <div className="flex-1 bg-[#ffeb3b]/10 rounded-lg p-2 text-center border border-[#ffeb3b]/20">
            <Sun size={18} className="mx-auto text-[#ffeb3b] mb-1" />
            <span className="text-[10px] text-[#ffeb3b] font-bold">Luz</span>
          </div>
          <div className="flex-1 bg-[#cc00ff]/10 rounded-lg p-2 text-center border border-[#cc00ff]/20">
            <Moon size={18} className="mx-auto text-[#cc00ff] mb-1" />
            <span className="text-[10px] text-[#cc00ff] font-bold">Oscuridad</span>
          </div>
        </div>
      </section>
    </div>
  );
}