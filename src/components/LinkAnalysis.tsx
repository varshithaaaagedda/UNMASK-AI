'use client';

import React from 'react';
import { LinkAnalysis as LinkAnalysisType } from '@/types';
import { QrCode, Globe, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface LinkAnalysisProps {
  data: LinkAnalysisType;
}

export const LinkAnalysis: React.FC<LinkAnalysisProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Links & QR Codes</h3>
            <p className="text-xs text-slate-500">Destination inspection and domain reputation analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {data.hasQrCode && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-semibold rounded-md border border-slate-200 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-slate-500" /> QR Code Detected
            </span>
          )}
          <RiskBadge level={data.status} size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scanned Destination URL */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Target Destination URL
          </div>
          <div className={`font-mono text-xs font-bold break-all bg-white p-2 rounded border border-slate-200 ${
            data.status === 'HIGH' ? 'text-red-700' : data.status === 'SUSPICIOUS' ? 'text-amber-800' : data.status === 'SAFE' ? 'text-emerald-800' : 'text-slate-800'
          }`}>
            {data.qrDestination || 'No links found'}
          </div>
        </div>

        {/* Expected Official Domain */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3" /> Claimed Official Domain
          </div>
          <div className="font-mono text-xs font-bold text-emerald-800 break-all bg-white p-2 rounded border border-slate-200">
            {data.officialDomain || 'Unverified'}
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Domain Audit Finding:</span> {data.notes}
          </div>
        </div>
      )}
    </div>
  );
};
