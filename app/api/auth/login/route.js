import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });

    const token = signToken({ id: user.id, username: user.username, email: user.email });
    const response = NextResponse.json({ ok: true, username: user.username });
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
