'use client';

import React, { createContext, useContext, useState } from 'react';
import { AnalysisResult, HistoryItem, InputType } from '@/types';
import { INITIAL_MOCK_RESULTS, RECENT_SCANS_LIST, createDynamicAnalysis } from '@/data/mockData';
import { scanFileApi, mapBackendToFrontendResult } from '@/services/api';

interface ScanContextType {
  results: Record<string, AnalysisResult>;
  history: HistoryItem[];
  getScanById: (id: string) => AnalysisResult | undefined;
  runScanApi: (file: File) => Promise<AnalysisResult>;
  runScan: (inputName: string, inputType: InputType) => AnalysisResult;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<Record<string, AnalysisResult>>(INITIAL_MOCK_RESULTS);
  const [history, setHistory] = useState<HistoryItem[]>(RECENT_SCANS_LIST);

  const getScanById = (id: string): AnalysisResult | undefined => {
    return results[id];
  };

  const runScanApi = async (file: File): Promise<AnalysisResult> => {
    const backendData = await scanFileApi(file);
    const result = mapBackendToFrontendResult(backendData);

    setResults(prev => ({
      ...prev,
      [result.id]: result
    }));

    const newHistoryItem: HistoryItem = {
      id: result.id,
      filename: result.filename,
      type: result.fileType,
      risk: result.riskLevel,
      detectedIssue: result.evidence[0]?.title || result.primaryFinding || 'Multi-signal analysis',
      date: 'Just now'
    };

    setHistory(prev => [newHistoryItem, ...prev]);

    return result;
  };

  const runScan = (inputName: string, inputType: InputType): AnalysisResult => {
    const newResult = createDynamicAnalysis(inputName, inputType);

    setResults(prev => ({
      ...prev,
      [newResult.id]: newResult
    }));

    const newHistoryItem: HistoryItem = {
      id: newResult.id,
      filename: newResult.filename,
      type: newResult.fileType,
      risk: newResult.riskLevel,
      detectedIssue: newResult.evidence[0]?.title || 'Multi-signal analysis',
      date: 'Just now'
    };

    setHistory(prev => [newHistoryItem, ...prev]);

    return newResult;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ScanContext.Provider
      value={{
        results,
        history,
        getScanById,
        runScanApi,
        runScan,
        clearHistory,
        deleteHistoryItem
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
