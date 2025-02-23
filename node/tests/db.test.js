const sqlite3 = require('sqlite3').verbose();
const path = require('path');

describe('SQLite3 Database', () => {
  let db;

  beforeAll(() => {
    const dbPath = path.resolve(__dirname, '../your-database-file.db');
    db = new sqlite3.Database(dbPath);
  });

  afterAll(() => {
    db.close();
  });

  test('should connect to the database', (done) => {
    db.get('SELECT 1', (err, row) => {
      expect(err).toBeNull();
      expect(row).toEqual({ '1': 1 });
      done();
    });
  });
});
