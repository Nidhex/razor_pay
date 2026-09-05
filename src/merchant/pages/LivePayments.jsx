import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { StatCard, Card } from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import PaymentDetailDrawer from '../components/PaymentDetailDrawer';
import { getMerchantLivePaymentEvents } from '../../api/intelligenceApi';
import { CURRENT_MERCHANT_ID } from '../../config/currentMerchant';

export default function LivePayments() {
  const [livePayments, setLivePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchLivePayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMerchantLivePaymentEvents(CURRENT_MERCHANT_ID);
      if (res && res.live_payments) {
        setLivePayments(res.live_payments);
      } else {
        setLivePayments([]);
      }
    } catch (e) {
      console.error('[LivePayments] Failed to fetch live payments:', e);
      setError(e.message || 'Failed to connect to backend live payment service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePayments();
  }, []);

  const handleOpenDrawer = (pm) => {
    setSelectedPayment(pm);
    setDrawerOpen(true);
  };

  const filteredPayments = livePayments.filter((pm) => {
    const term = searchTerm.toLowerCase();
    const pmId = (pm.payment_id || '').toLowerCase();
    const status = (pm.status || '').toLowerCase();
    const method = (pm.payment_method || '').toLowerCase();
    return pmId.includes(term) || status.includes(term) || method.includes(term);
  });

  const totalCount = livePayments.length;
  const capturedCount = livePayments.filter((p) => p.status === 'captured' || p.status === 'verified').length;
  const failedCount = livePayments.filter((p) => p.status === 'failed').length;

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      {/* Context Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0F1117] border border-slate-800 p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Persistent Live Payments</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              Database Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Razorpay test mode payments backed by SQLite persistence, ML feature adaptation, root cause diagnostics, and recovery action execution.
          </p>
        </div>

        <button
          onClick={fetchLivePayments}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#0F1117] border border-slate-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payments</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalCount} Payments</div>
          <p className="text-xs text-slate-400">Database backed transactions</p>
        </div>

        <div className="bg-[#0F1117] border border-slate-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Captured & Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{capturedCount} Successful</div>
          <p className="text-xs text-slate-400">Processed via Razorpay Test</p>
        </div>

        <div className="bg-[#0F1117] border border-slate-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Payments</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{failedCount} Failures</div>
          <p className="text-xs text-slate-400">Eligible for AI Recovery</p>
        </div>
      </div>

      {/* Main Live Payments Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Persistent Live Payment Ledger
            </h3>
            <p className="text-xs text-slate-400">Click any row or 'View Intelligence' to inspect diagnosis and execute recovery actions</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payment ID, method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 pl-8 pr-3 py-1.5 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-[#0F1117] border border-slate-800 rounded-2xl animate-pulse" />
        ) : error ? (
          <div className="bg-rose-950/40 border border-rose-500/30 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Failed to load persistent live payments</span>
            </div>
            <p className="text-xs text-slate-300">{error}</p>
            <button onClick={fetchLivePayments} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white">
              Retry Connection
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-[#0F1117] border border-slate-800 p-8 rounded-2xl text-center space-y-3">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No live payments recorded yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a test payment using the Razorpay Test Card on the Merchant Dashboard to generate live database-backed payments.
            </p>
          </div>
        ) : (
          <div className="bg-[#0F1117] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Payment ID</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Created Time</th>
                    <th className="py-3.5 px-4">Recovery Prob.</th>
                    <th className="py-3.5 px-4">Prediction Band</th>
                    <th className="py-3.5 px-4">Recommended Strategy</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredPayments.map((pm) => {
                    const prob = pm.intelligence?.prediction?.recovery_probability || 0.65;
                    const probPct = Math.round(prob * 100);
                    const band = pm.intelligence?.prediction?.probability_band || pm.intelligence?.prediction?.prediction_class || 'Medium Probability';
                    const recStrategy = pm.intelligence?.recommendation?.recommended_strategy?.strategy || 'Smart Gateway Retry';

                    const statusVariant = {
                      captured: 'success',
                      verified: 'success',
                      successful: 'success',
                      failed: 'danger',
                      created: 'brand'
                    }[(pm.status || '').toLowerCase()] || 'default';

                    return (
                      <tr
                        key={pm.payment_id}
                        onClick={() => handleOpenDrawer(pm)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-200 group-hover:text-orange-400">
                          {pm.payment_id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          ₹{pm.amount_inr?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={statusVariant} size="xs" dot>
                            {(pm.status || '').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{pm.payment_method}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {pm.created_at ? pm.created_at.slice(0, 19).replace('T', ' ') : 'Just now'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${probPct >= 75 ? 'text-emerald-400' : probPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {probPct}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 truncate max-w-[140px]">{band}</td>
                        <td className="py-3.5 px-4 text-orange-300 font-medium truncate max-w-[160px]">{recStrategy}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(pm);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onActionExecuted={fetchLivePayments}
      />
    </div>
  );
}
