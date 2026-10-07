'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Link as LinkIcon, Phone, ArrowRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { InputType } from '@/types';

interface ScanDropzoneProps {
  onSelectInput: (inputName: string, type: InputType, fileObj?: File) => void;
  isCompact?: boolean;
}

export const ScanDropzone: React.FC<ScanDropzoneProps> = ({ onSelectInput, isCompact = false }) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'URL' | 'PHONE'>('FILE');
  const [urlInput, setUrlInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    if (!['PDF', 'PNG', 'JPG', 'JPEG'].includes(ext)) {
      setErrorMessage('Supported formats: PDF, PNG, JPG');
      return;
    }
    setErrorMessage(null);
    const fileType: InputType = ext === 'PDF' ? 'PDF' : ext === 'PNG' ? 'PNG' : 'JPG';
    onSelectInput(file.name, fileType, file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage('Please enter a valid URL');
      return;
    }
    setErrorMessage(null);
    onSelectInput(urlInput.trim(), 'URL');
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      setErrorMessage('Please enter a contact number');
      return;
    }
    setErrorMessage(null);
    onSelectInput(phoneInput.trim(), 'CONTACT');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Input Mode Selector Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/70 p-1.5 space-x-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => { setActiveTab('FILE'); setErrorMessage(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'FILE'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Upload Document / Image</span>
        </button>

        <button
          onClick={() => { setActiveTab('URL'); setErrorMessage(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'URL'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <LinkIcon className="w-4 h-4 text-slate-700" />
          <span>Analyze URL</span>
        </button>

        <button
          onClick={() => { setActiveTab('PHONE'); setErrorMessage(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'PHONE'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Phone className="w-4 h-4 text-slate-700" />
          <span>Paste Phone / Contact</span>
        </button>
      </div>

      <div className="p-6">
        {/* FILE UPLOAD TAB */}
        {activeTab === 'FILE' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-slate-800 bg-slate-50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-700 shadow-sm">
              <Upload className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-base font-bold text-slate-900">Drop a suspicious file here</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Supported formats: <span className="font-semibold text-slate-700">PDF • PNG • JPG</span>
            </p>

            <button
              type="button"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <span>Browse files</span>
            </button>
          </div>
        )}

        {/* URL TAB */}
        {activeTab === 'URL' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Suspicious Link or Domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. https://northstar-account-check.example-security-verify.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Analyze URL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PHONE TAB */}
        {activeTab === 'PHONE' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Suspicious Phone Number or Sender String
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Verify Contact Number</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" /> Files are processed strictly for verification
        </span>
        <span>End-to-End Privacy Protected</span>
      </div>
    </div>
  );
};
