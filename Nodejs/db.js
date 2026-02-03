const path = require('path');
const Database = require('better-sqlite3');

// Initialize SQLite database file in project root
const dbPath = path.join(__dirname, 'exercise-tracker.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// User queries
const insertUserStmt = db.prepare(
  'INSERT INTO users (username) VALUES (?)'
);
const getUserByIdStmt = db.prepare(
  'SELECT id, username FROM users WHERE id = ?'
);
const getUserByUsernameStmt = db.prepare(
  'SELECT id, username FROM users WHERE username = ?'
);
const getAllUsersStmt = db.prepare(
  'SELECT id, username FROM users ORDER BY id ASC'
);

// Exercise queries
const insertExerciseStmt = db.prepare(
  'INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)'
);

function buildLogsQuery({ userId, from, to, limit }) {
  const conditions = ['user_id = ?'];
  const params = [userId];

  if (from) {
    conditions.push('date >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('date <= ?');
    params.push(to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const baseSelect = `
    SELECT id, description, duration, date
    FROM exercises
    ${whereClause}
    ORDER BY date ASC, id ASC
  `;

  const countSelect = `
    SELECT COUNT(*) as count
    FROM exercises
    ${whereClause}
  `;

  const selectWithLimit = limit
    ? `${baseSelect} LIMIT ${Number(limit)}`
    : baseSelect;

  return { selectWithLimit, countSelect, params };
}

function getUserLogs({ userId, from, to, limit }) {
  const { selectWithLimit, countSelect, params } = buildLogsQuery({
    userId,
    from,
    to,
    limit,
  });

  const logs = db.prepare(selectWithLimit).all(...params);
  const countRow = db.prepare(countSelect).get(...params);

  return { logs, count: countRow ? countRow.count : 0 };
}

module.exports = {
  db,
  insertUserStmt,
  getUserByIdStmt,
  getUserByUsernameStmt,
  getAllUsersStmt,
  insertExerciseStmt,
  getUserLogs,
};

