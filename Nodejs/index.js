const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {
  insertUserStmt,
  getUserByIdStmt,
  getUserByUsernameStmt,
  getAllUsersStmt,
  insertExerciseStmt,
  getUserLogs,
} = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Helpers
function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const [y, m, d] = value.split('-').map(Number);
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() + 1 === m &&
    date.getUTCDate() === d
  );
}

function formatDateForResponse(isoDate) {
  return isoDate;
}

function sendBadRequest(res, message) {
  return res.status(400).json({ error: message });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create new user
app.post('/api/users', (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return sendBadRequest(res, 'username is required and must be a non-empty string');
    }

    const existing = getUserByUsernameStmt.get(username.trim());
    if (existing) {
      return sendBadRequest(res, 'username must be unique');
    }

    const result = insertUserStmt.run(username.trim());
    const user = getUserByIdStmt.get(result.lastInsertRowid);

    return res.status(201).json({
      id: user.id,
      username: user.username,
    });
  } catch (err) {
    return next(err);
  }
});

// Get all users
app.get('/api/users', (req, res, next) => {
  try {
    const users = getAllUsersStmt.all();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

// Add exercise for user
app.post('/api/users/:_id/exercises', (req, res, next) => {
  try {
    const userId = Number(req.params._id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return sendBadRequest(res, 'user id must be a positive integer');
    }

    const user = getUserByIdStmt.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const { description, duration, date } = req.body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return sendBadRequest(res, 'description is required and must be a non-empty string');
    }

    if (duration === undefined || duration === null || duration === '') {
      return sendBadRequest(res, 'duration is required');
    }

    const durationNumber = Number(duration);
    if (!Number.isInteger(durationNumber) || durationNumber <= 0) {
      return sendBadRequest(res, 'duration must be a positive integer');
    }

    let dateToUse;
    if (!date) {
      const now = new Date();
      const y = now.getUTCFullYear();
      const m = String(now.getUTCMonth() + 1).padStart(2, '0');
      const d = String(now.getUTCDate()).padStart(2, '0');
      dateToUse = `${y}-${m}-${d}`;
    } else {
      if (typeof date !== 'string' || !isValidDateString(date)) {
        return sendBadRequest(res, 'date must be in YYYY-MM-DD format and be a valid calendar date');
      }
      dateToUse = date;
    }

    const result = insertExerciseStmt.run(
      user.id,
      description.trim(),
      durationNumber,
      dateToUse
    );

    return res.status(201).json({
      userId: user.id,
      exerciseId: result.lastInsertRowid,
      duration: durationNumber,
      description: description.trim(),
      date: formatDateForResponse(dateToUse),
    });
  } catch (err) {
    return next(err);
  }
});

// Get exercise logs for a user
app.get('/api/users/:_id/logs', (req, res, next) => {
  try {
    const userId = Number(req.params._id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return sendBadRequest(res, 'user id must be a positive integer');
    }

    const user = getUserByIdStmt.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const { from, to, limit } = req.query;

    let fromDate;
    let toDate;
    let limitNumber;

    if (from) {
      if (typeof from !== 'string' || !isValidDateString(from)) {
        return sendBadRequest(res, 'from must be in YYYY-MM-DD format and be a valid calendar date');
      }
      fromDate = from;
    }

    if (to) {
      if (typeof to !== 'string' || !isValidDateString(to)) {
        return sendBadRequest(res, 'to must be in YYYY-MM-DD format and be a valid calendar date');
      }
      toDate = to;
    }

    if (limit !== undefined) {
      const n = Number(limit);
      if (!Number.isInteger(n) || n <= 0) {
        return sendBadRequest(res, 'limit must be a positive integer');
      }
      limitNumber = n;
    }

    const { logs, count } = getUserLogs({
      userId,
      from: fromDate,
      to: toDate,
      limit: limitNumber,
    });

    return res.json({
      id: user.id,
      username: user.username,
      logs: logs.map((e) => ({
        id: e.id,
        description: e.description,
        duration: e.duration,
        date: formatDateForResponse(e.date),
      })),
      count,
    });
  } catch (err) {
    return next(err);
  }
});

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

