'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, RotateCcw, CheckSquare, Download, ExternalLink } from 'lucide-react';
import { RiskLevel } from '@/types';

interface RecommendedActionProps {
  primaryAction: string;
  secondaryInstruction: string;
  riskLevel: RiskLevel;
}

export const RecommendedAction: React.FC<RecommendedActionProps> = ({
  primaryAction,
  secondaryInstruction,
  riskLevel,
}) => {
  const isHighRisk = riskLevel === 'HIGH';
  const isSuspicious = riskLevel === 'SUSPICIOUS';

  return (
    <div
      className={`rounded-xl p-6 border shadow-sm space-y-4 ${
        isHighRisk
          ? 'bg-red-50/70 border-red-200 text-red-950'
          : isSuspicious
          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
              isHighRisk
                ? 'bg-red-600 text-white'
                : isSuspicious
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">What you should do</h3>
            <p className="text-sm font-semibold mt-1 leading-snug">{primaryAction}</p>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-lg bg-white/90 border border-slate-200/80 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-slate-700" /> Recommended Safeguards:
        </div>
        <p className="leading-relaxed">{secondaryInstruction}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/scan"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start new scan</span>
        </Link>

        <button
          onClick={() => alert('Security investigation report generated. Download ready.')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export forensic report</span>
        </button>
      </div>
    </div>
  );
};
