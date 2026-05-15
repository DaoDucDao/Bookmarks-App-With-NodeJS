import React, { useEffect, useState } from 'react';
import {
   login as loginApi,
   register as registerApi,
   logout as logoutApi,
   getUser,
   type LoginInput,
   type RegisterInput,
   type UserResponse,
} from '../../api/auth';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<UserResponse | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const res = await getUser();
            setUser(res);
         } catch (error) {
            console.log(error);
            setUser(null);
         }
         setLoading(false);
      };

      fetchUser();
   }, []);

   const login = async (input: LoginInput) => {
      const res = await loginApi(input);
      setUser(res);
   };

   const register = async (input: RegisterInput) => {
      const res = await registerApi(input);
      setUser(res);
   };

   const logout = async () => {
      await logoutApi();
      setUser(null);
   };

   return (
      <AuthContext.Provider value={{ user, login, register, logout, loading }}>
         {children}
      </AuthContext.Provider>
   );
};

export default AuthProvider;
