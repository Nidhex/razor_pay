import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  RefreshCw,
  Bot,
  BarChart3,
  User,
  Zap,
  Activity,
  ChevronsUpDown,
  TrendingUp,
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';
import { CURRENT_MERCHANT_NAME } from '../../config/currentMerchant';

export default function MerchantSidebar({ activeTab, setActiveTab }) {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-payments', label: 'Live Payments', icon: Activity, badge: 'LIVE' },
    { id: 'denials', label: 'Payment Denials', icon: CreditCard, badge: '24' },
  ];

  const secondaryNavItems = [
    { id: 'cases', label: 'Recovery Cases', icon: RefreshCw, badge: '14' },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Merchant Settings', icon: User }
  ];

  return (
    <aside className="w-64 bg-[#0B0D13] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none text-slate-300">
      <div className="overflow-y-auto custom-scrollbar">
        {/* Top Organization Header (Reference UI style) */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                <Zap className="w-4 h-4 text-orange-500 fill-orange-500/20" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-tight leading-tight">
                  {CURRENT_MERCHANT_NAME}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Merchant Account</div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Navigation Group 1: Core Operations */}
        <div className="px-3 pt-5 pb-2">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Overview & Telemetry
          </div>
          <div className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : item.badge === 'LIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Group 2: Intelligence & Recovery */}
        <div className="px-3 pt-3 pb-4">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Revenue Recovery
          </div>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Merchant Summary Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090A0F]">
        <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Recovery Rate
            </span>
            <span className="text-emerald-400 font-bold">74.2%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 w-[74.2%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>₹42.8L Recovered</span>
            <span className="text-emerald-400 font-semibold">+3.8% MoM</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
