import type { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import logger from './logger.ts'

export function configureMiddlewares(app: OpenAPIHono) {
  app.use(
    '*',
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['Content-Length'],
      maxAge: 86400,
      credentials: true,
    }),
  )

  app.use(logger)
}
