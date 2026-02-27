'use client'

import { Droplets, Gauge, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SessionStats } from '@/lib/types'

interface StatCardsProps {
  stats: SessionStats
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: 'Volumen Maximo',
      value: stats.volumenMaximo.toFixed(1),
      unit: 'ml',
      icon: Droplets,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Caudal Maximo',
      value: stats.caudalMaximo.toFixed(2),
      unit: 'ml/s',
      icon: Gauge,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Tiempo Total',
      value: stats.tiempoTotal.toFixed(1),
      unit: 's',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Caudal Medio',
      value: stats.caudalMedio.toFixed(2),
      unit: 'ml/s',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{card.value}</span>
                  <span className="text-sm text-muted-foreground">{card.unit}</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
