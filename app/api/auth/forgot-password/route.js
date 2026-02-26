import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return NextResponse.json({ ok: true });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);
    console.log(`[FINCAST] Reset token for ${email}: ${token}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
