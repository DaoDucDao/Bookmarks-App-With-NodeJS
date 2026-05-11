import type { RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: `route ${req.method} ${req.path} not found`,
  })
}
