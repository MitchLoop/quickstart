const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use relative path for better cross-platform compatibility
const dbPath = path.join(__dirname, 'data', 'plaid_data.db');
console.log('Database path:', dbPath);

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory:', dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    console.error('Current user:', require('os').userInfo().username);
    console.error('File permissions:', fs.statSync(dataDir));
  } else {
    console.log('Successfully connected to database');
  }
});

// Initialize database tables
db.serialize(() => {
  console.log('Initializing database tables...');
  // Table for storing tokens
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT UNIQUE,
    item_id TEXT,
    user_token TEXT,
    public_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Tokens table created successfully');
    }
  });
});

const dbOperations = {
  // Save tokens
  saveTokens: (accessToken, itemId, userToken, publicToken) => {
    console.log('Attempting to save tokens:', { accessToken, itemId, userToken, publicToken });
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO tokens (access_token, item_id, user_token, public_token) 
         VALUES (?, ?, ?, ?)`,
        [accessToken, itemId, userToken, publicToken],
        (err) => {
          if (err) {
            console.error('Error saving tokens:', err);
            reject(err);
          } else {
            console.log('Tokens saved successfully');
            resolve();
          }
        }
      );
    });
  },

  // Get latest tokens
  getTokens: () => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM tokens ORDER BY created_at DESC LIMIT 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  // Get all tokens (for viewing database contents)
  getAllTokens: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tokens ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Clear tokens
  clearTokens: () => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tokens', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = dbOperations;