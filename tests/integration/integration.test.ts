import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/client.ts'

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080'
const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

describe('Integration Tests - URL Shortener API', () => {
  beforeAll(async () => {
    // Wait for the server to be ready
    let attempts = 0
    while (attempts < 30) {
      try {
        const res = await fetch(`${BASE_URL}/health-check`)
        if (res.status === 404) break
      } catch (_e) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
      }
    }

    // Clear the database before tests
    await prisma.url.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /create_short_url', () => {
    test('create short URL snapshot', async () => {
      const response = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        short_url: expect.any(String),
        original_url: 'https://example.com',
        expires_at: null,
      })
    })

    test('create short URL with expiration snapshot', async () => {
      const response = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://test.com',
          expires_in_days: 7,
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        short_url: expect.any(String),
        original_url: 'https://test.com',
        expires_at: expect.any(String),
      })
    })

    test('duplicate URL returns existing snapshot', async () => {
      await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://duplicate.com',
        }),
      })

      const response = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://duplicate.com',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        short_url: expect.any(String),
        original_url: 'https://duplicate.com',
        clicks: 0,
        expires_at: null,
      })
    })

    test('invalid URL snapshot', async () => {
      const response = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'not-a-valid-url',
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        success: false,
        error: expect.any(Object),
      })
    })
  })

  describe('GET /:url - Redirect', () => {
    test('redirect to original URL', async () => {
      const createResponse = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://redirect-test.com',
        }),
      })

      const { short_url } = await createResponse.json()

      const response = await fetch(`${BASE_URL}/${short_url}`, {
        redirect: 'manual',
      })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe('https://redirect-test.com')
    })

    test('non-existent URL snapshot', async () => {
      const response = await fetch(`${BASE_URL}/nonexistent123`)

      expect(response.status).toBe(404)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        error: 'URL not found',
      })
    })

    test('clicks counter increments', async () => {
      const createResponse = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://clicks-test.com',
        }),
      })

      const { short_url } = await createResponse.json()

      await fetch(`${BASE_URL}/${short_url}`, {
        redirect: 'manual',
      })
      await fetch(`${BASE_URL}/${short_url}`, {
        redirect: 'manual',
      })
      await fetch(`${BASE_URL}/${short_url}`, {
        redirect: 'manual',
      })

      const duplicateResponse = await fetch(`${BASE_URL}/create_short_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://clicks-test.com',
        }),
      })

      const data = await duplicateResponse.json()
      expect(data.clicks).toBe(3)
    })
  })

  describe('404 Handler', () => {
    test('unknown route snapshot', async () => {
      const response = await fetch(`${BASE_URL}/unknown/route`, {
        method: 'POST',
      })

      expect(response.status).toBe(404)
      const data = await response.json()

      expect(data).toMatchSnapshot({
        error: 'Not found',
      })
    })
  })
})
