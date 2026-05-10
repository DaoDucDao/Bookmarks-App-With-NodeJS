import express from 'express'
import { config } from './config.js'
import { bookmarksRouter } from './routes/bookmarks.js'
import { notFoundHandler } from './middleware/not-found.js'
import { errorHandler } from './middleware/error-handler.js'

const app = express()

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Hello from Node!' })
})

app.use('/bookmarks', bookmarksRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.PORT, () => {
  console.log(`Listening on http://localhost:${config.PORT} (${config.NODE_ENV})`)
})
