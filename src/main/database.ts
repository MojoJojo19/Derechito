import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'

// Ruta de la DB: C:\Users\USER\AppData\Roaming\derechito-desktop\derechito.db
const dbPath = path.join(app.getPath('userData'), 'derechito.db')
const db = new Database(dbPath)

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS ergo_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    cervical_angle REAL,
    shoulder_ear_distance REAL,
    alert_threshold_degrees REAL DEFAULT 15,
    alert_threshold_seconds INTEGER DEFAULT 30,
    camera_distance REAL
  );

  CREATE TABLE IF NOT EXISTS posture_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    started_at TEXT,
    ended_at TEXT,
    duration_seconds INTEGER,
    avg_score REAL,
    correct_time_pct REAL,
    alert_count INTEGER DEFAULT 0,
    synced INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posture_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES posture_sessions(id),
    user_id TEXT,
    timestamp TEXT,
    score INTEGER,
    cervical_angle REAL,
    shoulder_tilt REAL,
    is_good_posture INTEGER,
    synced INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_id TEXT,
    fired_at TEXT,
    alert_type TEXT,
    deviation_degrees REAL,
    duration_seconds INTEGER,
    synced INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS learned_gestures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    label TEXT,
    type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`)

export default db
