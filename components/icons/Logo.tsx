import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="FashUp Home">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g>
          {/* Hanger body */}
          <path
            d="M6 24H26L16 14L6 24Z"
            stroke="#1A1A1A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hanger hook */}
          <path
            d="M16 14V11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11"
            stroke="#1A1A1A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* AI Sparkles */}
          <path
            d="M9 17L10.5 19L9 21L7.5 19Z"
            fill="#6C63FF"
          />
          <path
            d="M23 17L24.5 19L23 21L21.5 19Z"
            fill="#6C63FF"
          />
          <path
            d="M16 18L17 19.5L18 20L17 20.5L16 22L15 20.5L14 20L15 19.5Z"
            fill="#6C63FF"
          />
          {/* New sparkle on hook tip */}
          <path
            d="M9 8.5L10 10L11.5 11L10 12L9 13.5L8 12L6.5 11L8 10Z"
            fill="#6C63FF"
          />
        </g>
      </svg>
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary tracking-tight">
        FashUp
      </h1>
    </div>
  );
};
