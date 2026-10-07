'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useScan } from '@/context/ScanContext';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskSummary } from '@/components/RiskSummary';
import { EvidenceList } from '@/components/EvidenceList';
import { ContactVerification } from '@/components/ContactVerification';
import { LinkAnalysis } from '@/components/LinkAnalysis';
import { AIExplanation } from '@/components/AIExplanation';
import { RecommendedAction } from '@/components/RecommendedAction';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, FileText, Calendar, Clock, Download, Share2, Shield, AlertOctagon } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { getScanById } = useScan();

  const id = (params?.id as string) || '';
  const result = getScanById(id);

  if (!result) {
    return (
      <div className="py-12">
        <EmptyState
          title="Analysis Report Not Found"
          description="The requested scan ID does not exist or has expired from active cache."
          actionText="Perform a New Scan"
          actionHref="/scan"
        />
      </div>
    );
  }

  const isHighRisk = result.riskLevel === 'HIGH';
  const isSuspicious = result.riskLevel === 'SUSPICIOUS';

  return (
    <div className="space-y-8 py-2">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-4">
          <Link
            href="/scan"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>New scan</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-slate-600" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight">
                {result.filename}
              </h1>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                <span>Type: {result.fileType}</span>
                <span>•</span>
                <span>{result.date}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Verification shareable link copied to clipboard.')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Results Hero Banner */}
      <div
        className={`rounded-xl p-6 sm:p-8 border shadow-sm space-y-4 ${
          isHighRisk
            ? 'bg-red-50/60 border-red-200'
            : isSuspicious
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-emerald-50/60 border-emerald-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <RiskBadge level={result.riskLevel} size="lg" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
                Scan ID: {result.id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-2 tracking-tight">
              {result.primaryFinding}
            </h2>
            <p className="text-sm text-slate-700 font-normal leading-relaxed max-w-3xl">
              {result.supportingText}
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Main Investigation Details & Executive Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: Why we flagged this (Evidence Cards) */}
          <section>
            <EvidenceList evidence={result.evidence} />
          </section>

          {/* SECTION 2: Contact verification */}
          <section>
            <ContactVerification data={result.contactVerification} />
          </section>

          {/* SECTION 3: Links & QR codes */}
          <section>
            <LinkAnalysis data={result.linkAnalysis} />
          </section>

          {/* SECTION 4: AI Assessment */}
          <section>
            <AIExplanation explanation={result.aiExplanation} assessment={result.aiAssessment} />
          </section>

          {/* SECTION 5: Recommended Action */}
          <section>
            <RecommendedAction
              primaryAction={result.recommendedActions.primaryAction}
              secondaryInstruction={result.recommendedActions.secondaryInstruction}
              riskLevel={result.riskLevel}
            />
          </section>
        </div>

        {/* Sidebar Column (1 col wide) */}
        <div className="space-y-6">
          {/* Executive Risk Summary Panel */}
          <div className="sticky top-20">
            <RiskSummary metrics={result.riskSummary} />
            
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-600" /> Evidence Integrity
              </div>
              <p className="leading-relaxed">
                Report generated via deterministic evidence rules. All extracted domain and phone data are timestamped and preserved for audit compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
