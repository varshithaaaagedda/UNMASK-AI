'use client';

import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  let styles = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'SAFE',
    Icon: CheckCircle2,
  };

  if (level === 'HIGH') {
    styles = {
      bg: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'HIGH RISK',
      Icon: ShieldAlert,
    };
  } else if (level === 'SUSPICIOUS') {
    styles = {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      dot: 'bg-amber-500',
      label: 'SUSPICIOUS',
      Icon: AlertTriangle,
    };
  } else if ((level as string) === 'UNVERIFIED') {
    styles = {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
      label: 'UNVERIFIED',
      Icon: CheckCircle2,
    };
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold rounded-lg gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const IconComponent = styles.Icon;

  return (
    <span
      className={`inline-flex items-center border tracking-wide font-mono ${styles.bg} ${sizeClasses[size]}`}
    >
      {showIcon ? (
        <IconComponent className={iconSizes[size]} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      )}
      <span>{styles.label}</span>
    </span>
  );
};
