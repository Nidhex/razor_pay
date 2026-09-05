import React from 'react';
import HelpTooltip from './HelpTooltip';

export function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  header,
  headerAction,
  footer
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-sm transition-all duration-200 ${
        hover ? 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {(header || headerAction) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="font-semibold text-slate-900">{header}</div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={paddings[padding] || paddings.md}>{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/60 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive', // positive | negative | neutral
  accentColor = 'indigo', // indigo | emerald | rose | cyan | amber
  tooltip,
  className = ''
}) {
  const accentClasses = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  };

  const trendColors = {
    positive: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
    negative: 'text-rose-700 bg-rose-50 border border-rose-200/60',
    neutral: 'text-slate-600 bg-slate-100'
  };

  return (
    <Card className={`group relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            {tooltip && <HelpTooltip content={tooltip} title={title} />}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${accentClasses[accentColor] || accentClasses.indigo} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded-full font-semibold ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
