'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/types';
import { RiskBadge } from './RiskBadge';
import { Phone, Link2, AlertTriangle, UserX, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  index: number;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, index }) => {
  const [expanded, setExpanded] = useState(false);

  const getCategoryIcon = (category: EvidenceItem['category']) => {
    switch (category) {
      case 'CONTACT':
        return Phone;
      case 'URL':
        return Link2;
      case 'LANGUAGE':
        return AlertTriangle;
      case 'IDENTITY':
        return UserX;
      default:
        return FileText;
    }
  };

  const IconComponent = getCategoryIcon(evidence.category);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
            <IconComponent className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 font-medium">#{index + 1}</span>
              <h4 className="text-sm font-bold text-slate-900">{evidence.title}</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {evidence.explanation}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <RiskBadge level={evidence.status} size="sm" />
        </div>
      </div>

      {evidence.details && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>{expanded ? 'Hide forensic breakdown' : 'View forensic details'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-mono leading-relaxed space-y-1">
              <div className="font-sans font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                Technical Extraction Output:
              </div>
              <p>{evidence.details}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
