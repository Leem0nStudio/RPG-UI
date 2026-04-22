import React from 'react';
import { Castle, Gem, ScanLine, Sparkles, Swords, Users, Zap } from 'lucide-react';
import type { GameBootstrap } from '@/backend-contracts/game';

type Props = {
  bootstrap: GameBootstrap;
  onOpenUnits: () => void;
  onOpenQuest: () => void;
  onOpenSummon: () => void;
  onOpenQR: () => void;
};

export function HomeHubView({ bootstrap, onOpenUnits, onOpenQuest, onOpenSummon, onOpenQR }: Props) {
  const activeBanner = bootstrap.content.banners.find((banner) => banner.active);

  return (
    <div className="w-full flex-1 flex flex-col gap-3 animate-in fade-in duration-300 ui-text">
      <section className="ui-panel p-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,220,120,0.6),transparent_45%)]" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e3cfb4]/30 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f5d796]">
              <Castle size={12} />
              Realm Hub
            </div>
            <h1 className="mt-3 ui-heading text-[24px] leading-none text-white text-stroke-black fx-low">
              Mobile-first command center
            </h1>
            <p className="mt-2 max-w-[240px] text-[12px] leading-[1.35] text-[#3c2a16]">
              The shell now points to a real game architecture: remote content, server-backed progression, and a playfield runtime ready for battle scenes.
            </p>
          </div>
          <div className="rounded-[10px] border border-[#f3e5ca]/20 bg-[#1a110a]/85 px-3 py-2 text-right shadow-[var(--shadow-low)]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#a58d78]">Energy</div>
            <div className="mt-1 text-[22px] font-bold text-white">{bootstrap.player.energy.current}/{bootstrap.player.energy.max}</div>
            <div className="mt-1 text-[10px] text-[#cfbca1]">Auto recovery enabled</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <button onClick={onOpenQuest} className="ui-panel p-3 text-left active:scale-[0.98] transition-transform">
          <Swords size={18} className="text-[#ffdd88]" />
          <div className="mt-3 ui-heading text-[14px] text-white text-stroke-sm">Quest Gate</div>
          <p className="mt-1 text-[11px] leading-[1.3] text-[#3c2a16]">Enter stage select, spend energy, and launch tactical encounters.</p>
        </button>
        <button onClick={onOpenUnits} className="ui-panel p-3 text-left active:scale-[0.98] transition-transform">
          <Users size={18} className="text-[#7aaef0]" />
          <div className="mt-3 ui-heading text-[14px] text-white text-stroke-sm">Unit Roster</div>
          <p className="mt-1 text-[11px] leading-[1.3] text-[#3c2a16]">Manage squad composition, equipment, and progression paths.</p>
        </button>
        <button onClick={onOpenSummon} className="ui-panel p-3 text-left active:scale-[0.98] transition-transform">
          <Sparkles size={18} className="text-[#ffd66e]" />
          <div className="mt-3 ui-heading text-[14px] text-white text-stroke-sm">Summon Banner</div>
          <p className="mt-1 text-[11px] leading-[1.3] text-[#3c2a16]">Use banner-driven rates and future pity logic from Supabase.</p>
        </button>
        <div className="ui-panel p-3">
          <ScanLine size={18} className="text-[#89e09d]" />
          <div className="mt-3 ui-heading text-[14px] text-white text-stroke-sm">QR Hunt</div>
          <p className="mt-1 text-[11px] leading-[1.3] text-[#3c2a16]">Scan real-world QR codes for exclusive rewards!</p>
          <button
            onClick={onOpenQR}
            className="mt-2 w-full py-2 text-[11px] font-bold text-white bg-[#2a5a3a] hover:bg-[#3a7a4a] rounded transition-colors"
          >
            Open Scanner
          </button>
        </div>
      </section>

      <section className="ui-panel p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#a58d78]">Active Banner</div>
            <div className="mt-1 ui-heading text-[16px] text-white text-stroke-sm">
              {activeBanner?.name ?? 'No live banner'}
            </div>
            <div className="mt-1 text-[11px] text-[#3c2a16]">{activeBanner?.description ?? 'Connect Supabase to publish live gacha banners.'}</div>
          </div>
          <div className="rounded-[10px] bg-[#1a110a] px-3 py-2 text-center shadow-[var(--shadow-low)]">
            <Gem size={18} className="mx-auto text-[#00ffcc]" />
            <div className="mt-1 text-[11px] font-bold text-white">{bootstrap.player.currencies.gems}</div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#a58d78]">Gems</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-[10px] border border-[#5a4227] bg-[#1a110a]/85 p-3">
          <Zap size={16} className="text-[#89e09d]" />
          <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#a58d78]">Live Data</div>
          <div className="mt-1 text-[12px] font-bold text-white">Supabase-ready</div>
        </div>
        <div className="rounded-[10px] border border-[#5a4227] bg-[#1a110a]/85 p-3">
          <Swords size={16} className="text-[#ffdd88]" />
          <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#a58d78]">Combat Core</div>
          <div className="mt-1 text-[12px] font-bold text-white">Pure TS rules</div>
        </div>
        <div className="rounded-[10px] border border-[#5a4227] bg-[#1a110a]/85 p-3">
          <Castle size={16} className="text-[#c7b08d]" />
          <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#a58d78]">Runtime</div>
          <div className="mt-1 text-[12px] font-bold text-white">Phaser shell</div>
        </div>
      </section>
    </div>
  );
}
