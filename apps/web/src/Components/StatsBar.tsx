import { useEffect, useState } from 'react'

type Props = {
   total: number
   tagCount: number
}

const COUNT_UP_DURATION = 600

const useCountUp = (target: number) => {
   const [value, setValue] = useState(0)

   useEffect(() => {
      if (target === 0) {
         setValue(0)
         return
      }

      const start = performance.now()
      let animationId = 0

      const tick = (now: number) => {
         const progress = Math.min((now - start) / COUNT_UP_DURATION, 1)
         setValue(Math.round(target * progress))
         if (progress < 1) animationId = requestAnimationFrame(tick)
      }

      animationId = requestAnimationFrame(tick)

      return () => cancelAnimationFrame(animationId)
   }, [target])

   return value
}

const StatsBar = ({ total, tagCount }: Props) => {
   const animatedTotal = useCountUp(total)
   const animatedTags = useCountUp(tagCount)

   return (
      <div className="mb-6 grid grid-cols-2 gap-3 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4 dark:border-slate-800 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-pink-500/15">
         <div>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
               {animatedTotal}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Bookmarks saved</p>
         </div>

         <div>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
               {animatedTags}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Tags in use</p>
         </div>
      </div>
   )
}

export default StatsBar
