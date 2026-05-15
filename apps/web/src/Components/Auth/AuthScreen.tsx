import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthScreen = () => {
   const [mode, setMode] = useState<'login' | 'register'>('login')

   if (mode === 'login') return <LoginForm switchToRegister={() => setMode('register')} />

   return <RegisterForm switchToLogin={() => setMode('login')} />
}

export default AuthScreen
