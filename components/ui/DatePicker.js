'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function getFirstDayMon(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export function DatePicker({ value, onChange, placeholder = 'Pilih tanggal' }) {
  const { T } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date();

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = getFirstDayMon(viewYear, viewMonth);

  const selectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const isSel = (d) => parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d;
  const isToday = (d) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const displayVal = parsed
    ? `${String(parsed.getDate()).padStart(2, '0')} ${MONTHS_FULL[parsed.getMonth()].slice(0, 3)} ${parsed.getFullYear()}`
    : null;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceAlt, border: `1px solid ${open ? T.accent : T.border}`, color: displayVal ? T.text : T.textMuted, borderRadius: 11, padding: '12px 14px', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer', outline: 'none', transition: 'border-color 0.15s' }}>
        <span>{displayVal ?? placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, zIndex: 400, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shadowMd, padding: '14px', width: 268, animation: 'dropIn 0.15s ease' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" onClick={prevMonth} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 7, width: 26, height: 26, cursor: 'pointer', color: T.text, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{MONTHS_FULL[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={{ background: T.surfaceAlt, border: 'none', borderRadius: 7, width: 26, height: 26, cursor: 'pointer', color: T.text, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 3 }}>
            {DAYS_SHORT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: T.textMuted, fontWeight: 700, padding: '3px 0' }}>{d}</div>)}
          </div>
          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const sel = isSel(day), tod = isToday(day);
              return (
                <button key={day} type="button" onClick={() => selectDay(day)}
                  style={{ background: sel ? T.accent : 'none', border: 'none', borderRadius: 7, color: sel ? '#fff' : tod ? T.accent : T.text, fontSize: 12, fontWeight: sel || tod ? 700 : 400, padding: '5px 0', cursor: 'pointer', transition: 'background 0.1s', outline: 'none' }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = T.surfaceAlt; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'none'; }}>
                  {day}
                </button>
              );
            })}
          </div>
          {/* Today shortcut */}
          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 8, paddingTop: 8, textAlign: 'center' }}>
            <button type="button"
              onClick={() => { const mm = String(today.getMonth() + 1).padStart(2,'0'); const dd = String(today.getDate()).padStart(2,'0'); onChange(`${today.getFullYear()}-${mm}-${dd}`); setOpen(false); }}
              style={{ background: 'none', border: 'none', color: T.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
