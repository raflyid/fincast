import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const DEFAULT_BUDGET = {
  Makan: 0, Transport: 0, Belanja: 0,
  Tagihan: 0, Hiburan: 0, Kesehatan: 0, Lainnya: 0,
};

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear());

  const [rows] = await pool.query(
    'SELECT category, amount FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
    [user.id, month, year]
  );

  // Merge with defaults so all categories always present
  const budget = { ...DEFAULT_BUDGET };
  rows.forEach(r => { budget[r.category] = Number(r.amount); });
  return NextResponse.json(budget);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { category, amount, month, year } = await request.json();
  if (!category || amount === undefined || !month || !year)
    return NextResponse.json({ error: 'Field tidak lengkap.' }, { status: 400 });

  await pool.query(
    `INSERT INTO budgets (user_id, category, amount, month, year)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE amount = VALUES(amount), updated_at = NOW()`,
    [user.id, category, amount, month, year]
  );

  return NextResponse.json({ ok: true, category, amount });
}
