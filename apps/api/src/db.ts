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

db.exec(`
  CREATE TABLE IF NOT EXISTS tags(
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bookmark_tags (
    bookmark_id INTEGER NOT NULL,
    tag_id      INTEGER NOT NULL,
    PRIMARY KEY (bookmark_id, tag_id),
    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)      REFERENCES tags(id)      ON DELETE CASCADE
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

export type Tag = {
   id: number;
   name: string;
};

export type Bookmark = {
   id: number;
   url: string;
   title: string | null;
   is_favorite: number;
   tags: Tag[];
   created_at: string;
};
