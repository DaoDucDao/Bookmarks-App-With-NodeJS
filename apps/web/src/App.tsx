import AuthScreen from './Components/Auth/AuthScreen';
import BookmarksList from './Components/BookmarksList';
import ThemeToggle from './Components/ThemeToggle';
import { useAuth } from './Context/Auth/AuthContext';

const App = () => {
   const { user, loading, logout } = useAuth();

   if(loading) return null

   if (!user) return <AuthScreen />;

   return (
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
         <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
               <h1 className="text-xl font-semibold tracking-tight">Bookmarks</h1>

               <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{user.name}</span>
                  <ThemeToggle />
                  <button
                     type="button"
                     onClick={logout}
                     className="cursor-pointer rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                     Logout
                  </button>
               </div>
            </div>
         </header>

         <main className="mx-auto max-w-2xl px-4 py-8">
            <BookmarksList />
         </main>
      </div>
   );
};

export default App;
