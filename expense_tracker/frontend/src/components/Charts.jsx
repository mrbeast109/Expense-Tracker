import React from 'react';
import { CATEGORY_COLORS } from '../utils/helpers';
import { formatINR } from '../utils/helpers';

export function DonutChart({ data, total, centerLabel }) {
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  const segments = data.map((item, i) => {
    const pct = total > 0 ? item.amount / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = (
      <circle
        key={item.category || item.source || i}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * circumference + circumference * 0.25}
      />
    );
    offset += pct;
    return seg;
  });

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {data.length === 0 ? (
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        ) : segments}
      </svg>
      <div className="absolute text-center pointer-events-none">
        <div className="text-base font-bold text-gray-900">₹{formatINR(total)}</div>
        <div className="text-xs text-gray-500">{centerLabel}</div>
      </div>
    </div>
  );
}

export function BarChart({ monthlyData = [] }) {
  const rawMax = Math.max(...monthlyData.map((m) => Number(m.amount) || 0), 0);
  const max = rawMax > 0 ? rawMax : 5000;
  const ticks = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];

  function fmtTick(v) {
    if (v >= 1000) return `${Math.round(v / 1000)}K`;
    return v;
  }

  return (
    <div className="flex gap-4 mt-2">
      <div className="flex flex-col-reverse justify-between text-xs text-gray-400 pr-1 pb-5" style={{ height: 140 }}>
        {ticks.map((t, idx) => (
          <span key={`${t}-${idx}`}>{fmtTick(t)}</span>
        ))}
      </div>
      <div className="flex items-end gap-2 flex-1" style={{ height: 140 }}>
        {monthlyData.map((m, i) => {
          const isLast = i === monthlyData.length - 1;
          const heightPct = rawMax > 0 ? (Number(m.amount || 0) / max) * 100 : 0;
          return (
            <div key={`${m.month}-${m.year || i}`} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full flex items-end justify-center" style={{ height: 115 }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${isLast ? 'bg-gray-900' : 'bg-gray-200'}`}
                  style={{ height: `${Math.max(heightPct, 3)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{m.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
