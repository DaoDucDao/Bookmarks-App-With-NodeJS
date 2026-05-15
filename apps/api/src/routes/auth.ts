import { Router } from 'express';
import { z } from 'zod';
import { db, User } from '../db.js';
import bcrypt from 'bcrypt';
import { HttpError } from '../lib/errors.js';

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

   const passwordMatch = await bcrypt.compare(password, user.password_hash);
   if (!passwordMatch) throw new HttpError(404, 'Password Incorrect!');

   const { password_hash, ...returnUser } = user;

   req.session.userId = user.id;

   res.json(returnUser);
});

authRouter.get('/me', (req, res) => {
   const userId = req.session.userId;
   if (!userId) throw new HttpError(401, 'Authentication error!');

   const user = db
      .prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
      .get(userId) as Omit<User, 'password_hash'> | undefined;

   if (!user) throw new HttpError(401, 'Authentication error!');

   res.json(user);
});

authRouter.post('/logout', (req, res) => {
   req.session.destroy((error) => {
      if (error) throw new HttpError(500, 'Logging out failed!');
      res.clearCookie('connect.sid');
      res.status(201).end();
   });
});
