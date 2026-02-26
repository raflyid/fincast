import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || new Date().getMonth() + 1;
  const year = searchParams.get('year') || new Date().getFullYear();
  const [rows] = await pool.query(
    'SELECT * FROM forecast_items WHERE user_id = ? AND month = ? AND year = ? ORDER BY created_at DESC',
    [user.id, month, year]
  );
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { category, description, amount, month, year } = await request.json();
  if (!category || !description || !amount) return NextResponse.json({ error: 'Field tidak lengkap.' }, { status: 400 });
  const m = month || new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();
  const [result] = await pool.query(
    'INSERT INTO forecast_items (user_id, category, description, amount, month, year) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, category, description, amount, m, y]
  );
  const [rows] = await pool.query('SELECT * FROM forecast_items WHERE id = ?', [result.insertId]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID tidak ada.' }, { status: 400 });
  await pool.query('DELETE FROM forecast_items WHERE id = ? AND user_id = ?', [id, user.id]);
  return NextResponse.json({ ok: true });
}
