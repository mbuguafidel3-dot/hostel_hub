import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'hostel.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    student_number TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id)
  );

  CREATE TABLE IF NOT EXISTS hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_units INTEGER NOT NULL,
    manager_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    unit_number TEXT,
    status TEXT DEFAULT 'pending',
    notice_given INTEGER DEFAULT 0,
    notice_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels (id),
    FOREIGN KEY (student_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS booking_history (
    id INTEGER PRIMARY KEY,
    hostel_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    unit_number TEXT,
    notice_given INTEGER,
    notice_date DATETIME,
    created_at DATETIME,
    checkout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels (id),
    FOREIGN KEY (student_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS viewings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels (id),
    FOREIGN KEY (student_id) REFERENCES users (id)
  );
`);

// Migration for existing bookings table
try {
  db.prepare('ALTER TABLE bookings ADD COLUMN notice_given INTEGER DEFAULT 0').run();
  db.prepare('ALTER TABLE bookings ADD COLUMN notice_date DATETIME').run();
} catch (err) {
  // Columns might already exist
}

// Seed roles if they don't exist
const roles = ['admin', 'manager', 'student'];
const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');

const seedRoles = db.transaction((roles) => {
  for (const role of roles) insertRole.run(role);
});

seedRoles(roles);

export default db;
