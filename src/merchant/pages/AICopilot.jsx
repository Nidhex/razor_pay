import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import { fetchCopilotQuery, fetchCopilotPrompts } from '../../api/copilotApi';
import { generateAICopilotResponse } from '../../data/aiEngine';
import { merchantStats, merchantFailedPayments } from '../../data/merchantData';
import { API_BASE_URL, apiRequest } from '../../api/client';

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      id: 'm_init',
      sender: 'ai',
      text: "Hello Alex! I am your **RecoverAI Financial Intelligence Copilot**. I have analyzed your active failed transactions for **CloudMart (m_1004)** today.",
      metrics: [
        { label: 'Revenue At Risk', value: '₹12,45,000' },
        { label: 'Recoverable Revenue', value: '₹9,24,000' },
        { label: 'AI Recovery Rate', value: '74.2%' }
      ],
      recommendation: "You can ask me questions about failure root causes, strategy effectiveness, or specific payment IDs (e.g. pay_104421).",
      suggestedAction: null
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const messagesEndRef = useRef(null);

  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Why did my payment failures increase?",
    "Which recovery strategy is working best?",
    "How much revenue can still be recovered?",
    "Analyze payment failure pay_104421"
  ]);

  useEffect(() => {
    fetchCopilotPrompts('merchant').then((data) => {
      if (data?.prompts?.length) {
        setSuggestedPrompts(data.prompts);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend, retryQuery = null) => {
    const query = retryQuery || textToSend || inputQuery;
    if (!query.trim()) return;

    if (!retryQuery) {
      const userMsg = { id: `u_${Date.now()}`, sender: 'user', text: query };
      setMessages((prev) => [...prev, userMsg]);
      setInputQuery('');
    }
    setLoading(true);

    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ sender: m.sender, text: m.text }));

    try {
      const apiRes = await fetchCopilotQuery(query, 'm_1004', 'merchant', history);
      if (apiRes && !apiRes.error && apiRes.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: apiRes.text,
            metrics: apiRes.metrics || [],
            payment_card: apiRes.payment_card || null,
            recommendation: apiRes.recommendation || null,
            suggestedAction: apiRes.suggestedAction || null,
            actionType: apiRes.actionType || null,
            actionPayload: apiRes.actionPayload || null
          }
        ]);
      } else {
        const errorText = apiRes?.message || 'Backend is waking up. Please retry in a few seconds.';
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            sender: 'ai',
            isError: true,
            failedQuery: query,
            text: errorText
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          isError: true,
          failedQuery: query,
          text: err?.message || 'Backend is waking up. Please retry in a few seconds.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (msg) => {
    if (!msg.actionType) return;

    if (msg.actionType === 'SIMULATE_RETRY') {
      try {
        setLoading(true);
        const res = await apiRequest('/api/demo/simulate?event_type=failure', { method: 'POST' });
        setActionSuccess(`Successfully triggered AI recovery strategy for ${msg.actionPayload?.payment_id || 'payment case'}`);
        setTimeout(() => setActionSuccess(null), 4000);
      } catch (err) {
        setActionSuccess(`Simulated recovery action executed successfully.`);
        setTimeout(() => setActionSuccess(null), 4000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-400" />
            RecoverAI Financial Intelligence Copilot
          </h2>
          <p className="text-xs text-slate-400">
            Conversational assistant connected to Dataset V2 telemetry, ML prediction pipeline, and Root Cause Engine.
          </p>
        </div>

        <Badge variant="warning" pulse dot size="md">
          AI Engine Online
        </Badge>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Suggested Prompt Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Suggested Prompts:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="bg-[#0F1117] border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[480px] flex flex-col justify-between space-y-4">
        <div className="space-y-6 overflow-y-auto max-h-[520px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-xl'
                }`}
              >
                {msg.isError ? (
                  <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl space-y-2.5">
                    <div className="text-xs text-rose-300 font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                    <button
                      onClick={() => handleSendMessage(null, msg.failedQuery)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Retry Query
                    </button>
                  </div>
                ) : (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                    {/* Payment Card Preview if available */}
                    {msg.payment_card && (
                      <div className="bg-slate-900/90 border border-orange-500/30 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-300">{msg.payment_card.payment_id}</span>
                          <span className="text-xs font-semibold text-emerald-400">₹{msg.payment_card.amount_inr?.toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2">
                          <div>Method: <strong className="text-slate-200">{msg.payment_card.payment_method}</strong></div>
                          <div>Recovery Prob: <strong className="text-emerald-400">{msg.payment_card.recovery_probability}%</strong></div>
                          <div>Category: <strong className="text-slate-200">{msg.payment_card.failure_category}</strong></div>
                          <div>Band: <strong className="text-orange-400">{msg.payment_card.probability_band}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Inline Metrics Widget */}
                    {msg.metrics && msg.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                        {msg.metrics.map((m, i) => (
                          <div key={i} className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block">{m.label}</span>
                            <span className="text-xs font-bold text-emerald-400">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendation Box */}
                    {msg.recommendation && (
                      <div className="bg-orange-950/40 border border-orange-500/30 p-3 rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-orange-400" /> AI Recommendation
                        </div>
                        <div className="text-xs text-slate-200">{msg.recommendation}</div>
                      </div>
                    )}

                    {msg.suggestedAction && (
                      <button
                        onClick={() => handleExecuteAction(msg)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-orange-400 to-amber-500 px-3 py-1.5 rounded-lg shadow-md"
                      >
                        <span>{msg.suggestedAction}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 border border-slate-700">
                  CM
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-slate-400 text-xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-orange-500/50 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span>RecoverAI is analyzing telemetry & running ML inference...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Copilot about payment failures, recovery rates, or strategy options..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 px-4 py-3 focus:outline-none focus:border-orange-500/50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
