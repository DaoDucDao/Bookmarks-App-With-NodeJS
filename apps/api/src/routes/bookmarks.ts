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

const tagSchema = z.object({
   name: z.string().trim().min(1).max(50),
});

bookmarksRouter.get('/', (_req, res) => {
   const rows = db
      .prepare('SELECT * FROM bookmarks ORDER BY created_at DESC, id DESC')
      .all() as Bookmark[];

   res.json(rows);
});

bookmarksRouter.get('/filter', (req, res) => {
   const { title, limit, page } = querySchema.parse(req.query);

   const findPattern = title ? `%${title}%` : '%';
   const result = db
      .prepare(
         `
         SELECT 
            b.*,
            COALESCE(
               JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'name', t.name))
               FILTER(WHERE t.id IS NOT NULL),
               '[]'
            ) AS tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON bt.bookmark_id = b.id
         LEFT JOIN tags t ON t.id = bt.tag_id
         WHERE b.title LIKE ? COLLATE NOCASE
         GROUP BY b.id 
         ORDER BY b.created_at DESC, b.id DESC
         LIMIT ? OFFSET ?
      `,
      )
      .all(findPattern, limit, (page - 1) * limit) as Array<
      Omit<Bookmark, 'tags'> & { tags: string }
   >;

   const { total } = db
      .prepare('SELECT COUNT(*) AS total FROM bookmarks WHERE title LIKE ? COLLATE NOCASE')
      .get(findPattern) as { total: number };

   res.json({
      items: result.map((item) => ({ ...item, tags: JSON.parse(item.tags) })),
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

bookmarksRouter.post('/:id/tags', (req, res) => {
   const id = idParamSchema.parse(req.params.id);
   const { name } = tagSchema.parse(req.body);

   const existBookmark = db.prepare('SELECT id FROM bookmarks WHERE id = ?').get(id) as
      | { id: number }
      | undefined;
   if (!existBookmark) throw new HttpError(404, 'Bookmark not Found!');

   db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(name);

   const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name) as { id: number };

   db.prepare('INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES(?, ?)').run(
      id,
      tag.id,
   );

   const result = db
      .prepare(
         `
         SELECT 
            b.*,
            COALESCE(
               JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'name', t.name))
               FILTER(WHERE t.id IS NOT NULL),
               '[]'
            ) AS tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON bt.bookmark_id = b.id
         LEFT JOIN tags t ON t.id = bt.tag_id
         WHERE b.id = ?
         GROUP BY b.id 
      `,
      )
      .get(id) as Omit<Bookmark, 'tags'> & { tags: string };

   res.status(201).json({ ...result, tags: JSON.parse(result.tags) });
});

bookmarksRouter.get('/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);

   const bookmark = db
      .prepare(
         `
         SELECT 
            b.*,
            COALESCE(
               JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'name', t.name))
               FILTER(WHERE t.id IS NOT NULL),
               '[]'
            ) AS tags
         FROM bookmarks b
         LEFT JOIN bookmark_tags bt ON bt.bookmark_id = b.id
         LEFT JOIN tags t ON t.id = bt.tag_id
         WHERE b.id = ? 
         GROUP BY b.id 
      `,
      )
      .get(id) as (Omit<Bookmark, 'tags'> & { tags: string }) | undefined;

   if (!bookmark) {
      throw new HttpError(404, 'bookmark not found');
   }

   res.json({ ...bookmark, tags: JSON.parse(bookmark.tags) });
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

bookmarksRouter.delete('/:id/tags/:tagId', (req, res) => {
   const bookmarkId = idParamSchema.parse(req.params.id);
   const tagId = idParamSchema.parse(req.params.tagId);

   const result = db
      .prepare('DELETE FROM bookmark_tags WHERE bookmark_id = ? and tag_id = ?')
      .run(bookmarkId, tagId);

   if (result.changes === 0) throw new HttpError(404, 'No matched tag or bookmark');

   res.status(204).end();
});

bookmarksRouter.delete('/:id', (req, res) => {
   const id = idParamSchema.parse(req.params.id);

   const result = db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);

   if (result.changes === 0) {
      throw new HttpError(404, 'bookmark not found');
   }

   res.status(204).end();
});
