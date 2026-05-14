CREATE TABLE IF NOT EXISTS bookmarks (
   id          INTEGER PRIMARY KEY AUTOINCREMENT,
   url         TEXT    NOT NULL,
   title       TEXT,
   is_favorite INTEGER NOT NULL DEFAULT 0,
   created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
