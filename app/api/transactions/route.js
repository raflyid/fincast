import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [user.id];
  if (month && year) { query += ' AND MONTH(date) = ? AND YEAR(date) = ?'; params.push(parseInt(month), parseInt(year)); }
  query += ' ORDER BY date DESC, created_at DESC';
  const [rows] = await pool.query(query, params);
  return NextResponse.json(rows);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { type, description, amount, date, category } = await request.json();
  if (!type || !description || !amount || !date || !category)
    return NextResponse.json({ error: 'Field tidak lengkap.' }, { status: 400 });
  const [result] = await pool.query(
    'INSERT INTO transactions (user_id, type, description, amount, date, category) VALUES (?, ?, ?, ?, ?, ?)',
    [user.id, type, description, amount, date, category]
  );
  const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID tidak ada.' }, { status: 400 });
  await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, user.id]);
  return NextResponse.json({ ok: true });
}
