'use client'

import React from "react"

import { Download, Activity, Droplets, Clock, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AverageStats } from '@/lib/types'

interface SidebarProps {
  averageStats: AverageStats
  onDownloadPDF: () => void
  isGeneratingPDF: boolean
}

export function Sidebar({ averageStats, onDownloadPDF, isGeneratingPDF }: SidebarProps) {
  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary">Uroflujometro</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Sistema de Monitoreo</p>
      </div>

      <div className="p-4">
        <Button
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingPDF ? 'Generando...' : 'Descargar Informe'}
        </Button>
      </div>

      <div className="flex-1 p-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-4">
          Estadisticas Promedio
        </h2>
        
        <div className="space-y-3">
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Cantidad de Micciones"
            value={averageStats.cantidadMicciones.toString()}
          />
          <StatCard
            icon={<Droplets className="w-5 h-5" />}
            label="Volumen Promedio"
            value={`${averageStats.volumenPromedio.toFixed(1)} ml`}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Tiempo Promedio"
            value={`${averageStats.tiempoPromedio.toFixed(1)} s`}
          />
          <StatCard
            icon={<Gauge className="w-5 h-5" />}
            label="Caudal Promedio"
            value={`${averageStats.caudalPromedio.toFixed(2)} ml/s`}
          />
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          v1.0.0 - Dashboard Medico
        </p>
      </div>
    </aside>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-sidebar-accent rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-xs text-sidebar-foreground/70">{label}</p>
          <p className="text-lg font-semibold text-sidebar-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}
