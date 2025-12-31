import type { OpenAPIHono } from '@hono/zod-openapi'
import { zValidator } from '@hono/zod-validator'
import { createUrlSchema } from '../schemas.ts'
import { urlService } from '../services/url-service.ts'

export function configureRoutes(app: OpenAPIHono) {
  app.post('/create_short_url', zValidator('json', createUrlSchema), async (c) => {
    const { url, expires_in_days } = c.req.valid('json')

    const result = await urlService.createShortUrl({ url, expires_in_days })

    const statusCode = result.clicks !== undefined ? 200 : 201

    return c.json(result, statusCode)
  })

  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404)
  })

  app.get('/:url', async (c) => {
    const shortCode = c.req.param('url')

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
