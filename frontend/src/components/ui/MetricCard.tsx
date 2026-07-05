import React from 'react';
import GlassCard from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: string;
  positive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  change,
  positive = true
}) => {
  return (
    <GlassCard className="p-4" hover={true}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">{title}</span>
          <span className="text-2xl font-bold font-grotesk tracking-tight text-white">{value}</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-nerox-indigo">
          {icon}
        </div>
      </div>

      {(change || description) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span className={`font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change}
            </span>
          )}
          {description && <span className="text-gray-400">{description}</span>}
        </div>
      )}
    </GlassCard>
  );
};

export default MetricCard;
