import { app } from './app.js'
import { config } from './config.js'
import { db } from './db.js'
import { logger } from './lib/logger.js'

const server = app.listen(config.PORT, () => {
   logger.info({ port: config.PORT, env: config.NODE_ENV }, 'server started')
})

const SHUTDOWN_TIMEOUT_MS = 10_000

const shutdown = (signal: string) => {
   logger.info({ signal }, 'shutdown signal received')

   const forceExit = setTimeout(() => {
      logger.error('forced shutdown after timeout')
      process.exit(1)
   }, SHUTDOWN_TIMEOUT_MS)
   forceExit.unref()

   server.close((err) => {
      if (err) {
         logger.error({ err }, 'error closing server')
         process.exit(1)
      }

      try {
         db.close()
         logger.info('shutdown complete')
         process.exit(0)
      } catch (closeError) {
         logger.error({ err: closeError }, 'error closing database')
         process.exit(1)
      }
   })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
