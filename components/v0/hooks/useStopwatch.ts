"use client"

import { useState, useEffect, useRef } from "react"

interface UseStopwatchReturn {
  running: boolean
  seconds: number
  start: () => void
  stop: () => void
  reset: () => void
}

export function useStopwatch(initial = 0): UseStopwatchReturn {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(initial)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [running])

  const start = () => setRunning(true)
  const stop = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setSeconds(initial)
  }

  return { running, seconds, start, stop, reset }
}
