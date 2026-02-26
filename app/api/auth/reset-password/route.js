import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Token dan password wajib diisi.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    const [rows] = await pool.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (rows.length === 0) return NextResponse.json({ error: 'Token tidak valid atau kadaluarsa.' }, { status: 400 });
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hash, rows[0].id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
