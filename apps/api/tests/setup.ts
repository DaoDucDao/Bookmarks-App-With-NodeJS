import { beforeEach } from 'vitest'
import { db } from '../src/db.js'

beforeEach(() => {
   db.prepare('DELETE FROM bookmark_tags').run()
   db.prepare('DELETE FROM tags').run()
   db.prepare('DELETE FROM bookmarks').run()
   db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('bookmarks', 'tags')").run()
})
