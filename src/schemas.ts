import { z } from '@hono/zod-openapi'

export const createUrlSchema = z.object({
  url: z.string().url().openapi({ example: 'https://example.com' }),
  expires_in_days: z.number().int().positive().optional().openapi({ example: 30 }),
})

export const urlResponseSchema = z.object({
  short_url: z.string().openapi({ example: 'abc123' }),
  original_url: z.string().url().openapi({ example: 'https://example.com' }),
  expires_at: z.string().datetime().nullable().openapi({ example: '2025-01-28T12:00:00.000Z' }),
  clicks: z.number().int().optional().openapi({ example: 0 }),
})

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'URL not found' }),
})

export const urlParamSchema = z.object({
  url: z.string().openapi({ example: 'abc123' }),
})
