import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, CheckCircle2, Clock, Zap, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import Badge from '../../shared/components/Badge';
import Button from '../../shared/components/Button';
import PaymentDetailDrawer from '../components/PaymentDetailDrawer';
import { getRecoveryCases } from '../../api/merchantApi';
import { CURRENT_MERCHANT_ID } from '../../config/currentMerchant';

export default function RecoveryCases() {
  const [rawCases, setRawCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecoveryCases(CURRENT_MERCHANT_ID);
      const stagesList = ['Payment Failed', 'AI Diagnostics', 'Action Executed', 'Awaiting Retry', 'Revenue Recovered'];
      
      const mapped = (data || []).map((rc) => {
        const recState = rc.recovery_state || rc.case_status || (rc.attempt_status === 'Recovered' ? 'RECOVERED' : 'AWAITING_RETRY');
        const isRecovered = recState === 'RECOVERED' || ['captured', 'verified', 'successful'].includes((rc.payment_status || '').toLowerCase());
        const isExecuted = rc.action_status === 'EXECUTED' || rc.execution_status === 'EXECUTED' || rc.attempt_status === 'Pending';
        
        const currentStage = isRecovered ? 4 : isExecuted ? 3 : 1;
        const prob = rc.recovery_probability ?? rc.predicted_recovery_probability ?? 0.65;
        const probPct = Math.round(prob * 100);
        const amountVal = rc.amount ?? rc.amount_inr ?? 0;

        return {
          caseId: rc.case_id || `REC-${(rc.payment_id || '').replace('pay_live_', '').replace('pay_', '')}`,
          paymentId: rc.payment_id,
          merchantId: rc.merchant_id || CURRENT_MERCHANT_ID,
          customer: `Customer (${(rc.payment_id || '').slice(-4)})`,
          amount: amountVal,
          method: rc.payment_method || 'Card / UPI',
          gateway: rc.gateway || 'Razorpay Gateway',
          failureReason: rc.failure_reason || rc.failure_category || 'Payment Authorization Failed',
          errorCode: rc.error_code || 'BAD_REQUEST',
          rootCause: rc.root_cause || '3DS / Card Auth Timeout',
          status: isRecovered ? 'RECOVERED' : isExecuted ? 'AWAITING_RETRY' : 'ACTION_REQUIRED',
          paymentStatus: rc.payment_status || (isRecovered ? 'captured' : 'failed'),
          strategy: rc.strategy || rc.recommended_strategy || 'Alternate Payment Method',
          actionStatus: rc.action_status || rc.execution_status || 'ACTION_REQUIRED',
          executionMode: rc.execution_mode || 'TEST_SIMULATION',
          recoveryState: recState,
          attemptStatus: rc.attempt_status || (isRecovered ? 'Recovered' : 'Pending'),
          estimatedRecoveryProb: `${probPct}%`,
          aiConfidence: probPct,
          incidentId: rc.incident_id,
          incidentTitle: rc.incident_title,
          currentStage: currentStage,
          stages: stagesList,
          createdTime: rc.created_at || 'Just now',
          executedTime: rc.executed_at,
          recoveredTime: rc.recovered_at
        };
      });
      setRawCases(mapped);
    } catch (err) {
      console.error('Failed to fetch merchant recovery cases:', err);
      setError(err.message || 'Failed to fetch recovery cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Top dynamic summary metrics
  const metrics = useMemo(() => {
    const total = rawCases.length;
    const recoveredCases = rawCases.filter(c => c.recoveryState === 'RECOVERED' || c.paymentStatus === 'captured');
    const activeCases = rawCases.filter(c => c.recoveryState !== 'RECOVERED' && c.paymentStatus !== 'captured');
    const awaitingRetryCases = rawCases.filter(c => c.actionStatus === 'EXECUTED' && c.recoveryState !== 'RECOVERED');

    const amountInRecovery = activeCases.reduce((sum, c) => sum + (c.amount || 0), 0);
    const amountRecovered = recoveredCases.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalRisk = amountInRecovery + amountRecovered;
    const successRate = totalRisk > 0 ? ((amountRecovered / totalRisk) * 100).toFixed(1) : '0.0';

    return {
      total,
      activeCount: activeCases.length,
      awaitingCount: awaitingRetryCases.length,
      recoveredCount: recoveredCases.length,
      amountInRecovery,
      amountRecovered,
      successRate
    };
  }, [rawCases]);

  // Filtered case list
  const filteredCases = useMemo(() => {
    return rawCases.filter((rc) => {
      // Status Filter
      if (filterStatus === 'OPEN' && rc.recoveryState === 'RECOVERED') return false;
      if (filterStatus === 'ACTION_EXECUTED' && rc.actionStatus !== 'EXECUTED') return false;
      if (filterStatus === 'AWAITING_RETRY' && (rc.recoveryState !== 'AWAITING_RETRY' || rc.paymentStatus === 'captured')) return false;
      if (filterStatus === 'RECOVERED' && rc.recoveryState !== 'RECOVERED' && rc.paymentStatus !== 'captured') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          rc.paymentId.toLowerCase().includes(q) ||
          rc.caseId.toLowerCase().includes(q) ||
          rc.failureReason.toLowerCase().includes(q) ||
          rc.rootCause.toLowerCase().includes(q) ||
          rc.strategy.toLowerCase().includes(q) ||
          (rc.incidentId && rc.incidentId.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [rawCases, filterStatus, searchQuery]);

  const handleOpenDrawer = (rcCase) => {
    setSelectedPayment({
      id: rcCase.paymentId,
      merchant_id: rcCase.merchantId || CURRENT_MERCHANT_ID,
      customer: rcCase.customer,
      amount: rcCase.amount,
      method: rcCase.method,
      gateway: rcCase.gateway,
      failureReason: rcCase.failureReason,
      errorCode: rcCase.errorCode,
      bank: rcCase.gateway,
      status: rcCase.paymentStatus
    });
    setDrawerOpen(true);
  };

  if (loading && rawCases.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn p-4">
        <div className="h-16 bg-white border border-slate-200/90 rounded-2xl animate-pulse shadow-sm" />
        <div className="h-24 bg-white border border-slate-200/90 rounded-2xl animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white border border-slate-200/90 rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error && rawCases.length === 0) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl space-y-4 animate-fadeIn">
        <div className="flex items-center gap-3 text-rose-700 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>Unable to load recovery cases</span>
        </div>
        <p className="text-xs text-slate-600">{error}</p>
        <Button variant="outline" size="sm" onClick={loadData}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Recovery Cases Workspace</h2>
          <p className="text-xs text-slate-500">
            Database-driven recovery cases powered by SQLite single source of truth and ML intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            {metrics.activeCount} Active Cases ({metrics.total} Total)
          </Badge>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Amount in Recovery</span>
          <div className="text-2xl font-extrabold text-amber-600">
            ₹{metrics.amountInRecovery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{metrics.activeCount} active cases pending</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Amount Recovered</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            ₹{metrics.amountRecovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{metrics.recoveredCount} verified successful cases</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Recovery Success Rate</span>
          <div className="text-2xl font-extrabold text-purple-600">
            {metrics.successRate}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Confirmed recovery ratio</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Awaiting Customer Retry</span>
          <div className="text-2xl font-extrabold text-indigo-600">
            {metrics.awaitingCount}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Executed recovery workflows</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payment ID, case ID, root cause, strategy, or incident ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs text-slate-900 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All', count: rawCases.length },
            { id: 'OPEN', label: 'Active', count: metrics.activeCount },
            { id: 'AWAITING_RETRY', label: 'Awaiting Retry', count: metrics.awaitingCount },
            { id: 'RECOVERED', label: 'Recovered', count: metrics.recoveredCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-purple-50 text-purple-700 border border-purple-200/80 font-bold'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white text-slate-700 font-mono shadow-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Case Cards Grid / Empty State */}
      {filteredCases.length === 0 ? (
        <div className="bg-white border border-slate-200/90 p-8 rounded-2xl text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No active recovery cases match filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            RecoverAI has no active payment cases matching your search criteria. All real failed payments from SQLite database are displayed above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((rc) => {
            const isRecovered = rc.recoveryState === 'RECOVERED' || rc.paymentStatus === 'captured';
            const isExecuted = rc.actionStatus === 'EXECUTED';

            return (
              <div key={rc.caseId} className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 hover:border-slate-300 transition-colors shadow-sm">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl border ${
                      isRecovered 
                        ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700' 
                        : isExecuted 
                        ? 'bg-indigo-50 border-indigo-200/80 text-indigo-700'
                        : 'bg-amber-50 border-amber-200/80 text-amber-700'
                    }`}>
                      <RefreshCw className={`w-5 h-5 ${isExecuted && !isRecovered ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-500">{rc.caseId}</span>
                        <span className="text-xs font-semibold text-slate-900 font-mono">Payment #{rc.paymentId}</span>
                        
                        <Badge variant={isRecovered ? 'success' : isExecuted ? 'brand' : 'warning'} size="sm">
                          {isRecovered ? 'RECOVERED' : isExecuted ? 'AWAITING RETRY' : 'ACTION REQUIRED'}
                        </Badge>

                        {isExecuted && (
                          <Badge variant="outline" size="sm">
                            TEST SIMULATION MODE
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <span>{rc.customer}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-extrabold">₹{(rc.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span>•</span>
                        <span className="text-slate-500 text-xs font-normal">{rc.method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 shrink-0">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Estimated Recovery Probability</div>
                    <div className="text-lg font-extrabold text-emerald-600">{rc.estimatedRecoveryProb}</div>
                  </div>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Failure Reason</span>
                    <span className="text-rose-600 font-semibold block truncate" title={rc.failureReason}>
                      {rc.failureReason}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">AI Root Cause</span>
                    <span className="text-slate-900 font-semibold block truncate" title={rc.rootCause}>
                      {rc.rootCause} ({rc.aiConfidence}% Confidence)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Recommended Strategy</span>
                    <span className="text-purple-700 font-semibold block truncate" title={rc.strategy}>
                      {rc.strategy}
                    </span>
                  </div>
                </div>

                {/* Incident Link Banner (if associated) */}
                {rc.incidentId && (
                  <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200/80 text-amber-800 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Linked Incident: <strong>{rc.incidentTitle || rc.incidentId}</strong></span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">{rc.incidentId}</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Created: {rc.createdTime.slice(0, 19).replace('T', ' ')}</span>
                  </div>

                  <button
                    onClick={() => handleOpenDrawer(rc)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 transition-colors"
                  >
                    <span>View AI Diagnostics & Drawer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onActionExecuted={loadData}
      />
    </div>
  );
}
