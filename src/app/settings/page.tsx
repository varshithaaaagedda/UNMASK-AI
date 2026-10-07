'use client';

import React, { useState } from 'react';
import { Settings, Shield, User, Bell, Lock, Sliders, Server, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [savedNotice, setSavedNotice] = useState(false);

  // Realistic preference states
  const [preferences, setPreferences] = useState({
    autoExpandLinks: true,
    strictIdentityCheck: true,
    fastApiEndpoint: 'http://localhost:8000/api/v1',
    notifyHighRiskOnly: true,
    emailDigest: false,
    retentionDays: '0 (No Retention)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-800" /> Settings & Engine Preferences
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure security rules, privacy safeguards, and backend verification integration settings
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Privacy Highlight Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-950">
          <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Privacy Protocol Active:</span> Your uploaded files are used only for analysis and are never shared, sold, or retained without explicit consent.
          </div>
        </div>

        {/* 1. Account Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Account & Analyst Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Analyst Name</label>
              <input
                type="text"
                disabled
                value="Security Analyst (Demo Mode)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Organization Domain</label>
              <input
                type="text"
                disabled
                value="unmask-demo.internal"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Analysis Preferences & FastAPI Integration Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Analysis Preferences</h2>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              FastAPI Connector Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">Deep QR Destination Expansion</span>
                <p className="text-slate-500 text-[11px]">Follow HTTP redirects to uncover underlying target domains.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoExpandLinks}
                onChange={(e) => setPreferences({ ...preferences, autoExpandLinks: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">Strict Institutional Registry Check</span>
                <p className="text-slate-500 text-[11px]">Flag all unverified contact numbers as potential impersonation.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.strictIdentityCheck}
                onChange={(e) => setPreferences({ ...preferences, strictIdentityCheck: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
            </div>

            {/* FastAPI Endpoint configuration placeholder */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-slate-600" /> FastAPI Backend Connector URL (Optional Integration)
              </label>
              <input
                type="text"
                value={preferences.fastApiEndpoint}
                onChange={(e) => setPreferences({ ...preferences, fastApiEndpoint: e.target.value })}
                placeholder="http://localhost:8000/api/v1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Currently operating in client-side mock analysis mode. Point to your FastAPI endpoint when backend is deployed.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Notifications Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Security Notifications</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">Alert on HIGH RISK findings only</span>
                <p className="text-slate-500 text-[11px]">Suppress minor warnings and low-confidence notices.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyHighRiskOnly}
                onChange={(e) => setPreferences({ ...preferences, notifyHighRiskOnly: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Privacy Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Data Privacy & Retention</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Local Scan Log Retention Policy</label>
              <select
                value={preferences.retentionDays}
                onChange={(e) => setPreferences({ ...preferences, retentionDays: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-slate-900"
              >
                <option>0 (No Retention - Auto Clear)</option>
                <option>7 Days Session Cache</option>
                <option>30 Days Local Storage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Engine settings saved successfully!
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
