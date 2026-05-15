import { apiFetch } from './client';

type UserResponse = {
   id: number;
   name: string;
   email: string;
   created_at: string;
};

type LoginInput = {
   email: string;
   password: string;
};

type RegisterInput = {
   email: string;
   password: string;
   name: string;
};

const login = async (input: LoginInput): Promise<UserResponse> => {
   const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
   });

   return res.json();
};

const register = async (input: RegisterInput): Promise<UserResponse> => {
   const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
   });

   return res.json();
};

const logout = async (): Promise<void> => {
   await apiFetch('/auth/logout', { method: 'POST' });
};

const getUser = async (): Promise<UserResponse> => {
   const res = await apiFetch('/auth/me');

   return res.json();
};

export { login, register, logout, getUser };
export type { UserResponse, LoginInput, RegisterInput };
