'use client';
import { useTheme } from '@/hooks/useTheme';
import { MONTHS_FULL } from '@/lib/utils';

export default function MonthNav({ month, year, onChange }) {
  const { T } = useTheme();
  const now = new Date();
  const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear();

  const change = (dir) => {
    let m = month + dir, y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    onChange(m, y);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <button onClick={() => change(-1)} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: T.text, minWidth: 148, textAlign: 'center' }}>
        {MONTHS_FULL[month - 1]} {year}
      </div>
      <button onClick={() => change(1)} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      {!isCurrent && (
        <button onClick={() => onChange(now.getMonth() + 1, now.getFullYear())} style={{ background: T.accentSub, border: 'none', color: T.accent, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>
          Bulan ini
        </button>
      )}
    </div>
  );
}
