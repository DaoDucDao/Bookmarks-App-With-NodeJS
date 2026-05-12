import { Router } from 'express';
import { z } from 'zod';
import { db, type Bookmark } from '../db.js';
import { HttpError } from '../lib/errors.js';

export const bookmarksRouter = Router();

const idParamSchema = z.coerce.number().int().positive();

const createBookmarkSchema = z.object({
   url: z.url().max(2048),
   title: z.string().min(1).max(200).optional(),
});

const updateBookmarkSchema = createBookmarkSchema;

const favouriteBodySchema = z.object({
   is_favorite: z.union([z.literal(0), z.literal(1)]),
});

const querySchema = z.object({
   title: z.string().min(1).max(200).optional(),
   page: z.coerce.number().int().positive().default(1),
   limit: z.coerce.number().int().positive().max(100).default(10),
});

/*
   TODO(phase-3): include `tags` in all three GET responses.

   Steps for each GET handler (/, /filter, /:id):

   1. Swap the SELECT to JOIN with bookmark_tags and tags:

      SELECT
         b.*,
         COALESCE(
            JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'name', t.name))
            FILTER (WHERE t.id IS NOT NULL),
            '[]'
         ) AS tags
      FROM bookmarks b
      LEFT JOIN bookmark_tags bt ON bt.bookmark_id = b.id
      LEFT JOIN tags t ON t.id = bt.tag_id
      <existing WHERE if any>
      GROUP BY b.id
      <existing ORDER BY / LIMIT / OFFSET>

   2. `tags` comes back as a JSON STRING — parse it before responding:

         const parsed = { ...row, tags: JSON.parse(row.tags) }

   3. Cast type:  `Omit<Bookmark, 'tags'> & { tags: string }` for the raw row,
      then map to `Bookmark` after JSON.parse.

   4. Don't touch the COUNT(*) query in /filter — it doesn't need the JOIN.

   5. Don't touch POST / PUT / PATCH / DELETE — frontend ignores their
      return values anyway.

   Verify each endpoint with curl after editing it; tag-attach via SQLite:
      INSERT INTO tags (name) VALUES ('test');
      INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (1, 1);
*/

/*
   TODO(phase-4): Frontend tag display. NO backend changes here.

   File: apps/web/src/Components/BookmarkRow/BookmarkRowDisplay.tsx

   - Add a row of tag chips between the title and the buttons.
   - Each chip is a small rounded span: bookmark.tags.map(tag => <span key=...>{tag.name}</span>).
   - Hide entirely if bookmark.tags.length === 0.
   - Suggested chip class: rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700
     dark:bg-slate-800 dark:text-slate-300

   Acceptance: open the app, manually-attached tags appear as chips on the right row.
*/

/*
   TODO(phase-5): Attach / detach tags. NEEDS new backend endpoints HERE, plus
   frontend helpers + UI.

   Backend (this file):

   1. POST /:id/tags
      Body schema:  z.object({ name: z.string().trim().min(1).max(50) })
      Steps in handler (wrap in db.transaction):
         INSERT OR IGNORE INTO tags (name) VALUES (?)
         SELECT id FROM tags WHERE name = ?            -> tagId
         INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)
      Then re-fetch the bookmark with tags (re-use the phase-3 SQL) and return it.
      404 if bookmark doesn't exist.

   2. DELETE /:id/tags/:tagId
      Both IDs through idParamSchema.
      DELETE FROM bookmark_tags WHERE bookmark_id = ? AND tag_id = ?
      `.run()` -> if result.changes === 0, 404.
      Optional: re-fetch bookmark with tags and return it (or just 204).

   ROUTE ORDER WARNING: register BOTH of these BEFORE the existing `PUT /:id`
   and `DELETE /:id`. Specific paths win over `:id`.

   Frontend (apps/web/src/api/bookmarks.ts):
   - addTagToBookmark(id: number, name: string): Promise<Bookmark>
   - removeTagFromBookmark(id: number, tagId: number): Promise<void>

   Frontend UI (BookmarkRowDisplay.tsx or BookmarkRowEditForm.tsx):
   - "+" button + text input to add a tag, calls addTagToBookmark + loadBookmarks.
   - Each existing chip gets an "x" button that calls removeTagFromBookmark
     + loadBookmarks.
*/

/*
   TODO(phase-6): Filter the list by tag.

   Backend (this file):

   1. Extend querySchema:
         tag: z.string().min(1).max(50).optional()

   2. In GET /filter handler:
      - When `tag` is present, change the SQL to also join+filter by tag name.
      - Easiest approach: wrap the existing SELECT in an EXISTS subquery, e.g.
            WHERE b.title LIKE ? COLLATE NOCASE
              AND (? = '' OR EXISTS (
                 SELECT 1 FROM bookmark_tags bt2
                 JOIN tags t2 ON t2.id = bt2.tag_id
                 WHERE bt2.bookmark_id = b.id AND t2.name = ? COLLATE NOCASE
              ))
        Add the same predicate to the COUNT query so `total` stays correct.

   Frontend:
   - Extend filterBookmark params with `tag?: string`.
   - UI: clickable chips could set the filter, OR add a dropdown / second
     input in the SearchBar area. Pick one.
*/

// TODO(phase-3): include tags. Add LEFT JOINs + JSON_GROUP_ARRAY, GROUP BY b.id,
// map results through JSON.parse on the `tags` field before res.json().
bookmarksRouter.get('/', (_req, res) => {
   const rows = db
      .prepare('SELECT * FROM bookmarks ORDER BY created_at DESC, id DESC')
      .all() as Bookmark[];

   res.json(rows);
});

// TODO(phase-3): include tags. Same JOIN + GROUP BY as GET /, but keep the
// WHERE title LIKE ?, ORDER BY, LIMIT/OFFSET. Leave the COUNT(*) query alone.
// Fix the `LIMIT? OFFSET?` typo while you're there (missing spaces).
bookmarksRouter.get('/filter', (req, res) => {
   const { title, limit, page } = querySchema.parse(req.query);

   const findPattern = title ? `%${title}%` : '%';
   const result = db
      .prepare(
         'SELECT * FROM bookmarks WHERE title LIKE ? COLLATE NOCASE ORDER BY created_at DESC, id DESC LIMIT? OFFSET?',
      )
      .all(findPattern, limit, (page - 1) * limit) as Bookmark[];

   const { total } = db
      .prepare('SELECT COUNT(*) AS total FROM bookmarks WHERE title LIKE ? COLLATE NOCASE')
      .get(findPattern) as { total: number };

   res.json({
      items: result,
      page,
      limit,
      total,
   });
});

bookmarksRouter.patch('/toggle-favourite/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);
   const { is_favorite } = favouriteBodySchema.parse(req.body);

   const updated = db
      .prepare('UPDATE bookmarks SET is_favorite = ? WHERE id = ? RETURNING *')
      .get(is_favorite, id) as Bookmark | undefined;

   if (!updated) throw new HttpError(404, 'Bookmark not found!');

   res.json(updated);
});

// TODO(phase-3): include tags. Start here — smallest scope. Same JOIN + GROUP BY,
// add `WHERE b.id = ?`. Single row, so JSON.parse the tags field once before res.json().
bookmarksRouter.get('/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);

   const bookmark = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id) as
      | Bookmark
      | undefined;

   if (!bookmark) {
      throw new HttpError(404, 'bookmark not found');
   }

   res.json(bookmark);
});

bookmarksRouter.post('/', (req, res) => {
   const { url, title } = createBookmarkSchema.parse(req.body);

   const inserted = db
      .prepare('INSERT INTO bookmarks (url, title) VALUES (?, ?) RETURNING *')
      .get(url, title ?? null) as Bookmark;

   res.status(201).json(inserted);
});

bookmarksRouter.put('/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);
   const { url, title } = updateBookmarkSchema.parse(req.body);

   const updated = db
      .prepare('UPDATE bookmarks SET url = ?, title = ? WHERE id = ? RETURNING *')
      .get(url, title ?? null, id) as Bookmark | undefined;

   if (!updated) {
      throw new HttpError(404, 'bookmark not found');
   }

   res.json(updated);
});

bookmarksRouter.delete('/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);

   const result = db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);

   if (result.changes === 0) {
      throw new HttpError(404, 'bookmark not found');
   }

   res.status(204).end();
});
