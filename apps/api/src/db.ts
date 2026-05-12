import Database from 'better-sqlite3';
import { config } from './config.js';

export const db = new Database(config.DATABASE_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url         TEXT    NOT NULL,
    title       TEXT,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

const columns = db.prepare('PRAGMA table_info(bookmarks)').all() as { name: string }[];
const hasIsFavorite = columns.some((column) => column.name === 'is_favorite');

if (!hasIsFavorite) {
   db.exec('ALTER TABLE bookmarks ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0');
}

const count = db.prepare('SELECT COUNT(*) AS n FROM bookmarks').get() as { n: number };
if (count.n === 0) {
   const insert = db.prepare('INSERT INTO bookmarks (url, title) VALUES (?, ?)');
   insert.run('https://nodejs.org', 'Node.js Official Site');
   insert.run('https://expressjs.com', 'Express Documentation');
}

export type Bookmark = {
   id: number;
   url: string;
   title: string | null;
   created_at: string;
};
