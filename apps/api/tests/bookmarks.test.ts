import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

const seedBookmark = (url: string, title: string | null = null) =>
   db
      .prepare('INSERT INTO bookmarks (url, title) VALUES (?, ?) RETURNING *')
      .get(url, title) as { id: number; url: string; title: string | null; created_at: string }

const seedTag = (name: string) =>
   db.prepare('INSERT INTO tags (name) VALUES (?) RETURNING *').get(name) as {
      id: number
      name: string
   }

const linkTag = (bookmarkId: number, tagId: number) =>
   db.prepare('INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)').run(bookmarkId, tagId)

describe('GET /bookmarks/:id', () => {
   it('returns a bookmark with its tags', async () => {
      const created = seedBookmark('https://example.com', 'Example')
      const tag = seedTag('react')
      linkTag(created.id, tag.id)

      const res = await request(app).get(`/bookmarks/${created.id}`)

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(created.id)
      expect(res.body.url).toBe('https://example.com')
      expect(res.body.tags).toEqual([{ id: tag.id, name: 'react' }])
   })

   it('returns an empty tags array when the bookmark has no tags', async () => {
      const created = seedBookmark('https://example.com', 'Example')

      const res = await request(app).get(`/bookmarks/${created.id}`)

      expect(res.status).toBe(200)
      expect(res.body.tags).toEqual([])
   })

   it('returns 404 when the bookmark does not exist', async () => {
      const res = await request(app).get('/bookmarks/9999')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('bookmark not found')
   })

   it('returns 400 when the id is not a number', async () => {
      const res = await request(app).get('/bookmarks/abc')

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('invalid input')
   })
})

describe('GET /bookmarks/filter', () => {
   it('returns a paginated response with items, total, page, and limit', async () => {
      seedBookmark('https://a.com', 'A')
      seedBookmark('https://b.com', 'B')

      const res = await request(app).get('/bookmarks/filter')

      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(2)
      expect(res.body.total).toBe(2)
      expect(res.body.page).toBe(1)
      expect(res.body.limit).toBe(10)
   })

   it('filters bookmarks by title (case-insensitive partial match)', async () => {
      seedBookmark('https://a.com', 'Learn React')
      seedBookmark('https://b.com', 'Learn Node')
      seedBookmark('https://c.com', 'Cooking Recipes')

      const res = await request(app).get('/bookmarks/filter?title=learn')

      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(2)
      expect(res.body.total).toBe(2)
   })

   it('filters bookmarks by a single tag', async () => {
      const reactBookmark = seedBookmark('https://a.com', 'A')
      const nodeBookmark = seedBookmark('https://b.com', 'B')
      const reactTag = seedTag('react')
      const nodeTag = seedTag('node')
      linkTag(reactBookmark.id, reactTag.id)
      linkTag(nodeBookmark.id, nodeTag.id)

      const res = await request(app).get('/bookmarks/filter?tag=react')

      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(1)
      expect(res.body.items[0].url).toBe('https://a.com')
   })

   it('filters bookmarks by multiple tags (requires all tags)', async () => {
      const both = seedBookmark('https://both.com', 'Both')
      const onlyReact = seedBookmark('https://react.com', 'OnlyReact')
      const reactTag = seedTag('react')
      const tsTag = seedTag('typescript')
      linkTag(both.id, reactTag.id)
      linkTag(both.id, tsTag.id)
      linkTag(onlyReact.id, reactTag.id)

      const res = await request(app).get('/bookmarks/filter?tag=react&tag=typescript')

      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(1)
      expect(res.body.items[0].url).toBe('https://both.com')
   })

   it('includes the bookmark tags in each item', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')
      const tag = seedTag('react')
      linkTag(bookmark.id, tag.id)

      const res = await request(app).get('/bookmarks/filter')

      expect(res.body.items[0].tags).toEqual([{ id: tag.id, name: 'react' }])
   })

   it('paginates results', async () => {
      for (let i = 1; i <= 15; i++) {
         seedBookmark(`https://site-${i}.com`, `Site ${i}`)
      }

      const res = await request(app).get('/bookmarks/filter?page=2&limit=10')

      expect(res.status).toBe(200)
      expect(res.body.items).toHaveLength(5)
      expect(res.body.total).toBe(15)
      expect(res.body.page).toBe(2)
   })
})

describe('GET /bookmarks/tags', () => {
   it('returns an empty array when there are no tags', async () => {
      const res = await request(app).get('/bookmarks/tags')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
   })

   it('returns all tags', async () => {
      seedTag('react')
      seedTag('node')

      const res = await request(app).get('/bookmarks/tags')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.map((tag: { name: string }) => tag.name).sort()).toEqual(['node', 'react'])
   })
})

describe('POST /bookmarks', () => {
   it('creates a bookmark and returns it with status 201', async () => {
      const res = await request(app)
         .post('/bookmarks')
         .send({ url: 'https://new.com', title: 'New' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeTypeOf('number')
      expect(res.body.url).toBe('https://new.com')
      expect(res.body.title).toBe('New')
   })

   it('accepts a bookmark without a title', async () => {
      const res = await request(app).post('/bookmarks').send({ url: 'https://notitle.com' })

      expect(res.status).toBe(201)
      expect(res.body.title).toBeNull()
   })

   it('returns 400 when url is missing', async () => {
      const res = await request(app).post('/bookmarks').send({ title: 'no url' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('invalid input')
   })

   it('returns 400 when url is invalid', async () => {
      const res = await request(app).post('/bookmarks').send({ url: 'not a url' })

      expect(res.status).toBe(400)
   })
})

describe('PUT /bookmarks/:id', () => {
   it('updates an existing bookmark', async () => {
      const created = seedBookmark('https://old.com', 'Old')

      const res = await request(app)
         .put(`/bookmarks/${created.id}`)
         .send({ url: 'https://new.com', title: 'New' })

      expect(res.status).toBe(200)
      expect(res.body.url).toBe('https://new.com')
      expect(res.body.title).toBe('New')
   })

   it('returns 404 when updating a non-existent bookmark', async () => {
      const res = await request(app)
         .put('/bookmarks/9999')
         .send({ url: 'https://x.com', title: 'X' })

      expect(res.status).toBe(404)
   })
})

describe('PATCH /bookmarks/toggle-favourite/:id', () => {
   it('marks a bookmark as favourite', async () => {
      const created = seedBookmark('https://a.com', 'A')

      const res = await request(app)
         .patch(`/bookmarks/toggle-favourite/${created.id}`)
         .send({ is_favorite: 1 })

      expect(res.status).toBe(200)
      expect(res.body.is_favorite).toBe(1)
   })

   it('unmarks a bookmark as favourite', async () => {
      const created = seedBookmark('https://a.com', 'A')
      db.prepare('UPDATE bookmarks SET is_favorite = 1 WHERE id = ?').run(created.id)

      const res = await request(app)
         .patch(`/bookmarks/toggle-favourite/${created.id}`)
         .send({ is_favorite: 0 })

      expect(res.status).toBe(200)
      expect(res.body.is_favorite).toBe(0)
   })

   it('returns 404 when bookmark does not exist', async () => {
      const res = await request(app)
         .patch('/bookmarks/toggle-favourite/9999')
         .send({ is_favorite: 1 })

      expect(res.status).toBe(404)
   })

   it('returns 400 when is_favorite is not 0 or 1', async () => {
      const created = seedBookmark('https://a.com', 'A')

      const res = await request(app)
         .patch(`/bookmarks/toggle-favourite/${created.id}`)
         .send({ is_favorite: 2 })

      expect(res.status).toBe(400)
   })
})

describe('POST /bookmarks/:id/tags', () => {
   it('adds a new tag to a bookmark and returns the bookmark with all tags', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')

      const res = await request(app)
         .post(`/bookmarks/${bookmark.id}/tags`)
         .send({ name: 'react' })

      expect(res.status).toBe(201)
      expect(res.body.tags).toHaveLength(1)
      expect(res.body.tags[0].name).toBe('react')
   })

   it('reuses an existing tag if one with the same name exists', async () => {
      const bookmark1 = seedBookmark('https://a.com', 'A')
      const bookmark2 = seedBookmark('https://b.com', 'B')
      const existingTag = seedTag('react')
      linkTag(bookmark1.id, existingTag.id)

      const res = await request(app)
         .post(`/bookmarks/${bookmark2.id}/tags`)
         .send({ name: 'react' })

      expect(res.status).toBe(201)
      expect(res.body.tags[0].id).toBe(existingTag.id)
   })

   it('is idempotent — adding the same tag twice does not duplicate', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')

      await request(app).post(`/bookmarks/${bookmark.id}/tags`).send({ name: 'react' })
      const res = await request(app)
         .post(`/bookmarks/${bookmark.id}/tags`)
         .send({ name: 'react' })

      expect(res.status).toBe(201)
      expect(res.body.tags).toHaveLength(1)
   })

   it('returns 404 when the bookmark does not exist', async () => {
      const res = await request(app).post('/bookmarks/9999/tags').send({ name: 'react' })

      expect(res.status).toBe(404)
   })

   it('returns 400 when name is missing', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')

      const res = await request(app).post(`/bookmarks/${bookmark.id}/tags`).send({})

      expect(res.status).toBe(400)
   })
})

describe('DELETE /bookmarks/:id/tags/:tagId', () => {
   it('removes a tag from a bookmark and returns 204', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')
      const tag = seedTag('react')
      linkTag(bookmark.id, tag.id)

      const res = await request(app).delete(`/bookmarks/${bookmark.id}/tags/${tag.id}`)

      expect(res.status).toBe(204)

      const after = await request(app).get(`/bookmarks/${bookmark.id}`)
      expect(after.body.tags).toEqual([])
   })

   it('returns 404 when the bookmark and tag are not linked', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')
      const tag = seedTag('react')

      const res = await request(app).delete(`/bookmarks/${bookmark.id}/tags/${tag.id}`)

      expect(res.status).toBe(404)
   })
})

describe('DELETE /bookmarks/:id', () => {
   it('deletes an existing bookmark and returns 204', async () => {
      const created = seedBookmark('https://gone.com')

      const res = await request(app).delete(`/bookmarks/${created.id}`)

      expect(res.status).toBe(204)

      const after = await request(app).get(`/bookmarks/${created.id}`)
      expect(after.status).toBe(404)
   })

   it('cascades — removes the bookmark_tags links when the bookmark is deleted', async () => {
      const bookmark = seedBookmark('https://a.com', 'A')
      const tag = seedTag('react')
      linkTag(bookmark.id, tag.id)

      await request(app).delete(`/bookmarks/${bookmark.id}`)

      const links = db
         .prepare('SELECT COUNT(*) AS n FROM bookmark_tags WHERE bookmark_id = ?')
         .get(bookmark.id) as { n: number }
      expect(links.n).toBe(0)
   })

   it('returns 404 when deleting a non-existent bookmark', async () => {
      const res = await request(app).delete('/bookmarks/9999')

      expect(res.status).toBe(404)
   })
})

describe('health endpoints', () => {
   it('GET /healthz returns 200 with status ok', async () => {
      const res = await request(app).get('/healthz')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ok' })
   })

   it('GET /readyz returns 200 when the database is reachable', async () => {
      const res = await request(app).get('/readyz')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ready' })
   })
})

describe('unknown routes', () => {
   it('returns the 404 handler payload', async () => {
      const res = await request(app).get('/does-not-exist')

      expect(res.status).toBe(404)
      expect(res.body.error).toContain('not found')
   })
})
