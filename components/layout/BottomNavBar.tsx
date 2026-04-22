'use client';

import React, { useState, useCallback } from 'react';
import { Home, Scroll, Sparkles, Users } from 'lucide-react';
import type { AppView } from '@/store/game-store';

type BadgeCount = {
  quests?: number;
  units?: number;
  summon?: number;
  home?: number;
};

type Props = {
  currentView: AppView;
  setView: (v: AppView) => void;
  badges?: BadgeCount;
};

export function BottomNavBar({ currentView, setView, badges }: Props) {
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  const tabs = [
    { id: 'home', icon: Home },
    { id: 'quest', icon: Scroll },
    { id: 'summon', icon: Sparkles },
    { id: 'unitList', icon: Users },
  ];

  const handleTabClick = useCallback((tabId: string) => {
    setPressedTab(tabId);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => {
      setPressedTab(null);
      setView(tabId as AppView);
    }, 100);
  }, [setView]);

  const isActive = (tabId: string) => {
    return currentView === tabId || 
           (currentView === 'character' && tabId === 'unitList') ||
           (currentView === 'inventory' && tabId === 'unitList') ||
           (currentView === 'qrScanner' && tabId === 'home');
  };

  const getBadge = (tabId: string) => {
    switch (tabId) {
      case 'home': return badges?.home;
      case 'quest': return badges?.quests;
      case 'summon': return badges?.summon;
      case 'unitList': return badges?.units;
      default: return undefined;
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-[#0d0502] via-[#1a0f08] to-[#2a1810] border-t-[2px] border-[#3a2517] flex justify-between px-2 pb-2 pt-1 shadow-[0_-4px_12px_rgba(0,0,0,0.8)] z-40 flex-shrink-0 relative">
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#c79a5d]/40 to-transparent"></div>
      
      {tabs.map((tab) => {
        const active = isActive(tab.id);
        const pressed = pressedTab === tab.id;
        const badge = getBadge(tab.id);
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex-1 flex items-center justify-center py-2 relative
              transition-all duration-200 ease-out
              ${pressed ? 'scale-95' : active ? 'scale-105' : 'scale-100'}
            `}
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {active && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#4a3015]/30 to-transparent rounded-lg" />
            )}
            
            <div className={`
              relative p-2 rounded-xl transition-all duration-200
              ${active 
                ? 'bg-gradient-to-b from-[#3a2515] to-[#2a1810] shadow-[0_0_15px_rgba(199,154,93,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)]' 
                : 'hover:bg-[#2a1810]/50'}
            `}>
              <Icon 
                size={24} 
                className={`
                  transition-all duration-200
                  ${active 
                    ? 'text-[#ffd66e] drop-shadow-[0_0_8px_rgba(255,214,110,0.6)]' 
                    : 'text-[#6a5a4a] group-hover:text-[#a58d78]'}
                  ${pressed ? 'scale-90' : ''}
                `}
              />
              
              {badge !== undefined && badge > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#ff4757] text-[10px] font-bold text-white shadow-[0_0_6px_rgba(255,71,87,0.6)] animate-pulse-slow">
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </div>
            
            {active && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ffd66e] shadow-[0_0_6px_rgba(255,214,110,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}