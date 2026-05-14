CREATE TABLE IF NOT EXISTS bookmark_tags (
   bookmark_id INTEGER NOT NULL,
   tag_id      INTEGER NOT NULL,
   PRIMARY KEY (bookmark_id, tag_id),
   FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
   FOREIGN KEY (tag_id)      REFERENCES tags(id)      ON DELETE CASCADE
);
