import { Hono } from 'hono';
import db from './db.js';

const viewings = new Hono();

// Student requests a viewing
viewings.post('/', async (c) => {
  const user = c.get('jwtPayload');
  const studentId = user?.id;
  if (!studentId) return c.json({ error: 'Unauthorized' }, 401);

  const { hostel_id } = await c.req.json();
  if (!hostel_id) return c.json({ error: 'Hostel ID is required' }, 400);

  try {
    // Check if viewing already exists
    const existing = db.prepare("SELECT id FROM viewings WHERE hostel_id = ? AND student_id = ? AND status != 'completed'").get(hostel_id, studentId);
    if (existing) return c.json({ error: 'Viewing request already pending or approved' }, 400);

    const info = db.prepare(
      'INSERT INTO viewings (hostel_id, student_id) VALUES (?, ?)'
    ).run(hostel_id, studentId);

    return c.json({ message: 'Viewing requested successfully', id: info.lastInsertRowid }, 201);
  } catch (err) {
    console.error('[Viewings] Error requesting viewing:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Manager gets viewing requests
viewings.get('/manager', async (c) => {
  const user = c.get('jwtPayload');
  const managerId = user?.id;
  if (!managerId) return c.json({ error: 'Unauthorized' }, 401);

  const list = db.prepare(`
    SELECT v.*, u.fullname as student_name, u.email as student_email, u.student_number, h.name as hostel_name
    FROM viewings v
    JOIN users u ON v.student_id = u.id
    JOIN hostels h ON v.hostel_id = h.id
    WHERE h.manager_id = ?
    ORDER BY v.created_at DESC
  `).all(managerId);

  return c.json(list);
});

// Student gets their viewing requests
viewings.get('/student', async (c) => {
  const user = c.get('jwtPayload');
  const studentId = user?.id;
  if (!studentId) return c.json({ error: 'Unauthorized' }, 401);

  const list = db.prepare(`
    SELECT v.*, h.name as hostel_name, h.location
    FROM viewings v
    JOIN hostels h ON v.hostel_id = h.id
    WHERE v.student_id = ?
    ORDER BY v.created_at DESC
  `).all(studentId);

  return c.json(list);
});

// Update viewing status (Manager)
viewings.patch('/:id/status', async (c) => {
  const user = c.get('jwtPayload');
  const managerId = user?.id;
  if (!managerId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const { status } = await c.req.json(); // approved, completed

  if (!['approved', 'completed'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  try {
    const viewing = db.prepare(`
      SELECT v.id FROM viewings v
      JOIN hostels h ON v.hostel_id = h.id
      WHERE v.id = ? AND h.manager_id = ?
    `).get(id, managerId);

    if (!viewing) return c.json({ error: 'Viewing not found or unauthorized' }, 404);

    db.prepare('UPDATE viewings SET status = ? WHERE id = ?').run(status, id);
    return c.json({ message: `Viewing ${status}` });
  } catch (err) {
    console.error('[Viewings] Error updating status:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default viewings;
