'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Star, Gem, Trophy, Zap, Swords } from 'lucide-react';

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'levelup' | 'summon' | 'reward' | 'achievement' | 'battle_win';
  title: string;
  subtitle?: string;
  items?: Array<{
    name: string;
    icon: React.ReactNode;
    rarity?: number;
  }>;
  duration?: number;
}

export function CelebrationPopup({
  isOpen,
  onClose,
  type,
  title,
  subtitle,
  items = [],
  duration = 3000,
}: CelebrationPopupProps) {
  const [particles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>(() => {
    if (!isOpen) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#ffd66e', '#00ffcc', '#ff6b6b', '#b388ff', '#4ade80'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
    }));
  });

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    levelup: {
      icon: <Star size={48} className="text-[#00ffcc]" />,
      bgGradient: 'from-[#0a2a20] to-[#051510]',
      borderColor: '#00ffcc',
      titleColor: 'text-[#00ffcc]',
    },
    summon: {
      icon: <Sparkles size={48} className="text-[#b388ff]" />,
      bgGradient: 'from-[#1a1025] to-[#0a0512]',
      borderColor: '#b388ff',
      titleColor: 'text-[#b388ff]',
    },
    reward: {
      icon: <Gem size={48} className="text-[#ffd66e]" />,
      bgGradient: 'from-[#2a1a10] to-[#150d08]',
      borderColor: '#ffd66e',
      titleColor: 'text-[#ffd66e]',
    },
    achievement: {
      icon: <Trophy size={48} className="text-[#ffd700]" />,
      bgGradient: 'from-[#2a2510] to-[#151208]',
      borderColor: '#ffd700',
      titleColor: 'text-[#ffd700]',
    },
    battle_win: {
      icon: <Swords size={48} className="text-[#ff6b6b]" />,
      bgGradient: 'from-[#2a1010] to-[#150808]',
      borderColor: '#ff6b6b',
      titleColor: 'text-[#ff6b6b]',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* Main Popup */}
      <div
        className={`
          relative pointer-events-auto
          w-[320px] p-6 rounded-xl
          bg-gradient-to-b ${config.bgGradient}
          border-2 animate-levelUp
        `}
        style={{
          borderColor: config.borderColor,
          boxShadow: `0 0 30px ${config.borderColor}40, inset 0 0 20px ${config.borderColor}20`,
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4 animate-bounce-slow">
          <div className="p-4 rounded-full bg-black/30">
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-center ui-heading text-[20px] ${config.titleColor} text-stroke-sm mb-2`}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-center text-[12px] text-[#a58d78] mb-4">
            {subtitle}
          </p>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-3 rounded-lg
                  bg-black/30 border
                  ${item.rarity ? `rarity-${item.rarity}` : 'border-[#3a2820]'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${item.rarity ? `rarity-${item.rarity} bg-black/30` : 'bg-[#2a1a0f]'}
                `}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-white">{item.name}</div>
                  {item.rarity && (
                    <div className="text-[10px] text-[#a58d78]">
                      {['Common', 'Normal', 'Rare', 'Epic', 'Legendary'][item.rarity - 1] ?? 'Unknown'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skip Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-[12px] text-[#6a5a4a] hover:text-white transition-colors"
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}

interface RarityBadgeProps {
  rarity: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RarityBadge({ rarity, size = 'md', showLabel = false }: RarityBadgeProps) {
  const rarityColors: Record<number, { bg: string; text: string; glow: string }> = {
    1: { bg: 'bg-gray-500/20', text: 'text-gray-400', glow: 'shadow-[0_0_5px_rgba(156,163,175,0.5)]' },
    2: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-[0_0_8px_rgba(74,222,128,0.5)]' },
    3: { bg: 'bg-blue-500/20', text: 'text-blue-400', glow: 'shadow-[0_0_10px_rgba(96,165,250,0.5)]' },
    4: { bg: 'bg-purple-500/20', text: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.6)]' },
    5: { bg: 'bg-orange-500/20', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.7)]' },
  };

  const sizeClasses = {
    sm: 'w-4 h-4 text-[8px]',
    md: 'w-6 h-6 text-[10px]',
    lg: 'w-8 h-8 text-[12px]',
  };

  const rarityNames = ['', 'Common', 'Normal', 'Rare', 'Epic', 'Legendary'];
  const colors = rarityColors[Math.min(rarity, 5)] ?? rarityColors[1];

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded
      ${colors.bg} ${colors.text} ${colors.glow}
    `}>
      <span className={`font-bold ${sizeClasses[size]}`}>
        {rarity}
      </span>
      {showLabel && (
        <span className={`text-[10px] ${size === 'sm' ? 'hidden' : ''}`}>
          {rarityNames[rarity]}
        </span>
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`
        ${sizeConfig[size]}
        border-t-[#ffd66e] border-r-transparent border-b-transparent border-l-transparent
        rounded-full animate-spin
      `} />
      {text && (
        <p className="text-[12px] text-[#8a7a6a] animate-pulse">{text}</p>
      )}
    </div>
  );
}

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

export function ShimmerButton({
  variant = 'primary',
  loading = false,
  shimmer = true,
  children,
  className = '',
  disabled,
  ...props
}: ShimmerButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#4a6020] via-[#6a8530] to-[#4a6020] border-[#8aa040]',
    secondary: 'bg-gradient-to-r from-[#3a2820] via-[#4a3830] to-[#3a2820] border-[#5a4840]',
    danger: 'bg-gradient-to-r from-[#6a2020] via-[#8a3030] to-[#6a2020] border-[#aa4040]',
  };

  return (
    <button
      className={`
        relative overflow-hidden
        px-4 py-2 rounded text-white font-bold text-[14px]
        border transition-all duration-200
        hover:brightness-110 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        btn-press
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {shimmer && !loading && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
}

interface ResourceDisplayProps {
  gems?: number;
  zel?: number;
  karma?: number;
  compact?: boolean;
  animated?: boolean;
}

function ResourceItem({ icon, value, label, color }: { icon: React.ReactNode; value?: number; label: string; color: string }) {
  if (value === undefined) return null;

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg
      bg-[#1a0a05] border border-[#3a2820]
    `}>
      <div className={color}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-white">
          {value.toLocaleString()}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#6a5a4a]">
          {label}
        </span>
      </div>
    </div>
  );
}

export function ResourceDisplay({ gems, zel, karma, compact = false, animated = true }: ResourceDisplayProps) {
  return (
    <div className="flex gap-2">
      <ResourceItem icon={<Gem size={16} />} value={gems} label="Gems" color="text-[#00ffcc]" />
      <ResourceItem icon={<Zap size={16} />} value={zel} label="Zel" color="text-[#ffd66e]" />
      <ResourceItem icon={<Star size={16} />} value={karma} label="Karma" color="text-[#b388ff]" />
    </div>
  );
}