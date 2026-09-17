import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
const dbFilePath = path.join(__dirname, '../../database.sqlite');

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  initSchema(db);
  saveDatabase();
  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFilePath, buffer);
}

let inTransaction = false;

// Transaction wrapper
export function runInTransaction<T>(callback: () => T): T {
  if (!db) throw new Error('Database not initialized');
  if (inTransaction) {
    return callback();
  }
  inTransaction = true;
  db.run('BEGIN TRANSACTION;');
  try {
    const result = callback();
    db.run('COMMIT;');
    inTransaction = false;
    saveDatabase();
    return result;
  } catch (err: any) {
    inTransaction = false;
    try {
      db.run('ROLLBACK;');
    } catch (rbErr) {
      // ignore rollback error
    }
    throw err;
  }
}

// Helper to query all rows as typed objects
export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

// Helper to query single row as typed object
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper to execute run command with params
export function runSql(sql: string, params: any[] = []): { changes: number } {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  if (!inTransaction) {
    saveDatabase();
  }
  return { changes: db.getRowsModified() };
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS temples (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_tamil TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL,
      deity TEXT NOT NULL,
      deity_tamil TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      description_tamil TEXT NOT NULL,
      location TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      default_free_capacity INTEGER DEFAULT 500,
      default_paid_capacity INTEGER DEFAULT 100,
      default_paid_price INTEGER DEFAULT 100,
      advance_booking_hours INTEGER DEFAULT 24,
      facilities TEXT,
      rules TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS temple_timings (
      id TEXT PRIMARY KEY,
      temple_id TEXT NOT NULL,
      session_name TEXT NOT NULL,
      session_name_tamil TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_duration_minutes INTEGER DEFAULT 60,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      temple_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      free_capacity INTEGER NOT NULL,
      paid_capacity INTEGER NOT NULL,
      free_booked INTEGER DEFAULT 0,
      paid_booked INTEGER DEFAULT 0,
      ai_recommended_capacity INTEGER,
      status TEXT DEFAULT 'AVAILABLE',
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
      UNIQUE (temple_id, date, start_time, end_time)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_ref TEXT UNIQUE NOT NULL,
      temple_id TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      darshan_type TEXT NOT NULL, -- 'FREE' or 'PAID'
      channel TEXT NOT NULL, -- 'ONLINE' or 'OFFLINE_COUNTER'
      primary_visitor_name TEXT NOT NULL,
      visitor_phone TEXT NOT NULL,
      visitor_email TEXT,
      total_visitors INTEGER NOT NULL,
      amount_paid INTEGER DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT NOT NULL, -- 'COMPLETED', 'FREE', 'REFUNDED'
      booking_status TEXT NOT NULL, -- 'CONFIRMED', 'CANCELLED', 'ATTENDED'
      counter_staff_id TEXT,
      counter_number TEXT,
      qr_code_payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS booking_visitors (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      id_proof_type TEXT,
      id_proof_number TEXT,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS crowd_data (
      id TEXT PRIMARY KEY,
      temple_id TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      camera_id TEXT NOT NULL,
      camera_name TEXT NOT NULL,
      detected_count INTEGER NOT NULL,
      max_safe_capacity INTEGER NOT NULL,
      occupancy_percent REAL NOT NULL,
      crowd_level TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'
      estimated_wait_minutes INTEGER NOT NULL,
      recommended_action TEXT,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id TEXT PRIMARY KEY,
      temple_id TEXT NOT NULL,
      slot_id TEXT,
      date TEXT NOT NULL,
      time_range TEXT NOT NULL,
      current_demand INTEGER NOT NULL,
      predicted_demand INTEGER NOT NULL,
      recommended_capacity INTEGER NOT NULL,
      recommendation_text TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS special_days (
      id TEXT PRIMARY KEY,
      temple_id TEXT NOT NULL,
      date TEXT NOT NULL,
      event_name TEXT NOT NULL,
      event_name_tamil TEXT NOT NULL,
      special_timings TEXT,
      expected_crowd_level TEXT NOT NULL,
      slot_capacity_modifier REAL DEFAULT 1.0,
      booking_notes TEXT,
      FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_information (
      id TEXT PRIMARY KEY,
      temple_id TEXT, -- NULL for general system-wide helpline
      helpline_phone TEXT NOT NULL,
      toll_free TEXT,
      email TEXT NOT NULL,
      support_hours TEXT NOT NULL,
      emergency_phone TEXT,
      counter_locations TEXT,
      faqs TEXT -- JSON encoded FAQs
    );
  `);
}
