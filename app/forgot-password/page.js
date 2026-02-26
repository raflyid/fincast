'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

function ForgotForm({ T }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inp = { background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 11, padding: '12px 15px', fontSize: 15, outline: 'none', width: '100%', fontFamily: 'inherit' };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setSent(true);
  };

  if (sent) return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📬</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>Email terkirim!</div>
      <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>Cek inbox kamu untuk link reset password.</div>
      <Link href="/login" style={{ display: 'inline-block', background: T.accent, color: '#fff', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Kembali ke Login</Link>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 4 }}>Masukkan email kamu dan kami akan mengirimkan link untuk reset password.</div>
      {error && <div style={{ background: T.redSub, color: T.red, borderRadius: 10, padding: '11px 15px', fontSize: 14, fontWeight: 600 }}>{error}</div>}
      <div>
        <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: 0.5 }}>EMAIL</label>
        <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} required />
      </div>
      <button type="submit" disabled={loading} style={{ background: T.accent, border: 'none', color: '#fff', borderRadius: 11, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 14, color: T.textMuted }}>
        <Link href="/login">← Kembali ke Login</Link>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Lupa password?" subtitle="">
      {({ T }) => <ForgotForm T={T} />}
    </AuthLayout>
  );
}
