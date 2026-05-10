import Database from 'better-sqlite3'
import { config } from './config.js'

export const db = new Database(config.DATABASE_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url         TEXT    NOT NULL,
    title       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`)

const count = db.prepare('SELECT COUNT(*) AS n FROM bookmarks').get() as { n: number }
if (count.n === 0) {
  const insert = db.prepare('INSERT INTO bookmarks (url, title) VALUES (?, ?)')
  insert.run('https://nodejs.org', 'Node.js Official Site')
  insert.run('https://expressjs.com', 'Express Documentation')
}

export type Bookmark = {
  id: number
  url: string
  title: string | null
  created_at: string
}
