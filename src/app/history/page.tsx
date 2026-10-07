'use client';

import React from 'react';
import Link from 'next/link';
import { useScan } from '@/context/ScanContext';
import { ScanHistoryTable } from '@/components/ScanHistoryTable';
import { EmptyState } from '@/components/EmptyState';
import { History, Plus } from 'lucide-react';

export default function HistoryPage() {
  const { history, deleteHistoryItem, clearHistory } = useScan();

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-slate-800" /> Scan History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of analyzed documents, links, and contact verifications
          </p>
        </div>

        <Link
          href="/scan"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New security scan</span>
        </Link>
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No Scan History Found"
          description="You haven't run any document or contact scans yet. Perform a scan to generate your first forensic report."
          actionText="Start First Scan"
          actionHref="/scan"
        />
      ) : (
        <ScanHistoryTable
          history={history}
          onDelete={deleteHistoryItem}
          onClearAll={clearHistory}
        />
      )}
    </div>
  );
}
