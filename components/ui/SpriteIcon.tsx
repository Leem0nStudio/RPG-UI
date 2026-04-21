import React from 'react';

const SPRITE_ICON_URL = process.env.NEXT_PUBLIC_SPRITE_ICON_URL || '/assets/ui/icons/default.png';

export const SpriteIcon = ({ col, row, size = 32, className = '' }: { col: number, row: number, size?: number | string, className?: string }) => (
  <div 
    className={`shrink-0 overflow-hidden ${className}`}
    style={{
      width: size,
      height: size,
      backgroundImage: `url('${SPRITE_ICON_URL}')`,
      backgroundSize: '400% 400%',
      backgroundPosition: `calc(${col} * 100% / 3) calc(${row} * 100% / 3)`,
      imageRendering: 'pixelated'
    }}
  />
);
