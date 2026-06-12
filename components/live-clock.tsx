'use client'

import { useEffect, useState } from 'react'

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Avoid hydration mismatch: render nothing until mounted
  if (!now) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-40 rounded-md bg-secondary/50 animate-pulse" />
      </div>
    )
  }

  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // B3 trading hours roughly 10:00-17:00 BRT, Mon-Fri
  const day = now.getDay()
  const hour = now.getHours()
  const marketOpen = day >= 1 && day <= 5 && hour >= 10 && hour < 17

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          marketOpen
            ? 'bg-positive text-positive'
            : 'bg-negative text-negative'
        }`}
      >
        <span
          className={`pulse-dot inline-block h-2 w-2 rounded-full ${
            marketOpen ? 'bg-[oklch(0.72_0.24_150)]' : 'bg-[oklch(0.65_0.26_25)]'
          }`}
        />
        {marketOpen ? 'MERCADO ABERTO' : 'MERCADO FECHADO'}
      </div>

      <div className="flex flex-col items-end leading-tight">
        <span className="font-mono text-lg font-bold tabular-nums text-foreground">
          {timeStr}
        </span>
        <span className="text-[11px] capitalize text-muted-foreground">
          {dateStr.replace('.', '')}
        </span>
      </div>
    </div>
  )
}
