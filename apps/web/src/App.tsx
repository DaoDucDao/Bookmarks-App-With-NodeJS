import BookmarksList from './Components/BookmarksList'
import ThemeToggle from './Components/ThemeToggle'

const App = () => (
   <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
         <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <h1 className="text-xl font-semibold tracking-tight">Bookmarks</h1>

            <ThemeToggle />
         </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
         <BookmarksList />
      </main>
   </div>
)

export default App
