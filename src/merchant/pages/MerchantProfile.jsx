import React, { useState } from 'react';
import { User, Key, Bell, Shield, Check, Copy, Save, Sliders, Globe } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import { merchantProfile } from '../../data/merchantData';

export default function MerchantProfile() {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState(merchantProfile.preferences);

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(merchantProfile.apiKeyMasked);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Merchant Profile & Settings</h2>
          <p className="text-xs text-slate-500">Manage business information, API keys, webhooks, and automated recovery preferences.</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Business Details Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-sm font-bold text-slate-900 tracking-tight">Business Profile Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">Business Name</label>
            <input
              type="text"
              readOnly
              value={merchantProfile.businessName}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">Legal Entity Name</label>
            <input
              type="text"
              readOnly
              value={merchantProfile.legalName}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">Primary Finance Email</label>
            <input
              type="email"
              readOnly
              value={merchantProfile.email}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">Industry & Segment</label>
            <input
              type="text"
              readOnly
              value={merchantProfile.businessType}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* API & Webhook Security Credentials */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-sm font-bold text-slate-900 tracking-tight">API Credentials & Webhooks</div>
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">Live API Key (Masked for Security)</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={merchantProfile.apiKeyMasked}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-purple-700 font-bold focus:outline-none"
              />
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold">RecoverAI Webhook Notification URL</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                defaultValue={merchantProfile.webhookUrl}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              <Badge variant="success" size="sm">Active Endpoint</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Automation Preferences */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-sm font-bold text-slate-900 tracking-tight">Automated Recovery Preferences</div>
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-semibold text-slate-900 block">Enable Automated Smart Retries</span>
              <span className="text-slate-500">Allows RecoverAI to automatically retry eligible failed transactions</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoRetryEnabled}
              onChange={(e) => setPreferences({ ...preferences, autoRetryEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-semibold text-slate-900 block">WhatsApp 1-Click Recovery Nudge</span>
              <span className="text-slate-500">Send WhatsApp payment links when daily UPI or card limits are exceeded</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.whatsappRecoveryMsg}
              onChange={(e) => setPreferences({ ...preferences, whatsappRecoveryMsg: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-semibold text-slate-900 block">Smart Secondary Route Switching</span>
              <span className="text-slate-500">Reroute high-value transactions during primary issuer bank outages</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.smartFallbackRoute}
              onChange={(e) => setPreferences({ ...preferences, smartFallbackRoute: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
