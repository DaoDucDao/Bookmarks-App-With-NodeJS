import { Router } from 'express';
import { z } from 'zod';
import { db, User } from '../db.js';
import bcrypt from 'bcrypt';
import { HttpError } from '../lib/errors.js';

// TODO — pick up here next session
//
// Backend (finish auth surface):
//   1. GET  /auth/me      — return current user from req.session.userId, or null
//                          (needed so the FE can hydrate after page refresh)
//   2. POST /auth/logout  — req.session.destroy(); res.status(204).end()
//   3. Enable cookies across origins in apps/api/src/app.ts:
//        cors({ origin: config.CORS_ORIGIN, credentials: true })
//
// Polish (this file):
//   4. /login status code: 404 → 401 (Unauthorized fits, NotFound doesn't)
//   5. Decide: combine the two login error messages (prevents email enumeration)
//      vs keep separate (better UX). Whatever you pick, do it deliberately.
//   6. Decide: return user data from /login (saves a round trip)
//      vs leave silent and let /me handle identity (single source of truth).
//
// Frontend (start once BE is done):
//   7. apps/web/src/api/auth.ts — register/login/logout/fetchMe, all with
//      `credentials: 'include'` so the session cookie flows.
//   8. useAuth hook (or AuthContext) — call fetchMe() on mount, hold current user.
//   9. LoginForm + RegisterForm components, reuse Zod for client-side validation.
//   10. App.tsx: if no user → show auth pages, else → bookmarks. Logout button in header.

export const authRouter = Router();

const registerSchema = z.object({
   email: z.email(),
   name: z.string().trim().min(1).max(50),
   password: z.string().min(1).max(72),
});

const loginSchema = z.object({
   email: z.email(),
   password: z.string().min(1).max(72),
});

authRouter.post('/register', async (req, res) => {
   const { email, name, password } = registerSchema.parse(req.body);

   const passwordHash = await bcrypt.hash(password, 10);

   const existedUser = db
      .prepare('SELECT id FROM users WHERE name = ? OR email = ?')
      .get(name, email);

   if (existedUser) throw new HttpError(409, 'Name or Email has been registered');

   const registeredUser = db
      .prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ? ,?) RETURNING *')
      .get(email, name, passwordHash) as User;

   const { password_hash, ...returnUser } = registeredUser;

   req.session.userId = registeredUser.id;

   res.status(201).json(returnUser);
});

authRouter.post('/login', async (req, res) => {
   const { email, password } = loginSchema.parse(req.body);

   const user = db
      .prepare('SELECT id, email, name, password_hash FROM users WHERE  email = ?')
      .get(email) as User | undefined;

   if (!user) throw new HttpError(404, 'Email is wrong!');
   if (user && !(await bcrypt.compare(password, user.password_hash)))
      throw new HttpError(404, 'Password Incorrect!');

   req.session.userId = user.id;

   res.status(204).end();
});
