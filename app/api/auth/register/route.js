import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password)
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]
    );
    if (existing.length > 0)
      return NextResponse.json({ error: 'Email atau username sudah terdaftar.' }, { status: 409 });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash]
    );
    const token = signToken({ id: result.insertId, username, email });
    const response = NextResponse.json({ ok: true, username });
    response.cookies.set('fincast_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
