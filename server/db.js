import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename)

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
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
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
`);

// Seed roles if they don't exist
const roles = ['admin', 'manager', 'student'];
const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name) VALUES (?)');

const seedRoles = db.transaction((roles) => {
  for (const role of roles) insertRole.run(role);
});

seedRoles(roles);

export default db;
