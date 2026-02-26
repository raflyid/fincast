'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

function LoginForm({ T }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const inp = { background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 11, padding: '12px 15px', fontSize: 15, outline: 'none', width: '100%', fontFamily: 'inherit' };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    window.location.href = '/dashboard';
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <div style={{ background: T.redSub, border: `1px solid ${T.red}33`, color: T.red, borderRadius: 10, padding: '11px 15px', fontSize: 14, fontWeight: 600 }}>{error}</div>}
      <div>
        <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: 0.5 }}>EMAIL</label>
        <input type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} required />
      </div>
      <div>
        <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: 0.5 }}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ ...inp, paddingRight: 46 }} required />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: T.textMuted }}>
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: -6 }}>
        <Link href="/forgot-password" style={{ fontSize: 13 }}>Lupa password?</Link>
      </div>
      <button type="submit" disabled={loading} style={{ background: T.accent, border: 'none', color: '#fff', borderRadius: 11, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Masuk...' : 'Masuk'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 14, color: T.textMuted }}>
        Belum punya akun? <Link href="/register">Daftar sekarang</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Selamat datang kembali" subtitle="Masuk ke akun Fincast kamu">
      {({ T }) => <LoginForm T={T} />}
    </AuthLayout>
  );
}
