import { createContext, useContext } from 'react';
import type { LoginInput, RegisterInput, UserResponse } from '../../api/auth';

export type AuthState = {
   user: UserResponse | null;
   login: (input: LoginInput) => Promise<void>;
   register: (input: RegisterInput) => Promise<void>;
   logout: () => Promise<void>;
   loading: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
   const context = useContext(AuthContext);

   if (!context) throw new Error('Something went wrong');

   return context;
};

export default AuthContext;
