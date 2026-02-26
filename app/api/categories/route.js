import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const DEFAULT_CATS = ['Makan','Transport','Belanja','Tagihan','Hiburan','Kesehatan','Lainnya'];

async function ensureUserCategories(userId) {
  // Check if user has any categories
  const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM user_categories WHERE user_id = ?', [userId]);
  if (rows[0].cnt === 0) {
    // Seed defaults
    for (let i = 0; i < DEFAULT_CATS.length; i++) {
      await pool.query(
        'INSERT IGNORE INTO user_categories (user_id, name, sort_order) VALUES (?, ?, ?)',
        [userId, DEFAULT_CATS[i], i + 1]
      );
    }
  }
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureUserCategories(user.id);
  const [rows] = await pool.query(
    'SELECT name FROM user_categories WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    [user.id]
  );
  return NextResponse.json(rows.map(r => r.name));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });

  await ensureUserCategories(user.id);

  // Get max sort order
  const [maxRows] = await pool.query(
    'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM user_categories WHERE user_id = ?',
    [user.id]
  );
  const newOrder = maxRows[0].maxOrder + 1;

  await pool.query(
    'INSERT IGNORE INTO user_categories (user_id, name, sort_order) VALUES (?, ?, ?)',
    [user.id, name.trim(), newOrder]
  );

  const [rows] = await pool.query(
    'SELECT name FROM user_categories WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    [user.id]
  );
  return NextResponse.json(rows.map(r => r.name));
}

export async function DELETE(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  await pool.query(
    'DELETE FROM user_categories WHERE user_id = ? AND name = ?',
    [user.id, name]
  );

  const [rows] = await pool.query(
    'SELECT name FROM user_categories WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    [user.id]
  );
  return NextResponse.json(rows.map(r => r.name));
}
