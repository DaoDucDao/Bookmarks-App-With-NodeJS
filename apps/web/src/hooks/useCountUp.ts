import { useEffect, useState } from 'react'

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

export { useCountUp }
