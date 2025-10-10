"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface ClickableCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  particleColors?: string[]
}

export default function ClickableCard({
  children,
  onClick,
  className,
  particleColors = ["#FFB6C1", "#FFD700", "#DDA0DD"],
}: ClickableCardProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const velocity = 2 + Math.random() * 2
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createParticles(x, y)
    }
    onClick?.()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setParticles((prevParticles) => {
        const updatedParticles = prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1,
            life: particle.life - 0.02,
          }))
          .filter((particle) => particle.life > 0)

        updatedParticles.forEach((particle) => {
          ctx.globalAlpha = particle.life
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2)
          ctx.fill()
        })

        return updatedParticles
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      const card = cardRef.current
      if (canvas && card) {
        canvas.width = card.offsetWidth
        canvas.height = card.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  return (
    <div ref={cardRef} className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: "100%", height: "100%" }}
      />
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          className,
        )}
        onClick={handleClick}
      >
        {children}
      </Card>
    </div>
  )
}
