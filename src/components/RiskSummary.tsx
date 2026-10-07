'use client';

import React from 'react';
import { RiskSummaryMetrics } from '@/types';
import { Shield, UserX, PhoneOff, QrCode, Zap, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface RiskSummaryProps {
  metrics: RiskSummaryMetrics;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({ metrics }) => {
  const getBadgeStyle = (value: string, type: 'identity' | 'contact' | 'qr' | 'social') => {
    if (value === 'VERIFIED' || value === 'MATCH' || value === 'SAFE' || value === 'LOW') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (value === 'NOT VERIFIED' || value === 'MISMATCH' || value === 'HIGH RISK' || value === 'MALICIOUS' || value === 'HIGH') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-slate-700" /> Executive Risk Summary
        </h3>
        <RiskBadge level={metrics.risk} size="md" />
      </div>

      <div className="space-y-2.5">
        {/* Identity Metric */}
        <div className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <UserX className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-xs">Identity</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
              metrics.identity,
              'identity'
            )}`}
          >
            {metrics.identity}
          </span>
        </div>

        {/* Contact Metric */}
        <div className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <PhoneOff className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-xs">Contact Number</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
              metrics.contact,
              'contact'
            )}`}
          >
            {metrics.contact}
          </span>
        </div>

        {/* QR Code Metric */}
        <div className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <QrCode className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-xs">QR / Embedded Link</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
              metrics.qr,
              'qr'
            )}`}
          >
            {metrics.qr}
          </span>
        </div>

        {/* Social Engineering Metric */}
        <div className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <Zap className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-xs">Social Engineering Pressure</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
              metrics.socialEngineering,
              'social'
            )}`}
          >
            {metrics.socialEngineering}
          </span>
        </div>
      </div>

      <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
        <span>Verified via 4 signal layers</span>
        <span>Deterministic Rule Set 1.4</span>
      </div>
    </div>
  );
};
