import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { createUrlSchema, errorResponseSchema, urlResponseSchema } from '../schemas.ts'
import { urlService } from '../services/url-service.ts'

const createUrlRoute = createRoute({
  method: 'post',
  path: '/create_short_url',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUrlSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: urlResponseSchema,
        },
      },
      description: 'Short URL created successfully',
    },
    200: {
      content: {
        'application/json': {
          schema: urlResponseSchema,
        },
      },
      description: 'Existing URL returned',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Invalid request',
    },
  },
  tags: ['URL Shortener'],
  summary: 'Create a short URL',
  description: 'Creates a new short URL or returns an existing one for the given URL',
})

const redirectRoute = createRoute({
  method: 'get',
  path: '/{url}',
  request: {
    params: z.object({
      url: z.string().openapi({ example: 'abc123' }),
    }),
  },
  responses: {
    301: {
      description: 'Redirects to the original URL',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'URL not found',
    },
    410: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'URL has expired',
    },
  },
  tags: ['URL Shortener'],
  summary: 'Redirect to original URL',
  description: 'Redirects to the original URL and increments the click counter',
})

export function configureOpenAPIRoutes(app: OpenAPIHono, port: number) {
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'URL Shortener API',
      description: 'Fast and modern URL shortener built with Bun, Hono, and PostgreSQL',
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  })

  app.get(
    '/docs',
    apiReference({
      theme: 'purple',
      url: '/openapi.json',
    }),
  )

  app.openapi(createUrlRoute, async (c) => {
    const { url, expires_in_days } = c.req.valid('json')

    const result = await urlService.createShortUrl({ url, expires_in_days })

    const statusCode = result.clicks !== undefined ? 200 : 201

    return c.json(
      {
        short_url: result.short_url,
        original_url: result.original_url,
        clicks: result.clicks,
        expires_at: result.expires_at?.toISOString() || null,
      },
      statusCode,
    )
  })

  app.openapi(redirectRoute, async (c) => {
    const { url: shortCode } = c.req.valid('param')

    const urlRecord = await urlService.findByShortCode(shortCode)

    if (!urlRecord) {
      return c.json({ error: 'URL not found' }, 404)
    }

    if (urlRecord.expires_at && urlRecord.expires_at < new Date()) {
      return c.json({ error: 'URL has expired' }, 410)
    }

    await urlService.incrementClicks(shortCode)

    return c.redirect(urlRecord.url, 301)
  })
}
