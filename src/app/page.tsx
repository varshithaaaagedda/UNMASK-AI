'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScanDropzone } from '@/components/ScanDropzone';
import { useScan } from '@/context/ScanContext';
import { RiskBadge } from '@/components/RiskBadge';
import {
  Shield,
  FileText,
  UserCheck,
  Phone,
  QrCode,
  Globe,
  Zap,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { InputType } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { runScanApi, runScan, history } = useScan();

  const handleInputSelect = async (inputName: string, type: InputType, fileObj?: File) => {
    if (fileObj) {
      try {
        const result = await runScanApi(fileObj);
        router.push(`/results/${result.id}`);
      } catch {
        router.push('/scan');
      }
    } else {
      const result = runScan(inputName, type);
      router.push(`/results/${result.id}`);
    }
  };

  const recentScans = history.slice(0, 3);

  const checkItems = [
    { label: 'Identity & organization', icon: UserCheck },
    { label: 'Phone & contact information', icon: Phone },
    { label: 'QR codes', icon: QrCode },
    { label: 'Links & domains', icon: Globe },
    { label: 'Social engineering signals', icon: Zap },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Reduced Hero Section - Clean SaaS Product Dashboard Header */}
      <div className="text-center space-y-1.5 pt-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Is this message trustworthy?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-xl mx-auto leading-relaxed">
          Analyze suspicious documents, screenshots, URLs, and QR codes before you act.
        </p>
      </div>

      {/* Main Scan Dropzone Component - Visual Centerpiece */}
      <div className="w-full">
        <ScanDropzone onSelectInput={handleInputSelect} isCompact={true} />
      </div>

      {/* Compact "What UNMASK checks" Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm space-y-2.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center font-mono">
          What UNMASK checks
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-700">
          {checkItems.map((item) => {
            const IconComp = item.icon;
            return (
              <div key={item.label} className="flex items-center space-x-1.5 py-0.5">
                <IconComp className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent scans</h2>
          <Link
            href="/history"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>View full history</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm overflow-hidden">
          {recentScans.map((item) => (
            <Link
              key={item.id}
              href={`/results/${item.id}`}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 font-mono truncate group-hover:underline flex items-center gap-1">
                    {item.filename}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Detected issue: <span className="text-slate-700 font-medium">{item.detectedIssue}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-3">
                <RiskBadge level={item.risk} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
