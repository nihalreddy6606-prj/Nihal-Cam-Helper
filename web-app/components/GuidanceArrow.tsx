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
      className="transition-all duration-500 ease-in-out"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg
        width="32" height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/60"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
}
