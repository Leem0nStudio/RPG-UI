'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, Gift, Star, Trophy, Gem, Zap, Sparkles } from 'lucide-react';

type NotificationType = 'reward' | 'achievement' | 'levelup' | 'rare' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number | null;
  rarity?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showReward: (title: string, message: string, icon?: React.ReactNode) => void;
  showAchievement: (title: string, message?: string) => void;
  showLevelUp: (newLevel: number, unitName?: string) => void;
  showRare: (title: string, rarity: number) => void;
  showGems: (amount: number) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idCounter = useRef(0);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif_${++idCounter.current}_${Date.now()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 3000,
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.duration != null && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const showReward = useCallback((title: string, message: string, icon?: React.ReactNode) => {
    showNotification({
      type: 'reward',
      title,
      message,
      icon: icon ?? <Gift size={20} className="text-[#ffd66e]" />,
      duration: 3000,
    });
  }, [showNotification]);

  const showAchievement = useCallback((title: string, message?: string) => {
    showNotification({
      type: 'achievement',
      title,
      message,
      icon: <Trophy size={20} className="text-[#ffd700]" />,
      duration: 4000,
    });
  }, [showNotification]);

  const showLevelUp = useCallback((newLevel: number, unitName?: string) => {
    showNotification({
      type: 'levelup',
      title: unitName ? `${unitName} Level Up!` : 'Level Up!',
      message: `Reached level ${newLevel}`,
      icon: <Star size={20} className="text-[#00ffcc]" />,
      duration: 3500,
    });
  }, [showNotification]);

  const showRare = useCallback((title: string, rarity: number) => {
    const rarityColors = ['text-gray-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-orange-400'];
    showNotification({
      type: 'rare',
      title,
      message: `Rarity: ${rarity}`,
      icon: <Sparkles size={20} className={rarityColors[Math.min(rarity, 5) - 1]} />,
      rarity,
      duration: 4000,
    });
  }, [showNotification]);

  const showGems = useCallback((amount: number) => {
    showNotification({
      type: 'reward',
      title: `+${amount} Gems`,
      icon: <Gem size={20} className="text-[#00ffcc]" />,
      duration: 2500,
    });
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showReward,
      showAchievement,
      showLevelUp,
      showRare,
      showGems,
      notifications,
      removeNotification,
    }}>
      {children}
      <NotificationToast notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationToast({ notifications, onRemove }: { notifications: Notification[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification, index) => (
        <ToastItem key={notification.id} notification={notification} onRemove={onRemove} index={index} />
      ))}
    </div>
  );
}

function ToastItem({ notification, onRemove, index }: { notification: Notification; onRemove: (id: string) => void; index: number }) {
  const typeStyles: Record<NotificationType, string> = {
    reward: 'border-[#ffd66e] bg-gradient-to-r from-[#2a2010] to-[#1a1508]',
    achievement: 'border-[#ffd700] bg-gradient-to-r from-[#2a2510] to-[#1a1808]',
    levelup: 'border-[#00ffcc] bg-gradient-to-r from-[#102a25] to-[#081a15]',
    rare: 'border-[#b388ff] bg-gradient-to-r from-[#201a30] to-[#100a18]',
    info: 'border-[#6a5a4a] bg-gradient-to-r from-[#1a1510] to-[#0d0a05]',
  };

  const typeGlow: Record<NotificationType, string> = {
    reward: 'shadow-[0_0_15px_rgba(255,214,110,0.3)]',
    achievement: 'shadow-[0_0_15px_rgba(255,215,0,0.3)]',
    levelup: 'shadow-[0_0_15px_rgba(0,255,204,0.3)]',
    rare: 'shadow-[0_0_15px_rgba(179,136,255,0.3)]',
    info: '',
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 p-3 rounded-lg border
        ${typeStyles[notification.type]} ${typeGlow[notification.type]}
        animate-slideIn
        min-w-[200px] max-w-[280px]
      `}
      style={{
        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="flex-shrink-0">
        {notification.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white truncate">
          {notification.title}
        </div>
        {notification.message && (
          <div className="text-[11px] text-[#8a7a6a] truncate">
            {notification.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 p-1 text-[#6a5a4a] hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}