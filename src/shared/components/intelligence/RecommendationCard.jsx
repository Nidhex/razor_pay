import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import Badge from '../Badge';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const rec = recommendation.recommended_strategy || {};
  const alternatives = recommendation.alternative_strategies || [];

  const recScore = Math.round((parseFloat(rec.recommendation_score) || 0.65) * 100);
  const expProb = Math.round((parseFloat(rec.expected_recovery_probability) || 0.50) * 100);

  return (
    <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200/80 space-y-3 font-mono text-xs shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-purple-800">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>AI Recommended Recovery Strategy</span>
        </div>
        <Badge variant="purple" size="sm">
          {recScore}% AI Recommendation Score
        </Badge>
      </div>

      {/* Top Strategy Highlight */}
      <div className="bg-white p-3 rounded-xl border border-purple-200/60 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {rec.strategy || 'Smart gateway retry'}
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            {expProb}% Exp. Recovery Rate
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-normal font-sans">
          {rec.reason || 'Based on comparable historical payment failure resolutions and current payment parameters.'}
        </p>
      </div>

      {/* Alternative Strategies */}
      {alternatives.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Alternative Recovery Options</span>
          <div className="space-y-1">
            {alternatives.map((alt, idx) => {
              const altScore = Math.round((parseFloat(alt.recommendation_score) || 0.45) * 100);
              const altHist = Math.round((parseFloat(alt.historical_success_rate) || 0.35) * 100);
              return (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80 text-[11px]">
                  <span className="text-slate-800 font-semibold">{alt.strategy}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{altHist}% Hist. Rate</span>
                    <span className="text-purple-700 font-bold">{altScore}% Score</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
