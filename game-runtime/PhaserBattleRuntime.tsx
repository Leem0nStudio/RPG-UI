'use client';

import { useEffect, useRef } from 'react';

export function PhaserBattleRuntime() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let game: import('phaser').Game | null = null;
    let active = true;

    async function mountGame() {
      const Phaser = (await import('phaser')).default;
      const { BattlePreviewScene } = await import('@/game-runtime/phaser/BattlePreviewScene');
      if (!active || !containerRef.current) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 360,
        height: 540,
        parent: containerRef.current,
        backgroundColor: '#120d09',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BattlePreviewScene],
      });
    }

    mountGame();

    return () => {
      active = false;
      game?.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="w-full rounded-[12px] overflow-hidden border-[2px] border-[var(--color-accent-gold)] shadow-[var(--shadow-high)]" />;
}
