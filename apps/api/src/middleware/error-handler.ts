import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../lib/errors.js'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'invalid input', issues: err.issues })
    return
  }

  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.too.large') {
    res.status(413).json({ error: 'payload too large' })
    return
  }

  req.log.error({ err }, 'unhandled error')
  res.status(500).json({ error: 'internal server error' })
}
