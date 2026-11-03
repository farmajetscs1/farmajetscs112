import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'ok' | 'bad' | 'highlight' | 'accent';
  icon?: React.ReactNode;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  variant = 'default',
  icon,
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'ok':
        return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400';
      case 'bad':
        return 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400';
      case 'highlight':
        return 'border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400';
      case 'accent':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400';
      default:
        return 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'ok':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'bad':
        return 'text-rose-600 dark:text-rose-400';
      case 'highlight':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'accent':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-zinc-900 dark:text-zinc-100';
    }
  };

  return (
    <div
      className={`relative p-3.5 rounded-xl border transition-all duration-200 shadow-xs hover:shadow-sm ${getVariantStyles()}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
          {label}
        </span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${getValueColor()}`}>
          {value}
        </span>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              variant === 'ok'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : variant === 'bad'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
