'use client';

import React from 'react';
import { EvidenceItem } from '@/types';
import { EvidenceCard } from './EvidenceCard';
import { ShieldCheck } from 'lucide-react';

interface EvidenceListProps {
  evidence: EvidenceItem[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800">No security warnings detected</p>
        <p className="text-xs text-slate-500 mt-1">This input did not trigger risk threshold rules.</p>
      </div>
    );
  }

  const hasRiskSignals = evidence.some(e => e.status === 'HIGH' || e.status === 'SUSPICIOUS');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {hasRiskSignals ? 'Why we flagged this' : 'Extracted Evidence & Verification Signals'}
          </h3>
          <p className="text-xs text-slate-500">Key security signals extracted during multi-layered verification</p>
        </div>
        <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {evidence.length} Signals Inspected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item, index) => (
          <EvidenceCard key={item.id || index} evidence={item} index={index} />
        ))}
      </div>
    </div>
  );
};
