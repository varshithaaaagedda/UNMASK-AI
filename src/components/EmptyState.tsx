'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText = 'Start New Scan',
  actionHref = '/scan',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
        <ShieldCheck className="w-6 h-6 text-slate-700" />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
};
