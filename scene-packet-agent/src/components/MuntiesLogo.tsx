import React from 'react';

export function MuntiesLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Munties AI Badge Logo */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-blue-600 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative w-11 h-11 bg-slate-900 rounded-2xl border border-amber-400/50 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-heading">
            MUNTIES <span className="text-amber-600 font-black">AI</span>
          </span>
          <span className="text-[11px] bg-amber-500/15 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
            GYSH Executive Suite
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="font-medium">Scene Packet Agent</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">Powered by Munties AI Agents</span>
        </div>
      </div>
    </div>
  );
}
