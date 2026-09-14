import React from 'react';

export type ArrowDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export function GuidanceArrow({ direction }: { direction: ArrowDirection }) {
  if (direction === 'none') return null;

  const rotation = {
    up: 0,
    down: 180,
    left: -90,
    right: 90,
    none: 0,
  }[direction];

  return (
    <div
      className="transition-all duration-300"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg
        width="40" height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
}
