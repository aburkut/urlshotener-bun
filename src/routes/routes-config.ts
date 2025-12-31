import { createRoute } from '@hono/zod-openapi'
import {
  createUrlSchema,
  errorResponseSchema,
  urlParamSchema,
  urlResponseSchema,
} from '../schemas.ts'

export const createUrlRoute = createRoute({
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

export const redirectRoute = createRoute({
  method: 'get',
  path: '/{url}',
  request: {
    params: urlParamSchema,
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
