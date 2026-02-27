"use client";
// Indica que este componente se ejecuta en el cliente (navegador),
// no en el servidor.

import { useState, useEffect, useMemo, useCallback } from "react";
// Importa hooks de React: useState (estados) y useEffect (efectos secundarios).
import { PatientSearch } from "./patient-search";
// Importa el componente de búsqueda de pacientes.
// Importa el componente de debug de Supabase.
import { createClient } from "@/lib/supabase/client";
// Importa la función para crear cliente de Supabase.
import { processMediciones, calculateSessionStats } from "@/lib/uroflow-utils";
import { generatePDF } from "@/lib/pdf-generator";
// Importa las funciones de procesamiento de datos.
import type {
  // Importa los tipos TypeScript desde el archivo de tipos.
  Paciente, // Tipo para datos de paciente.
  Sesion, // Tipo para datos de sesión.
  Medicion, // Tipo para datos de medición.
  ProcessedData, // Tipo para datos procesados (con tiempo_s, volumen_ml, caudal_ml_s).
  SessionStats, // Tipo para estadísticas de sesión.
} from "@/lib/types"; // Finaliza la importación de tipos.
import { Download, BarChart3, Droplets, Clock, Zap } from "lucide-react";
// Importa iconos de la librería lucide-react.
import { Filters } from "./filters";
// Importa el componente de filtros (fecha y micción).
import { Charts } from "./charts";
// Importa el componente de gráficos.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PatientSummaryStats = {
  // Tipo local para estadísticas agregadas de todas las sesiones del paciente.
  cantidadMicciones: number; // Total de micciones (sesiones) del paciente.
  volumenPromedio: number; // Promedio de volumen por sesión.
  volumenMaximo: number; // Volumen máximo entre todas las sesiones.
  tiempoTotal: number; // Suma del tiempo total de todas las sesiones.
  caudalMedio: number; // Promedio de caudal medio por sesión.
  caudalMaximo: number; // Caudal máximo entre todas las sesiones.
};

type DiarioMiccionalRow = {
  sesionId: number;
  numeroMiccion: number;
  fecha: string;
  fechaLinea1: string;
  fechaLinea2: string;
  hora: string;
  fechaHora: string | null;
  volumenTotal: number;
  tiempoTotal: number;
  caudalPromedio: number;
  caudalMaximo: number;
};

export function UroflowDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [selectedMiccion, setSelectedMiccion] = useState("");
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const [dataError, setDataError] = useState("");
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    volumenMaximo: 0,
    caudalMaximo: 0,
    tiempoTotal: 0,
    caudalMedio: 0,
  });
  const [diarioRows, setDiarioRows] = useState<DiarioMiccionalRow[]>([]);
  const [diarioError, setDiarioError] = useState("");
  const [diarioFiltro, setDiarioFiltro] = useState<"todo" | "dia" | "noche">(
    "todo",
  );
  const [includeDiarioPDF, setIncludeDiarioPDF] = useState(true);
  const [patientSummary, setPatientSummary] = useState<PatientSummaryStats>({
    cantidadMicciones: 0,
    volumenPromedio: 0,
    volumenMaximo: 0,
    tiempoTotal: 0,
    caudalMedio: 0,
    caudalMaximo: 0,
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSavingObservaciones, setIsSavingObservaciones] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const rawHospital = localStorage.getItem("hospital");
    if (rawHospital) {
      try {
        const parsed = JSON.parse(rawHospital) as { nombre_hospital?: string };
        if (parsed.nombre_hospital) {
          setHospitalName(parsed.nombre_hospital);
        }
      } catch {
        setHospitalName("");
      }
    }
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedPatient) {
        setSessions([]);
        setSelectedMiccion("");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("sesiones")
        .select("*")
        .eq("paciente_id", selectedPatient.id)
        .order("fecha_hora", { ascending: false });

      if (error) {
        setSessions([]);
        setSelectedMiccion("");
        setDataError(`Error cargando sesiones: ${error.message}`);
        return;
      }

      if (data) {
        const normalized = data.map((s) => ({
          ...s,
          observaciones:
            (s as { Observaciones?: string | null }).Observaciones ??
            s.observaciones ??
            null,
        }));
        setSessions(normalized);
        setDataError("");
        if (data.length > 0) {
          setSelectedMiccion("");
        }
      }
    };

    fetchSessions();
  }, [selectedPatient]);

  useEffect(() => {
    const fetchMediciones = async () => {
      if (!selectedPatient || sessions.length === 0 || !selectedMiccion) {
        setProcessedData([]);
        setDataError("");
        setSessionStats({
          volumenMaximo: 0,
          caudalMaximo: 0,
          tiempoTotal: 0,
          caudalMedio: 0,
        });
        return;
      }

      const supabase = createClient();
      const filteredSessions = sessions.filter(
        (s) => s.id === parseInt(selectedMiccion),
      );

      if (filteredSessions.length === 0) {
        setProcessedData([]);
        return;
      }

      const sessionIds = filteredSessions.map((s) => s.id);
      const { data: mediciones, error } = await supabase
        .from("mediciones")
        .select("*")
        .in("sesion_id", sessionIds)
        .order("numero_secuencia", { ascending: true });

      if (error) {
        setProcessedData([]);
        setSessionStats({
          volumenMaximo: 0,
          caudalMaximo: 0,
          tiempoTotal: 0,
          caudalMedio: 0,
        });
        setDataError(`Error cargando mediciones: ${error.message}`);
        return;
      }

      if (!mediciones || mediciones.length === 0) {
        setProcessedData([]);
        setDataError("No hay mediciones para las sesiones seleccionadas");
        return;
      }

      if (mediciones) {
        const processed = processMediciones(mediciones);
        setProcessedData(processed);
        setSessionStats(calculateSessionStats(processed));
        setDataError("");
      }
    };

    fetchMediciones();
  }, [selectedPatient, sessions, selectedMiccion]);

  useEffect(() => {
    const loadObservaciones = () => {
      if (!selectedMiccion || sessions.length === 0) {
        setObservaciones("");
        return;
      }

      const session = sessions.find((s) => s.id === parseInt(selectedMiccion));
      setObservaciones(session?.observaciones ?? "");
    };

    loadObservaciones();
  }, [selectedMiccion, sessions]);

  const saveObservaciones = useCallback(async () => {
    if (!selectedMiccion) return;

    const session = sessions.find((s) => s.id === parseInt(selectedMiccion));
    if (!session) return;

    // Solo guardar si las observaciones cambiaron
    if (session.observaciones === observaciones) return;

    setIsSavingObservaciones(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sesiones")
        .update({ Observaciones: observaciones || null })
        .eq("id", parseInt(selectedMiccion));

      if (error) {
        console.error("Error guardando observaciones:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        // Actualizar el estado local de sessions para reflejar el cambio
        setSessions((prev) =>
          prev.map((s) =>
            s.id === parseInt(selectedMiccion)
              ? { ...s, observaciones }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setIsSavingObservaciones(false);
    }
  }, [observaciones, selectedMiccion, sessions]);

  useEffect(() => {
    if (!selectedMiccion) return;

    const timeoutId = setTimeout(() => {
      void saveObservaciones();
    }, 2000); // Espera 2 segundos después de que el usuario deja de escribir

    return () => clearTimeout(timeoutId);
  }, [observaciones, selectedMiccion, saveObservaciones]);

  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (!selectedPatient || sessions.length === 0) {
        setPatientSummary({
          cantidadMicciones: 0,
          volumenPromedio: 0,
          volumenMaximo: 0,
          tiempoTotal: 0,
          caudalMedio: 0,
          caudalMaximo: 0,
        });
        return;
      }

      const supabase = createClient();
      const sessionIds = sessions.map((s) => s.id);
      const { data: mediciones, error } = await supabase
        .from("mediciones")
        .select("*")
        .in("sesion_id", sessionIds)
        .order("numero_secuencia", { ascending: true });

      if (error || !mediciones || mediciones.length === 0) {
        setPatientSummary({
          cantidadMicciones: sessions.length,
          volumenPromedio: 0,
          volumenMaximo: 0,
          tiempoTotal: 0,
          caudalMedio: 0,
          caudalMaximo: 0,
        });
        return;
      }

      const bySession = new Map<number, Medicion[]>();
      mediciones.forEach((m) => {
        const list = bySession.get(m.sesion_id) ?? [];
        list.push(m);
        bySession.set(m.sesion_id, list);
      });

      const statsBySession = Array.from(bySession.values()).map((list) =>
        calculateSessionStats(processMediciones(list)),
      );

      if (statsBySession.length === 0) {
        setPatientSummary({
          cantidadMicciones: sessions.length,
          volumenPromedio: 0,
          volumenMaximo: 0,
          tiempoTotal: 0,
          caudalMedio: 0,
          caudalMaximo: 0,
        });
        return;
      }

      const cantidadMicciones = statsBySession.length;
      const volumenPromedio =
        statsBySession.reduce((sum, s) => sum + s.volumenMaximo, 0) /
        cantidadMicciones;
      const volumenMaximo = Math.max(
        ...statsBySession.map((s) => s.volumenMaximo),
      );
      const tiempoTotal = statsBySession.reduce(
        (sum, s) => sum + s.tiempoTotal,
        0,
      );
      const caudalMedio =
        statsBySession.reduce((sum, s) => sum + s.caudalMedio, 0) /
        cantidadMicciones;
      const caudalMaximo = Math.max(
        ...statsBySession.map((s) => s.caudalMaximo),
      );

      setPatientSummary({
        cantidadMicciones,
        volumenPromedio,
        volumenMaximo,
        tiempoTotal,
        caudalMedio,
        caudalMaximo,
      });
    };

    fetchPatientSummary();
  }, [selectedPatient, sessions]);

  useEffect(() => {
    const fetchDiarioRows = async () => {
      if (!selectedPatient || sessions.length === 0) {
        setDiarioRows([]);
        setDiarioError("");
        return;
      }

      const supabase = createClient();
      const sessionIds = sessions.map((s) => s.id);
      const { data: mediciones, error } = await supabase
        .from("mediciones")
        .select("*")
        .in("sesion_id", sessionIds)
        .order("numero_secuencia", { ascending: true });

      if (error || !mediciones) {
        setDiarioRows([]);
        setDiarioError(
          `Error cargando mediciones del diario: ${error?.message ?? ""}`,
        );
        return;
      }

      if (mediciones.length === 0) {
        setDiarioRows([]);
        setDiarioError("No hay mediciones para el diario miccional");
        return;
      }

      const bySession = new Map<number, Medicion[]>();
      mediciones.forEach((m) => {
        const list = bySession.get(m.sesion_id) ?? [];
        list.push(m);
        bySession.set(m.sesion_id, list);
      });

      const rows: DiarioMiccionalRow[] = sessions.map((s) => {
        const list = bySession.get(s.id) ?? [];
        const processed = processMediciones(list);
        const stats = calculateSessionStats(processed);
        const caudalMaximo = stats.caudalMaximo;
        
        let fecha = "Fecha desconocida";
        let fechaLinea1 = "Fecha";
        let fechaLinea2 = "desconocida";
        let hora = "";
        
        if (s.fecha_hora) {
          const fechaDate = new Date(s.fecha_hora);
          fecha = fechaDate.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          fechaLinea1 = fechaDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
          });
          fechaLinea2 = fechaDate.toLocaleDateString("es-ES", {
            year: "numeric",
          });
          hora = s.fecha_hora.split("T")[1]?.slice(0, 5) ?? "";
        }

        return {
          sesionId: s.id,
          numeroMiccion: s.numero_sesion_dispositivo,
          fecha,
          fechaLinea1,
          fechaLinea2,
          hora,
          fechaHora: s.fecha_hora,
          volumenTotal: stats.volumenMaximo,
          tiempoTotal: stats.tiempoTotal,
          caudalPromedio: stats.caudalMedio,
          caudalMaximo,
        };
      });

      setDiarioRows(rows);
      setDiarioError("");
    };

    fetchDiarioRows();
  }, [selectedPatient, sessions]);

  const sessionVolumenPromedio =
    processedData.length > 0
      ? processedData.reduce((sum, d) => sum + (d.volumen_ml || 0), 0) /
        processedData.length
      : 0;

  const filteredDiarioRows = useMemo(() => {
    if (diarioRows.length === 0) return [];
    const isDay = (fechaHora: string | null) => {
      if (!fechaHora) return false;
      const date = new Date(fechaHora);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const dayStart = 8 * 60;
      const dayEnd = 21 * 60;
      return totalMinutes >= dayStart && totalMinutes < dayEnd;
    };

    if (diarioFiltro === "todo") return diarioRows;

    return diarioRows.filter((row) =>
      diarioFiltro === "dia" ? isDay(row.fechaHora) : !isDay(row.fechaHora),
    );
  }, [diarioRows, diarioFiltro]);

  const selectedSession = useMemo(() => {
    if (!selectedMiccion) return null;
    const sessionId = parseInt(selectedMiccion, 10);
    return sessions.find((s) => s.id === sessionId) ?? null;
  }, [selectedMiccion, sessions]);

  const handleGeneratePDF = async () => {
    if (!selectedPatient || processedData.length === 0) return;
    setIsGeneratingPDF(true);
    try {
      const averageStats = {
        cantidadMicciones: patientSummary.cantidadMicciones,
        volumenPromedio: patientSummary.volumenPromedio,
        tiempoPromedio:
          patientSummary.cantidadMicciones > 0
            ? patientSummary.tiempoTotal / patientSummary.cantidadMicciones
            : 0,
        caudalPromedio: patientSummary.caudalMedio,
        volumenMaximoPromedio: patientSummary.volumenMaximo,
        tiempoTotalPromedio: patientSummary.tiempoTotal,
        caudalMaximoPromedio: patientSummary.caudalMaximo,
      };

      await generatePDF({
        patient: selectedPatient,
        sessionStats,
        averageStats,
        data: processedData,
        selectedDate: selectedSession?.fecha_hora ?? "",
        selectedMiccion: selectedSession
          ? selectedSession.numero_sesion_dispositivo.toString()
          : "",
        includeDiary: includeDiarioPDF,
        hospitalName: hospitalName,
        observaciones: observaciones || null,
        diaryRows: diarioRows.map((row) => ({
          numeroMiccion: row.numeroMiccion,
          fecha: row.fecha,
          hora: row.hora,
          volumenTotal: row.volumenTotal,
          tiempoTotal: row.tiempoTotal,
          caudalPromedio: row.caudalPromedio,
          caudalMaximo: row.caudalMaximo,
        })),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <aside
        className="w-72 p-6 flex flex-col gap-8 border-r overflow-y-auto"
        style={{
          backgroundColor: "var(--primary)",
          borderColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div>
          <h1 className="text-sm" style={{ color: "rgba(248,250,252,0.8)" }}>
            Uroflujometro
          </h1>
          <p className="text-2xl font-bold mb-1" style={{ color: "#F8FAFC" }}>
            {hospitalName}
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={!selectedPatient || isGeneratingPDF}
          className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-white/20 bg-white/10 text-white backdrop-blur-sm shadow-sm"
        >
          <Download size={18} />
          {isGeneratingPDF ? "Generando..." : "Descargar Informe"}
        </button>

        <div className="flex items-center gap-2 text-white/90">
          <Checkbox
            id="include-diario-pdf"
            checked={includeDiarioPDF}
            onCheckedChange={(value) => setIncludeDiarioPDF(value === true)}
            className="border-white/70 data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <Label htmlFor="include-diario-pdf" className="text-xs">
            Incluir diario miccial en PDF
          </Label>
        </div>

        <div>
          <h3
            className="text-xs uppercase font-semibold mb-4 tracking-wide"
            style={{ color: "rgba(248,250,252,0.8)" }}
          >
            Resumen del Paciente
          </h3>
          <p
            className="text-[11px] mb-3"
            style={{ color: "rgba(248,250,252,0.7)" }}
          >
            Valores promedio de todas las micciones del paciente.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Droplets size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Micciones Totales
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.cantidadMicciones}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Droplets size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Volumen medio promedio
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.volumenPromedio.toFixed(2)} ml
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Droplets size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Volumen máximo promedio
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.volumenMaximo.toFixed(2)} ml
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Clock size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Tiempo total promedio
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.tiempoTotal.toFixed(2)} s
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Zap size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Caudal medio promedio
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.caudalMedio.toFixed(2)} ml/s
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg flex items-start gap-2 border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm">
              <Zap size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(248,250,252,0.75)" }}
                >
                  Caudal máximo promedio
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#F8FAFC" }}
                >
                  {patientSummary.caudalMaximo.toFixed(2)} ml/s
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute right-6 top-6 z-10">
          <img
            src="/gyn-logo.png"
            className="h-20 w-20 rounded-md border border-white/60 bg-white/80 shadow-sm"
          />
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="p-4 mb-6 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-sm">
            <PatientSearch
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
            />
          </div>

          {isMounted && selectedPatient ? (
            <Tabs defaultValue="uroflow" className="space-y-6">
              <TabsList className="bg-white/60 border border-white/60 backdrop-blur-sm relative z-0">
                <TabsTrigger value="uroflow">Uroflujometría</TabsTrigger>
                <TabsTrigger value="diario">Diario miccial</TabsTrigger>
              </TabsList>

              <TabsContent value="uroflow" className="space-y-6">
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div>
                      <Filters
                        sessions={sessions}
                        selectedMiccion={selectedMiccion}
                        onMiccionChange={setSelectedMiccion}
                      />
                    </div>

                    {selectedMiccion && processedData.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Volumen Total
                          </p>
                          <p className="text-xl font-bold">
                            {sessionStats.volumenMaximo.toFixed(2)} ml
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Tiempo Total
                          </p>
                          <p className="text-xl font-bold">
                            {sessionStats.tiempoTotal.toFixed(2)} s
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Caudal Medio
                          </p>
                          <p className="text-xl font-bold">
                            {sessionStats.caudalMedio.toFixed(2)} ml/s
                          </p>
                        </div>

                        <div className="p-4 rounded-lg border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Caudal Máximo
                          </p>
                          <p className="text-xl font-bold">
                            {sessionStats.caudalMaximo.toFixed(2)} ml/s
                          </p>
                        </div>
                      </div>
                    )}

                    {dataError && (
                      <div
                        className="p-4 rounded-lg border mb-6"
                        style={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <p style={{ color: "var(--foreground)" }}>
                          {dataError}
                        </p>
                      </div>
                    )}

                    {selectedMiccion && processedData.length > 0 ? (
                      <>
                        <Charts data={processedData} stats={sessionStats} />
                        <div className="p-4 rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <Label
                              htmlFor="observaciones"
                              className="text-sm font-semibold text-foreground"
                            >
                              Observaciones Medicas
                            </Label>
                            <div className="flex items-center gap-3">
                              {isSavingObservaciones && (
                                <span className="text-xs text-muted-foreground">
                                  Guardando...
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => void saveObservaciones()}
                                disabled={isSavingObservaciones}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                          <Textarea
                            id="observaciones"
                            placeholder="Escriba aqui cualquier observacion sobre esta sesion..."
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="min-h-[120px] resize-y"
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        className="p-8 rounded-lg text-center"
                        style={{
                          backgroundColor: "var(--card)",
                          color: "var(--card-foreground)",
                        }}
                      >
                        <p>
                          {selectedMiccion
                            ? "No hay datos de mediciones para la sesion seleccionada"
                            : "Selecciona una sesion para ver los graficos"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <BarChart3
                      size={64}
                      style={{ color: "var(--muted)" }}
                      className="mb-4"
                    />
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Selecciona un Paciente
                    </h2>
                    <p
                      className="text-center max-w-md"
                      style={{ color: "var(--muted)" }}
                    >
                      Utiliza el buscador de arriba para encontrar un paciente
                      por nombre o documento y visualizar sus datos de
                      uroflujometría.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="diario" className="space-y-6">
                {selectedPatient ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Filtro de horario
                      </p>
                      <ToggleGroup
                        type="single"
                        value={diarioFiltro}
                        onValueChange={(value) => {
                          if (
                            value === "todo" ||
                            value === "dia" ||
                            value === "noche"
                          ) {
                            setDiarioFiltro(value);
                          }
                        }}
                        className="bg-white/60 border border-white/60 backdrop-blur-sm"
                      >
                        <ToggleGroupItem value="todo">Todo</ToggleGroupItem>
                        <ToggleGroupItem value="dia">Día</ToggleGroupItem>
                        <ToggleGroupItem value="noche">Noche</ToggleGroupItem>
                      </ToggleGroup>
                      <p className="text-xs text-muted-foreground">
                        Día: 08:00 a 21:00 · Noche: 21:00 a 08:00
                      </p>
                    </div>

                    {diarioError && (
                      <div
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <p style={{ color: "var(--foreground)" }}>
                          {diarioError}
                        </p>
                      </div>
                    )}

                    {filteredDiarioRows.length > 0 ? (
                      <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/60">
                          <h3 className="text-sm font-semibold text-foreground">
                            Tabla de diario miccial
                          </h3>
                        </div>
                        <Table className="text-sm table-fixed w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">N°</span>
                                <span className="block">Micción</span>
                              </TableHead>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Fecha</span>
                                <span className="block">Registro</span>
                              </TableHead>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Hora</span>
                                <span className="block">Micción</span>
                              </TableHead>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Volumen</span>
                                <span className="block">Total [ml]</span>
                              </TableHead>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Tiempo</span>
                                <span className="block">Total [s]</span>
                              </TableHead>
                              <TableHead className="text-center border-r border-border px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Caudal</span>
                                <span className="block">Promedio [ml/s]</span>
                              </TableHead>
                              <TableHead className="text-center px-2 py-2 text-[13px] leading-tight">
                                <span className="block">Caudal</span>
                                <span className="block">Máximo [ml/s]</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDiarioRows.map((row) => (
                              <TableRow
                                key={row.sesionId}
                                className="[&>td]:px-2 [&>td]:py-2"
                              >
                                <TableCell className="text-center border-r border-border font-medium">
                                  {row.numeroMiccion}
                                </TableCell>
                                <TableCell className="text-center border-r border-border text-[13px] leading-tight">
                                  <span className="block">
                                    {row.fechaLinea1}
                                  </span>
                                  <span className="block text-[12px] text-muted-foreground">
                                    {row.fechaLinea2}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center border-r border-border">
                                  {row.hora}
                                </TableCell>
                                <TableCell className="text-center border-r border-border">
                                  {row.volumenTotal.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center border-r border-border">
                                  {row.tiempoTotal.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center border-r border-border">
                                  {row.caudalPromedio.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {row.caudalMaximo.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div
                        className="p-8 rounded-lg text-center"
                        style={{
                          backgroundColor: "var(--card)",
                          color: "var(--card-foreground)",
                        }}
                      >
                        <p>
                          No hay datos de diario miccial para el filtro
                          seleccionado
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <BarChart3
                      size={64}
                      style={{ color: "var(--muted)" }}
                      className="mb-4"
                    />
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Selecciona un Paciente
                    </h2>
                    <p
                      className="text-center max-w-md"
                      style={{ color: "var(--muted)" }}
                    >
                      Utiliza el buscador de arriba para encontrar un paciente
                      por nombre o documento y visualizar su diario miccial.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div
              className="p-8 rounded-lg text-center"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
              }}
            >
              <p>
                {isMounted
                  ? "Selecciona un paciente para ver las pestañas."
                  : "Cargando pestañas..."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
