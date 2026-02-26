'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function Select({ value, onChange, options, placeholder }) {
  const { T } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => (o.value ?? o) === value);
  const label = selected ? (selected.label ?? selected) : (placeholder ?? 'Pilih...');

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceAlt, border: `1px solid ${open ? T.accent : T.border}`, color: selected ? T.text : T.textMuted, borderRadius: 11, padding: '12px 14px', fontFamily: 'inherit', fontSize: 15, cursor: 'pointer', transition: 'border-color 0.15s', outline: 'none' }}>
        <span>{label}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 300, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadowMd, overflow: 'hidden', animation: 'dropIn 0.15s ease' }}>
          {options.map(opt => {
            const val = opt.value ?? opt;
            const lbl = opt.label ?? opt;
            const isSel = val === value;
            return (
              <button key={val} type="button" onClick={() => { onChange(val); setOpen(false); }}
                style={{ width: '100%', textAlign: 'left', background: isSel ? T.accentSub : 'none', border: 'none', color: isSel ? T.accent : T.text, padding: '11px 14px', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: isSel ? 700 : 400 }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.surfaceAlt; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'none'; }}>
                {lbl}
                {isSel && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
