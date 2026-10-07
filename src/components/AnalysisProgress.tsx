'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle, Cpu } from 'lucide-react';

interface AnalysisProgressProps {
  filename: string;
  isComplete: boolean;
  onFinish: () => void;
}

const STEPS = [
  'Analyzing document',
  'Extracting text',
  'Detecting QR codes',
  'Extracting contact information',
  'Analyzing risk',
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  filename,
  isComplete,
  onFinish,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 2) {
          return prev + 1;
        } else if (isComplete && prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) {
      setCurrentStepIndex(STEPS.length - 1);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [isComplete, onFinish]);

  const progressPercentage = isComplete
    ? 100
    : Math.min(95, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-xl mx-auto shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security Verification Engine</h3>
            <p className="text-xs font-mono text-slate-500 truncate max-w-xs">{filename}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {progressPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-slate-900 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step List */}
      <div className="space-y-3 pt-2">
        {STEPS.map((stepLabel, idx) => {
          const isDone = idx < currentStepIndex || (isComplete && idx === currentStepIndex);
          const isCurrent = idx === currentStepIndex && !isComplete;

          return (
            <div
              key={stepLabel}
              className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs font-mono transition-all ${
                isCurrent
                  ? 'bg-slate-50 font-bold text-slate-900 border border-slate-200'
                  : isDone
                  ? 'text-slate-600 font-medium'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <span className="flex-1">{stepLabel}</span>
              {isDone && <span className="text-[10px] text-emerald-700 font-bold">DONE</span>}
              {isCurrent && <span className="text-[10px] text-slate-600 animate-pulse">PROCESSING</span>}
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center text-[11px] text-slate-400">
        UNMASK AI • Multi-Signal Scam & Impersonation Engine
      </div>
    </div>
  );
};
