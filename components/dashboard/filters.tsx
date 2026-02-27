"use client";

import { Calendar, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sesion } from "@/lib/types";

interface FiltersProps {
  sessions: Sesion[];
  selectedMiccion: string;
  onMiccionChange: (miccion: string) => void;
}

export function Filters({
  sessions,
  selectedMiccion,
  onMiccionChange,
}: FiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id.toString() === selectedMiccion) ?? null,
    [sessions, selectedMiccion],
  );
  const sessionsSorted = [...sessions].sort((a, b) => {
    const aFecha = a.fecha_hora ?? "";
    const bFecha = b.fecha_hora ?? "";
    return bFecha.localeCompare(aFecha);
  });
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessionsSorted;
    const q = searchQuery.trim().toLowerCase();
    return sessionsSorted.filter((s) => {
      const fecha = s.fecha_hora
        ? new Date(s.fecha_hora).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Fecha desconocida";
      const hora = s.fecha_hora ? (s.fecha_hora.split("T")[1]?.slice(0, 5) ?? "") : "";
      const label = `${fecha} ${hora} miccion ${s.numero_sesion_dispositivo}`;
      return label.toLowerCase().includes(q);
    });
  }, [searchQuery, sessionsSorted]);

  const selectedFecha = selectedSession && selectedSession.fecha_hora
    ? new Date(selectedSession.fecha_hora).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : selectedSession ? "Fecha desconocida" : "";
  const selectedHora = selectedSession && selectedSession.fecha_hora
    ? (selectedSession.fecha_hora.split("T")[1]?.slice(0, 5) ?? "")
    : "";

  const handleClearSession = () => {
    onMiccionChange("");
  };

  return (
    <div className="flex flex-row gap-4 flex-nowrap items-start">
      <div className="flex flex-col gap-1 w-full max-w-[587px] flex-1 min-w-0">
        <Label
          htmlFor="session"
          className="text-sm font-medium text-foreground whitespace-nowrap"
        >
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Sesión
          </span>
        </Label>
        <Select value={selectedMiccion} onValueChange={onMiccionChange}>
          <SelectTrigger 
            className="w-full text-black justify-center"
            style={{
              border: "1px solid #000000",
              backgroundColor: "white/80",
            }}
          >
            <span className="text-muted-foreground">
              {sessionsSorted.length === 0
                ? "No hay sesiones registradas"
                : "Seleccionar sesión"}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-background border-border rounded-lg shadow-lg text-black">
            <div className="p-2 border-b border-border bg-background">
              <Input
                placeholder="Filtrar por fecha, hora o micción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-black"
              />
            </div>
            {filteredSessions.map((s) => {
              const fecha = s.fecha_hora
                ? new Date(s.fecha_hora).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Fecha desconocida";
              const hora = s.fecha_hora ? (s.fecha_hora.split("T")[1]?.slice(0, 5) ?? "") : "";
              return (
                <SelectItem
                  key={s.id}
                  value={s.id.toString()}
                  className="rounded-none px-4 py-3 border-b border-border last:border-0 data-[highlighted]:bg-muted/60"
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="flex flex-col">
                      <span className="font-normal text-foreground">
                        {fecha} - Micción #{s.numero_sesion_dispositivo}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {hora}
                      </span>
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      {selectedSession && (
        <div className="flex items-center gap-2 bg-white/80 border border-border rounded-lg px-3 py-3">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {selectedFecha} - Micción #
              {selectedSession.numero_sesion_dispositivo}
            </p>
            <p className="text-sm text-muted-foreground"> Hora de Micción: {selectedHora}</p>
          </div>
          <button
            onClick={handleClearSession}
            className="ml-1 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
