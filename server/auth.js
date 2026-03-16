import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Register
auth.post('/register', async (c) => {
  try {
    const { fullname, password, email, role, student_number } = await c.req.json();

    if (!fullname || !password || !email || !role) {
      console.warn('[Register] Missing required fields:', { fullname: !!fullname, email: !!email, role: !!role, password: !!password });
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get role ID
    const roleRow = db.prepare('SELECT id FROM roles WHERE name = ?').get(role.toLowerCase());
    if (!roleRow) {
      console.warn(`[Register] Invalid role attempted: ${role}`);
      return c.json({ error: 'Invalid role' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const info = db.prepare(
      'INSERT INTO users (fullname, password, email, role_id, student_number) VALUES (?, ?, ?, ?, ?)'
    ).run(fullname, hashedPassword, email, roleRow.id, student_number || null);

    console.log(`[Register] User created: ${email} (${role}) ${student_number ? '[' + student_number + ']' : ''}`);
    return c.json({ message: 'User registered successfully', userId: info.lastInsertRowid }, 201);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      if (err.message.includes('email')) {
        console.warn(`[Register] Email already exists: ${email}`);
        return c.json({ error: 'Email already exists' }, 400);
      }
      if (err.message.includes('student_number')) {
        console.warn(`[Register] Student number already exists: ${student_number}`);
        return c.json({ error: 'Student number already registered' }, 400);
      }
    }
    console.error('[Register] Internal Server Error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      console.warn('[Login] Missing email or password');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const user = db.prepare(`
      SELECT users.*, roles.name as role 
      FROM users 
      JOIN roles ON users.role_id = roles.id 
      WHERE email = ?
    `).get(email);

    if (!user) {
      console.warn(`[Login] User not found: ${email}`);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Login] Password mismatch for: ${email}`);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = jwt.sign(
      { id: user.id, fullname: user.fullname, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[Login] Success: ${email} (${user.role})`);
    return c.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error('[Login] Internal Server Error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;
