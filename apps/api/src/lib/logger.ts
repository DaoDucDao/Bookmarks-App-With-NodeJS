import pino from 'pino'
import { config } from '../config.js'

const isDev = config.NODE_ENV === 'development'

export const logger = pino({
   level: config.NODE_ENV === 'test' ? 'silent' : 'info',
   transport: isDev
      ? {
           target: 'pino-pretty',
           options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        }
      : undefined,
})
