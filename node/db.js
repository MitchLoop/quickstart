const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use relative path for better cross-platform compatibility
const dbPath = path.join(__dirname, 'data', 'plaid_data.db');
console.log('Database path:', dbPath);
console.log('Database directory exists:', fs.existsSync(path.dirname(dbPath)));
console.log('Database file exists:', fs.existsSync(dbPath));

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory:', dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create a new database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    console.error('Current user:', require('os').userInfo().username);
    console.error('File permissions:', fs.statSync(dataDir));
  } else {
    console.log('Successfully connected to database');
    
    // Initialize the database schema
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_token TEXT UNIQUE,
        item_id TEXT,
        user_token TEXT,
        public_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Error creating tokens table:', err);
        } else {
          console.log('Tokens table created or already exists');
        }
      });
    });
  }
});

const dbOperations = {
  // Save tokens
  saveTokens: async ({ access_token, item_id, user_token, public_token }) => {
    console.log('Attempting to save tokens:', { access_token, item_id, user_token, public_token });
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO tokens (access_token, item_id, user_token, public_token)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([access_token, item_id, user_token, public_token], function(err) {
        if (err) {
          console.error('Error saving tokens:', err);
          reject(err);
        } else {
          console.log('Tokens saved successfully');
          resolve();
        }
      });
      
      stmt.finalize();
    });
  },

  // Get latest tokens
  getTokens: async () => {
    console.log('Getting tokens from database...');
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tokens ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
        if (err) {
          console.error('Error getting tokens:', err);
          reject(err);
        } else {
          console.log('Retrieved tokens:', row);
          resolve(row);
        }
      });
    });
  },

  // Get all tokens
  getAllTokens: async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tokens ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          console.error('Error getting all tokens:', err);
          reject(err);
        } else {
          console.log('Retrieved all tokens:', rows);
          resolve(rows);
        }
      });
    });
  },

  // Clear tokens
  clearTokens: async () => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tokens', (err) => {
        if (err) {
          console.error('Error clearing tokens:', err);
          reject(err);
        } else {
          console.log('All tokens cleared');
          resolve();
        }
      });
    });
  }
};

// Handle cleanup
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = dbOperations;