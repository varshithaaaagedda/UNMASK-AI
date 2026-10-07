'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HistoryItem, RiskLevel } from '@/types';
import { RiskBadge } from './RiskBadge';
import { FileText, Image as ImageIcon, Link as LinkIcon, Phone, Search, Trash2, ArrowRight, Filter } from 'lucide-react';

interface ScanHistoryTableProps {
  history: HistoryItem[];
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export const ScanHistoryTable: React.FC<ScanHistoryTableProps> = ({
  history,
  onDelete,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF':
        return FileText;
      case 'PNG':
      case 'JPG':
        return ImageIcon;
      case 'URL':
        return LinkIcon;
      case 'CONTACT':
        return Phone;
      default:
        return FileText;
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detectedIssue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || item.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search history by filename or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <span className="font-semibold text-slate-500 text-[11px] mr-1">Filter:</span>
            {(['ALL', 'HIGH', 'SUSPICIOUS', 'SAFE'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                  riskFilter === lvl
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {onClearAll && history.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-700 font-semibold transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              <th className="py-3 px-4">File / Input</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Detected Issue</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No scan records matching your filter.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => {
                const IconComponent = getIconForType(item.type);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link
                        href={`/results/${item.id}`}
                        className="flex items-center space-x-2.5 font-bold group-hover:text-slate-900"
                      >
                        <div className="p-1.5 rounded bg-slate-100 text-slate-700">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono text-xs hover:underline truncate max-w-xs">
                          {item.filename}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 font-semibold">
                      {item.type}
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={item.risk} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.detectedIssue}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.date}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/results/${item.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-900 hover:underline bg-slate-100 px-2.5 py-1 rounded"
                        >
                          <span>Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
