'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Info } from 'lucide-react';
import { BackendAIAssessment } from '@/types';

interface AIExplanationProps {
  explanation: string;
  assessment?: BackendAIAssessment;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({ explanation, assessment }) => {
  const headline = assessment?.headline || 'AI Evidence Reasoning';
  const summary = assessment?.summary || explanation;
  const keyFindings = assessment?.key_findings || [];
  const confidence = (assessment?.confidence || 'medium').toUpperCase();
  const recommendedAction = assessment?.recommended_action;
  const reasoningBasis = assessment?.reasoning_basis || [];

  const confidenceBadgeColor =
    confidence === 'HIGH'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : confidence === 'MEDIUM'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
      {/* Header with Title & Confidence Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">UNMASK's Assessment</h3>
            <p className="text-xs text-slate-500">AI evidence reasoning engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Confidence:</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${confidenceBadgeColor} font-mono uppercase tracking-wider`}>
            {confidence}
          </span>
        </div>
      </div>

      {/* Headline & Summary Narrative */}
      <div className="space-y-2 bg-slate-50/80 p-4 rounded-lg border border-slate-200/70">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{headline}</span>
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      {/* Key Findings List */}
      {keyFindings.length > 0 && (
        <div className="space-y-2 pt-1">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Key Findings
          </h5>
          <ul className="space-y-2">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-slate-200">
                  {idx + 1}
                </span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action Box */}
      {recommendedAction && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-1">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span>Recommended Action</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-normal">
            {recommendedAction}
          </p>
        </div>
      )}

      {/* Reasoning Basis Evidence References */}
      {reasoningBasis.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 font-mono mb-1.5">Reasoning Basis:</div>
          <div className="flex flex-wrap gap-1.5">
            {reasoningBasis.map((basis, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded border border-slate-200 font-sans"
              >
                {basis}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
        <span>Assessed using evidence-oriented signal weighting</span>
        <span className="font-mono">Engine: MockReasoningProvider</span>
      </div>
    </div>
  );
};
