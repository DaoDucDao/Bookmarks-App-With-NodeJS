import Database from 'better-sqlite3';
import { config } from './config.js';
import { runMigrations } from './lib/migrate.js';

export const db = new Database(config.DATABASE_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

runMigrations(db);

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

export type User = {
   id: number;
   name: string;
   email: string;
   password_hash: string;
   create_at: string;
};
