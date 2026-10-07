'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanDropzone } from '@/components/ScanDropzone';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { useScan } from '@/context/ScanContext';
import { FileText, Trash2, ArrowRight, Cpu, AlertCircle } from 'lucide-react';
import { InputType, AnalysisResult } from '@/types';

export default function ScanPage() {
  const router = useRouter();
  const { runScanApi, runScan } = useScan();

  const [selectedInput, setSelectedInput] = useState<{
    name: string;
    type: InputType;
    fileObj?: File;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [isApiComplete, setIsApiComplete] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputSelect = (inputName: string, type: InputType, fileObj?: File) => {
    setSelectedInput({ name: inputName, type, fileObj });
    setErrorMessage(null);
  };

  const handleRemove = () => {
    setSelectedInput(null);
    setIsScanning(false);
    setIsApiComplete(false);
    setGeneratedResult(null);
    setErrorMessage(null);
  };

  const handleStartAnalysis = async () => {
    if (!selectedInput) return;
    setIsScanning(true);
    setIsApiComplete(false);
    setErrorMessage(null);

    try {
      let result: AnalysisResult;

      if (selectedInput.fileObj) {
        // Real API Call with Uploaded File
        result = await runScanApi(selectedInput.fileObj);
      } else {
        // Fallback or text string scan: create a synthetic File to send to FastAPI if it's text/url
        const syntheticFile = new File(
          [selectedInput.name],
          selectedInput.name.endsWith('.png') || selectedInput.name.endsWith('.pdf') || selectedInput.name.endsWith('.jpg')
            ? selectedInput.name
            : `${selectedInput.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
          { type: 'image/png' }
        );
        try {
          result = await runScanApi(syntheticFile);
        } catch {
          // If synthetic file call fails, fallback to local dynamic scanner
          result = runScan(selectedInput.name, selectedInput.type);
        }
      }

      setGeneratedResult(result);
      setIsApiComplete(true);
    } catch (err: any) {
      setIsScanning(false);
      setIsApiComplete(false);
      setErrorMessage(
        err.message || "UNMASK couldn't analyze this file. Please check the file type and try again."
      );
    }
  };

  const handleScanFinish = () => {
    if (generatedResult) {
      router.push(`/results/${generatedResult.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          New Security Scan
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Upload a document or image and we'll look for signs of impersonation, suspicious contact information, malicious links, and social engineering.
        </p>
      </div>

      {!isScanning ? (
        <div className="space-y-6">
          {/* Dropzone or Selected File Preview */}
          {!selectedInput ? (
            <ScanDropzone onSelectInput={handleInputSelect} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 font-mono truncate">
                      {selectedInput.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Type: <span className="font-semibold text-slate-700">{selectedInput.type}</span> • Size:{' '}
                      <span className="font-semibold text-slate-700">
                        {selectedInput.fileObj
                          ? `${(selectedInput.fileObj.size / (1024 * 1024)).toFixed(2)} MB`
                          : '1.2 MB'}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemove}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  title="Remove input"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={handleStartAnalysis}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Analyze with UNMASK AI</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Live Scanning Progress Engine */
        <AnalysisProgress
          filename={selectedInput?.name || 'Uploaded_Document.pdf'}
          isComplete={isApiComplete}
          onFinish={handleScanFinish}
        />
      )}
    </div>
  );
}
