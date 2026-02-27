"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { ProcessedData, SessionStats } from "@/lib/types";

interface ChartsProps {
  data: ProcessedData[];
  stats: SessionStats;
}

export function Charts({ data }: ChartsProps) {
  const fallbackData: ProcessedData[] = [
    { tiempo_s: 0, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 1, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 2, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 3, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 4, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 5, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
    { tiempo_s: 6, peso_g: 0, volumen_ml: 0, caudal_ml_s: 0 },
  ];
  const safeData =
    data && data.length > 0
      ? data.filter(
          (d) =>
            Number.isFinite(d.tiempo_s) &&
            Number.isFinite(d.peso_g) &&
            Number.isFinite(d.volumen_ml) &&
            Number.isFinite(d.caudal_ml_s),
        )
      : fallbackData;

  const maxVolumen = Math.max(300, ...safeData.map((d) => d.volumen_ml));
  const maxCaudal = Math.max(30, ...safeData.map((d) => d.caudal_ml_s));
  const maxTiempo = Math.max(60, ...safeData.map((d) => d.tiempo_s));

  return (
    <div className="flex flex-col gap-6">
      <FlowRateChart data={safeData} maxY={maxCaudal} maxX={maxTiempo} />
      <VolumeChart data={safeData} maxY={maxVolumen} maxX={maxTiempo} />
    </div>
  );
}

function VolumeChart({ data, maxY, maxX }: { data: ProcessedData[]; maxY: number; maxX: number }) {
  return (
    <Card className="border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Grafico de Volumen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[170px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 24, bottom: 24 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9DCED2" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9DCED2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
              <XAxis
                dataKey="tiempo_s"
                stroke="#5A6B85"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                type="number"
                domain={[0, maxX]}
                allowDataOverflow={true}
                label={{
                  value: "Tiempo (seg)",
                  position: "bottom",
                  offset: 8,
                  fill: "#5A6B85",
                }}
              />
              <YAxis
                stroke="#5A6B85"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, maxY]}
                allowDataOverflow={true}
                label={{
                  value: "Volumen (mL)",
                  angle: -90,
                  position: "left",
                  offset: 0,
                  fill: "#5A6B85",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #D9E2EF",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [
                  `${value.toFixed(2)} mL`,
                  "Volumen",
                ]}
                labelFormatter={(label) => `Tiempo: ${label} seg`}
              />
              <Area
                type="monotone"
                dataKey="volumen_ml"
                stroke="#2D4675"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function FlowRateChart({ data, maxY, maxX }: { data: ProcessedData[]; maxY: number; maxX: number }) {
  return (
    <Card className="border border-white/60 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Grafico de Caudal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[170px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 24, bottom: 24 }}
            >
              <defs>
                <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9DCED2" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9DCED2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
              <XAxis
                dataKey="tiempo_s"
                stroke="#5A6B85"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                type="number"
                domain={[0, maxX]}
                allowDataOverflow={true}
                label={{
                  value: "Tiempo (seg)",
                  position: "bottom",
                  offset: 8,
                  fill: "#5A6B85",
                }}
              />
              <YAxis
                stroke="#5A6B85"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, maxY]}
                allowDataOverflow={true}
                label={{
                  value: "Caudal (ml/s)",
                  angle: -90,
                  position: "left",
                  offset: 0,
                  fill: "#5A6B85",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #D9E2EF",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [
                  `${value.toFixed(2)} ml/s`,
                  "Caudal",
                ]}
                labelFormatter={(label) => `Tiempo: ${label} s`}
              />
              <Area
                type="monotone"
                dataKey="caudal_ml_s"
                stroke="#9DCED2"
                strokeWidth={2}
                fill="url(#flowGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
