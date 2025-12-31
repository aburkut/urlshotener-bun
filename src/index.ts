import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { getLogger } from '@logtape/logtape'
import { configureMiddlewares } from './middlewares/middlewares.ts'
import { configureOpenAPIRoutes } from './routes/openapi-routes.ts'
import { configureRoutes } from './routes/routes.ts'

const app = new OpenAPIHono()
const logger = getLogger(['app'])
const port = Number(process.env.PORT) || 8080

configureMiddlewares(app)
configureOpenAPIRoutes(app, port)
configureRoutes(app)

const server = serve({ fetch: app.fetch, port })
logger.info('Server successfully started on http://localhost:{port}', { port })

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      logger.error(err.message)
      process.exit(1)
    }
    process.exit(0)
  })
})
