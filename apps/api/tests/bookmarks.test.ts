import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { db } from '../src/db.js'

const seedBookmark = (url: string, title: string | null = null) =>
   db
      .prepare('INSERT INTO bookmarks (url, title) VALUES (?, ?) RETURNING *')
      .get(url, title) as { id: number; url: string; title: string | null; created_at: string }

describe('GET /bookmarks', () => {
   it('returns an empty array when there are no bookmarks', async () => {
      const res = await request(app).get('/bookmarks')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
   })

   it('returns all bookmarks ordered by newest first', async () => {
      seedBookmark('https://a.com', 'A')
      seedBookmark('https://b.com', 'B')

      const res = await request(app).get('/bookmarks')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0].url).toBe('https://b.com')
      expect(res.body[1].url).toBe('https://a.com')
   })
})

describe('GET /bookmarks/:id', () => {
   it('returns a bookmark by id', async () => {
      const created = seedBookmark('https://example.com', 'Example')

      const res = await request(app).get(`/bookmarks/${created.id}`)

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(created.id)
      expect(res.body.url).toBe('https://example.com')
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

describe('DELETE /bookmarks/:id', () => {
   it('deletes an existing bookmark and returns 204', async () => {
      const created = seedBookmark('https://gone.com')

      const res = await request(app).delete(`/bookmarks/${created.id}`)

      expect(res.status).toBe(204)

      const after = await request(app).get(`/bookmarks/${created.id}`)
      expect(after.status).toBe(404)
   })

   it('returns 404 when deleting a non-existent bookmark', async () => {
      const res = await request(app).delete('/bookmarks/9999')

      expect(res.status).toBe(404)
   })
})

describe('unknown routes', () => {
   it('returns the 404 handler payload', async () => {
      const res = await request(app).get('/does-not-exist')

      expect(res.status).toBe(404)
      expect(res.body.error).toContain('not found')
   })
})
