import React from "react";
import { cn } from "@/utils/cn";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left",
        className
      )}
    >
      <svg
        viewBox="0 0 72 72"
        className="h-16 w-16 shrink-0 drop-shadow-[0_10px_24px_rgba(16,185,129,0.22)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="brand-bg" x1="12" y1="8" x2="58" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#111827" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient
            id="brand-highlight"
            x1="21"
            y1="19"
            x2="53"
            y2="52"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="brand-warn" x1="30" y1="15" x2="41" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="64" height="64" rx="22" fill="url(#brand-bg)" />
        <rect x="4" y="4" width="64" height="64" rx="22" fill="none" stroke="#334155" strokeWidth="1.5" />
        <rect x="12" y="12" width="48" height="48" rx="16" fill="none" stroke="rgba(255,255,255,0.07)" />

        <rect x="15" y="16" width="12" height="12" rx="4" fill="#1f2937" stroke="#475569" strokeWidth="1.2" />
        <rect x="30" y="16" width="12" height="12" rx="4" fill="url(#brand-warn)" stroke="#fcd34d" strokeWidth="1.2" />
        <rect x="45" y="16" width="12" height="12" rx="4" fill="#1f2937" stroke="#475569" strokeWidth="1.2" />
        <rect x="15" y="31" width="12" height="12" rx="4" fill="#1f2937" stroke="#475569" strokeWidth="1.2" />
        <rect x="30" y="31" width="12" height="12" rx="4" fill="url(#brand-highlight)" stroke="#99f6e4" strokeWidth="1.2" />
        <rect x="45" y="31" width="12" height="12" rx="4" fill="#1f2937" stroke="#475569" strokeWidth="1.2" />

        <path
          d="M20 46.5 28.5 55 50.5 33"
          fill="none"
          stroke="url(#brand-highlight)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />
        <path
          d="M20 46.5 28.5 55 50.5 33"
          fill="none"
          stroke="#ecfeff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
      </svg>

      <div className="flex flex-col items-center sm:items-start">
        <span className="text-[2.2rem] font-black tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-[2.75rem]">
          <span>Termo</span>
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Certeiro
          </span>
        </span>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
          Solver para Termoo e Wordle
        </span>
      </div>
    </div>
  );
}
