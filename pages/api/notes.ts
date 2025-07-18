import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

// Ensure table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await ensureTable();
  const { method } = req;
  const userId = req.headers['x-user-id'] as string;

  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  if (method === 'GET') {
    const result = await query('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.status(200).json(result.rows);
  }
  if (method === 'POST') {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing note content' });
    const result = await query(
      'INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING *',
      [userId, content]
    );
    return res.status(201).json(result.rows[0]);
  }
  if (method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing note id' });
    await query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
