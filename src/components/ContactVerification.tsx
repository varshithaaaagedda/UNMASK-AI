'use client';

import React, { useState } from 'react';
import { ContactVerification as ContactVerificationType } from '@/types';
import { PhoneCall, Building2, AlertTriangle, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Database } from 'lucide-react';

interface ContactVerificationProps {
  data: ContactVerificationType;
}

export const ContactVerification: React.FC<ContactVerificationProps> = ({ data }) => {
  const [showVerificationMethod, setShowVerificationMethod] = useState(false);

  const isMismatch = data.status === 'MISMATCH';
  const isMatch = data.status === 'MATCH';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-slate-700" /> Contact Verification
          </h3>
          <p className="text-xs text-slate-500">Cross-referencing extracted contact numbers against institutional directory databases</p>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-bold border ${
            isMismatch
              ? 'bg-red-50 text-red-700 border-red-200'
              : isMatch
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {isMismatch ? (
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
          ) : isMatch ? (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />
          )}
          {data.status}
        </span>
      </div>

      {/* Visual Side-by-Side Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Claimed Organization */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> Claimed Entity
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono truncate">
            {data.claimedOrganization || 'Unverified entity'}
          </div>
        </div>

        {/* Phone Found in Document */}
        <div
          className={`border rounded-lg p-3.5 space-y-1 ${
            isMismatch ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Phone Found in Document</span>
            {isMismatch && <span className="text-[10px] text-red-700 font-bold">CONFLICT</span>}
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            {data.phoneFound || 'None detected'}
          </div>
        </div>

        {/* Official Verified Contact */}
        <div
          className={`border rounded-lg p-3.5 space-y-1 ${
            isMismatch ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Official Verified Contact</span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <Database className="w-3 h-3" /> VERIFIED
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            {data.verifiedOrganizationContact || 'Not found'}
          </div>
        </div>
      </div>

      {/* "How was this verified?" expandable explanation */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowVerificationMethod(!showVerificationMethod)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>How was this verified?</span>
          {showVerificationMethod ? (
            <ChevronUp className="w-3.5 h-3.5 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          )}
        </button>

        {showVerificationMethod && (
          <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-600" /> Verification Methodology & Sources
            </div>
            <p className="leading-relaxed text-slate-600">
              UNMASK performs automated optical character recognition (OCR) and pattern matching to extract phone numbers and corporate identifiers. Extracted data is cross-referenced in real-time against verified enterprise directory registries, WHOIS records, and official regulatory filings.
            </p>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
              {data.verificationDetails}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
