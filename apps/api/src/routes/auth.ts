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
