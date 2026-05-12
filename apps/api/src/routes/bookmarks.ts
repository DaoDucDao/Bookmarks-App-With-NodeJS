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

const querySchema = z.object({
   title: z.string().min(1).max(200).optional(),
   page: z.coerce.number().int().positive().default(1),
   limit: z.coerce.number().int().positive().max(100).default(10),
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
