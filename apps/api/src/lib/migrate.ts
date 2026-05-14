import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type Database from 'better-sqlite3'
import { logger } from './logger.js'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')

export const runMigrations = (db: Database.Database) => {
   db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
         name       TEXT PRIMARY KEY,
         applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
   `)

   const appliedRows = db.prepare('SELECT name FROM _migrations').all() as { name: string }[]
   const applied = new Set(appliedRows.map((row) => row.name))

   const files = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort()

   const recordMigration = db.prepare('INSERT INTO _migrations (name) VALUES (?)')

   for (const file of files) {
      if (applied.has(file)) continue

      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
      const runOne = db.transaction(() => {
         db.exec(sql)
         recordMigration.run(file)
      })
      runOne()
      logger.info({ migration: file }, 'migration applied')
   }
}
