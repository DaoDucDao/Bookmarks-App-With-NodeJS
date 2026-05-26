const shimmerClass = 'animate-pulse rounded bg-slate-200 dark:bg-slate-700'

const BookmarkRowSkeleton = () => (
   <li
      aria-hidden="true"
      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
   >
      <div className="grid min-w-0 flex-1 gap-1.5">
         <div className={`${shimmerClass} h-4 w-2/5`} />
         <div className={`${shimmerClass} h-3 w-3/5`} />
      </div>

      <div className="hidden gap-1 sm:flex">
         <div className={`${shimmerClass} h-5 w-12`} />
         <div className={`${shimmerClass} h-5 w-10`} />
      </div>

      <div className="flex shrink-0 gap-2">
         <div className={`${shimmerClass} h-7 w-28`} />
         <div className={`${shimmerClass} h-7 w-12`} />
         <div className={`${shimmerClass} h-7 w-16`} />
      </div>
   </li>
)

export default BookmarkRowSkeleton
