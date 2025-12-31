import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Hono } from 'hono'
import { prisma } from '../../prisma/db.ts'
import { configureRoutes } from '../../src/routes/routes.ts'

describe('URL Shortener Routes', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    configureRoutes(app)
  })

  describe('POST /create_short_url', () => {
    test('should create a new short URL', async () => {
      const mockCreate = mock(() =>
        Promise.resolve({
          id: 1,
          url: 'https://example.com',
          short: 'abc123',
          clicks: 0,
          created_at: new Date(),
          updated_at: new Date(),
          expires_at: null,
        }),
      )

      const mockFindUnique = mock(() => Promise.resolve(null))

      prisma.url.create = mockCreate as any
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/create_short_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
        }),
      })

      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.short_url).toBeDefined()
      expect(data.original_url).toBe('https://example.com')
      expect(mockCreate).toHaveBeenCalled()
    })

    test('should return existing short URL for duplicate URL', async () => {
      const existing = {
        id: 1,
        url: 'https://example.com',
        short: 'abc123',
        clicks: 5,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: null,
      }

      const mockFindUnique = mock(() => Promise.resolve(existing))
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/create_short_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.short_url).toBe('abc123')
      expect(data.clicks).toBe(5)
    })

    test('should create short URL with expiration', async () => {
      const mockCreate = mock(() =>
        Promise.resolve({
          id: 1,
          url: 'https://example.com',
          short: 'abc123',
          clicks: 0,
          created_at: new Date(),
          updated_at: new Date(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      )

      const mockFindUnique = mock(() => Promise.resolve(null))

      prisma.url.create = mockCreate as any
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/create_short_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          expires_in_days: 7,
        }),
      })

      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.expires_at).toBeDefined()
    })

    test('should reject invalid URL', async () => {
      const res = await app.request('/create_short_url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'not-a-valid-url',
        }),
      })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /:url', () => {
    test('should redirect to original URL', async () => {
      const urlRecord = {
        id: 1,
        url: 'https://example.com',
        short: 'abc123',
        clicks: 0,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: null,
      }

      const mockFindUnique = mock(() => Promise.resolve(urlRecord))
      const mockUpdate = mock(() => Promise.resolve(urlRecord))

      prisma.url.findUnique = mockFindUnique as any
      prisma.url.update = mockUpdate as any

      const res = await app.request('/abc123', {
        redirect: 'manual',
      })

      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe('https://example.com')
      expect(mockUpdate).toHaveBeenCalled()
    })

    test('should return 404 for non-existent short URL', async () => {
      const mockFindUnique = mock(() => Promise.resolve(null))
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/nonexistent')

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toBe('URL not found')
    })

    test('should return 410 for expired URL', async () => {
      const urlRecord = {
        id: 1,
        url: 'https://example.com',
        short: 'abc123',
        clicks: 0,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: new Date(Date.now() - 1000),
      }

      const mockFindUnique = mock(() => Promise.resolve(urlRecord))
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/abc123')

      expect(res.status).toBe(410)
      const data = await res.json()
      expect(data.error).toBe('URL has expired')
    })

    test('should increment clicks counter', async () => {
      const urlRecord = {
        id: 1,
        url: 'https://example.com',
        short: 'abc123',
        clicks: 5,
        created_at: new Date(),
        updated_at: new Date(),
        expires_at: null,
      }

      const mockFindUnique = mock(() => Promise.resolve(urlRecord))
      const mockUpdate = mock(() => Promise.resolve({ ...urlRecord, clicks: 6 }))

      prisma.url.findUnique = mockFindUnique as any
      prisma.url.update = mockUpdate as any

      await app.request('/abc123', {
        redirect: 'manual',
      })

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { short: 'abc123' },
        data: {
          clicks: {
            increment: 1,
          },
        },
      })
    })
  })

  describe('404 handler', () => {
    test('should return 404 for routes with multiple segments', async () => {
      const mockFindUnique = mock(() => Promise.resolve(null))
      prisma.url.findUnique = mockFindUnique as any

      const res = await app.request('/unknown/route', {
        method: 'POST',
      })

      expect(res.status).toBe(404)
    })
  })
})
