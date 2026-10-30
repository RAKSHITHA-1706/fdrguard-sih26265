import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = '#172B46', trend, onClick, badge, badgeColor }: StatCardProps) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#172B46', lineHeight: 1 }}>
          {value}
        </div>
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: `${badgeColor || color}20`,
            color: badgeColor || color,
            marginBottom: 2,
          }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{subtitle}</div>
      )}

      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          {trend > 0 ? (
            <TrendingUp size={13} color="#16a34a" />
          ) : trend < 0 ? (
            <TrendingDown size={13} color="#dc2626" />
          ) : (
            <Minus size={13} color="#9ca3af" />
          )}
          <span style={{ fontSize: 12, color: trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#9ca3af', fontWeight: 500 }}>
            {Math.abs(trend)}% from last month
          </span>
        </div>
      )}
    </div>
  );
}
