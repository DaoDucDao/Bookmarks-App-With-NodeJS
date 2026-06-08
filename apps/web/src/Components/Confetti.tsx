import { useEffect, useRef } from 'react'

type Props = {
   trigger: number
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

const PARTICLE_COUNT = 28

const FRAME_COUNT = 50

const Confetti = ({ trigger }: Props) => {
   const canvasRef = useRef<HTMLCanvasElement>(null)

   useEffect(() => {
      if (trigger === 0) return

      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d')
      if (!context) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const width = (canvas.width = canvas.offsetWidth)
      const height = (canvas.height = canvas.offsetHeight)

      const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
         x: width / 2,
         y: height / 2,
         vx: (Math.random() - 0.5) * 8,
         vy: Math.random() * -7 - 2,
         size: Math.random() * 5 + 3,
         color: COLORS[Math.floor(Math.random() * COLORS.length)],
         rotation: Math.random() * 360,
         spin: (Math.random() - 0.5) * 18,
      }))

      let frame = 0
      let animationId = 0

      const tick = () => {
         frame += 1
         context.clearRect(0, 0, width, height)

         particles.forEach((particle) => {
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += 0.35
            particle.rotation += particle.spin

            context.save()
            context.translate(particle.x, particle.y)
            context.rotate((particle.rotation * Math.PI) / 180)
            context.fillStyle = particle.color
            context.globalAlpha = Math.max(0, 1 - frame / FRAME_COUNT)
            context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
            context.restore()
         })

         if (frame < FRAME_COUNT) animationId = requestAnimationFrame(tick)
         else context.clearRect(0, 0, width, height)
      }

      tick()

      return () => cancelAnimationFrame(animationId)
   }, [trigger])

   return (
      <canvas
         ref={canvasRef}
         aria-hidden="true"
         className="pointer-events-none absolute inset-0 h-full w-full"
      />
   )
}

export default Confetti
