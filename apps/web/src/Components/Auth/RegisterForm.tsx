import { useState } from 'react'
import { useAuth } from '../../Context/Auth/AuthContext'

const labelClass = 'text-xs font-medium text-slate-600 dark:text-slate-400'

const inputClass =
   'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const buttonClass =
   'cursor-pointer rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700'

type Props = {
   switchToLogin: () => void
}

const RegisterForm = ({ switchToLogin }: Props) => {
   const { register } = useAuth()

   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [submitting, setSubmitting] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitting(true)
      setError(null)

      try {
         await register({ name, email, password })
      } catch (err) {
         console.log(err)
         setError(err instanceof Error ? err.message : 'Failed to create account')
      } finally {
         setSubmitting(false)
      }
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
         <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Create an account
               </h1>
               <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Start saving your bookmarks
               </p>
            </div>

            <form
               onSubmit={handleSubmit}
               className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
               <div className="grid gap-1.5">
                  <label htmlFor="name" className={labelClass}>
                     Name
                  </label>
                  <input
                     id="name"
                     type="text"
                     placeholder="John Doe"
                     value={name}
                     onChange={(event) => setName(event.target.value)}
                     disabled={submitting}
                     required
                     autoComplete="name"
                     className={inputClass}
                  />
               </div>

               <div className="grid gap-1.5">
                  <label htmlFor="email" className={labelClass}>
                     Email
                  </label>
                  <input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(event) => setEmail(event.target.value)}
                     disabled={submitting}
                     required
                     autoComplete="email"
                     className={inputClass}
                  />
               </div>

               <div className="grid gap-1.5">
                  <label htmlFor="password" className={labelClass}>
                     Password
                  </label>
                  <input
                     id="password"
                     type="password"
                     placeholder="••••••••"
                     value={password}
                     onChange={(event) => setPassword(event.target.value)}
                     disabled={submitting}
                     required
                     autoComplete="new-password"
                     className={inputClass}
                  />
               </div>

               <button type="submit" disabled={submitting} className={buttonClass}>
                  {submitting ? 'Creating account…' : 'Sign up'}
               </button>

               {error && (
                  <p className="m-0 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
                     {error}
                  </p>
               )}
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
               Already have an account?{' '}
               <button
                  type="button"
                  onClick={switchToLogin}
                  className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
               >
                  Sign in
               </button>
            </p>
         </div>
      </div>
   )
}

export default RegisterForm
