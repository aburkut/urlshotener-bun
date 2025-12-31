import { honoLogger } from '@logtape/hono'
import { configure, getConsoleSink } from '@logtape/logtape'

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ['logtape', 'meta'],
      sinks: ['console'],
      lowestLevel: 'warning',
    },
    {
      category: ['hono'],
      sinks: ['console'],
      lowestLevel: 'info',
    },
    {
      category: ['app'],
      sinks: ['console'],
      lowestLevel: 'info',
    },
  ],
})

export default honoLogger()
