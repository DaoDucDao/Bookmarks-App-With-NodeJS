import { useTheme } from '../hooks/useTheme'

const ThemeToggle = () => {
   const { theme, toggleTheme } = useTheme()

   const nextLabel = theme === 'dark' ? 'Light' : 'Dark'

   return (
      <button
         type="button"
         onClick={toggleTheme}
         aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
         className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
         {nextLabel} mode
      </button>
   )
}

export default ThemeToggle
