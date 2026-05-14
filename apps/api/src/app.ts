import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import sqliteStoreFactory from 'better-sqlite3-session-store';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { db } from './db.js';
import { logger } from './lib/logger.js';
import { bookmarksRouter } from './routes/bookmarks.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { requireAuth } from './middleware/require-auth.js';
import { authRouter } from './routes/auth.js';

const SqliteStore = sqliteStoreFactory(session);

const app = express();

app.use(helmet());

app.get('/healthz', (_req, res) => {
   res.json({ status: 'ok' });
});

app.get('/readyz', (_req, res) => {
   try {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ready' });
   } catch {
      res.status(503).json({ status: 'not ready' });
   }
});

app.use(
   rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => config.NODE_ENV === 'test',
      message: { error: 'too many requests' },
   }),
);
app.use(
   pinoHttp({
      logger,
      genReqId: (req, res) => {
         const incoming = req.headers['x-request-id'];
         const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
         res.setHeader('x-request-id', id);
         return id;
      },
   }),
);
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(
   session({
      store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 900_000 } }),
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
         httpOnly: true,
         secure: config.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000,
      },
   }),
);

app.get('/', (_req, res) => {
   res.json({ message: 'Hello from Node!' });
});

app.use('/auth', authRouter);
app.use('/bookmarks', requireAuth, bookmarksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
