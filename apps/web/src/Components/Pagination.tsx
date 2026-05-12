type Props = {
   page: number
   totalPages: number
   setPage: (page: number) => void
   disabled?: boolean
}

const buttonClass =
   'cursor-pointer rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'

const Pagination = ({ page, totalPages, setPage, disabled = false }: Props) => {
   const isFirst = page <= 1
   const isLast = page >= totalPages

   const handlePrev = () => setPage(page - 1)
   const handleNext = () => setPage(page + 1)

   if (totalPages <= 1) return null

   return (
      <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
         <button
            type="button"
            onClick={handlePrev}
            disabled={disabled || isFirst}
            className={buttonClass}
         >
            ← Prev
         </button>

         <span className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-medium text-slate-900 dark:text-slate-100">{page}</span> of {totalPages}
         </span>

         <button
            type="button"
            onClick={handleNext}
            disabled={disabled || isLast}
            className={buttonClass}
         >
            Next →
         </button>
      </nav>
   )
}

export default Pagination
