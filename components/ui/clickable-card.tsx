"use client"

import type React from "react"

import { motion, useAnimation } from "framer-motion"
import Link from "next/link"
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Particle {
  id: number
  x: number
  y: number
  type: "star" | "heart" | "sparkle" | "flower"
  color: string
}

interface ClickableCardProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  particleColors?: string[]
}

const particleEmojis = {
  star: "⭐",
  heart: "❤️",
  sparkle: "✨",
  flower: "🌸",
}

export function ClickableCard({ children, onClick, href, className, particleColors }: ClickableCardProps) {
  const controls = useAnimation()
  const [particles, setParticles] = useState<Particle[]>([])

  const defaultColors = ["#FFB6C1", "#FFD700", "#87CEEB", "#DDA0DD", "#F0E68C", "#FFE4E1"]
  const colors = particleColors || defaultColors

  const createParticles = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const particleTypes: Array<"star" | "heart" | "sparkle" | "flower"> = ["star", "heart", "sparkle", "flower"]
      const newParticles: Particle[] = []

      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: Date.now() + i,
          x,
          y,
          type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }

      setParticles((prev) => [...prev, ...newParticles])

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
      }, 1000)
    },
    [colors],
  )

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    createParticles(event)

    await controls.start({
      scale: [1, 1.05, 0.98, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    })

    if (onClick) {
      setTimeout(() => onClick(), 200)
    }
  }

  const cardBody = (
    <Card
      className={cn("cursor-pointer transition-all duration-300 hover:shadow-2xl relative overflow-hidden", className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
    >
      {children}
    </Card>
  )

  const wrapper = (
    <motion.div
      className="relative"
      animate={controls}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {cardBody}

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none text-2xl z-50"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 150,
            y: particle.y - Math.random() * 150 - 50,
            opacity: 0,
            scale: [0, 1.2, 0.8, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${particle.color})`,
          }}
        >
          {particleEmojis[particle.type]}
        </motion.div>
      ))}
    </motion.div>
  )

  if (href && !onClick) {
    return (
      <Link href={href} className="block">
        {wrapper}
      </Link>
    )
  }

  return wrapper
}
