import type {
  Paciente,
  SessionStats,
  AverageStats,
  ProcessedData,
} from "./types";
import { formatDate } from "./uroflow-utils";

interface PDFData {
  patient: Paciente;
  sessionStats: SessionStats;
  averageStats: AverageStats;
  data: ProcessedData[];
  selectedDate: string;
  selectedMiccion: string;
  includeDiary: boolean;
  hospitalName: string;
    observaciones?: string | null;
  diaryRows: Array<{
    numeroMiccion: number;
    fecha: string;
    hora: string;
    volumenTotal: number;
    tiempoTotal: number;
    caudalPromedio: number;
    caudalMaximo: number;
  }>;
}

export async function generatePDF(pdfData: PDFData): Promise<void> {
  const {
    patient,
    sessionStats,
    averageStats,
    data,
    selectedDate,
    selectedMiccion,
    includeDiary,
    hospitalName,
      observaciones,
    diaryRows,
  } = pdfData;

  const createSvgChart = (
    rows: ProcessedData[],
    key: "volumen_ml" | "caudal_ml_s",
    title: string,
    yLabel: string,
  ) => {
    const width = 2000;
    const height = 400;
    const padding = 50;
    const tickCount = 5;
    if (!rows || rows.length === 0) return "";

    const safeRows = rows.filter(
      (d) => Number.isFinite(d.tiempo_s) && Number.isFinite(d[key]),
    );
    if (safeRows.length === 0) return "";

    const minX = Math.min(...safeRows.map((d) => d.tiempo_s));
    const maxX = Math.max(...safeRows.map((d) => d.tiempo_s));
    const minY = Math.min(...safeRows.map((d) => d[key]));
    const maxY = Math.max(...safeRows.map((d) => d[key]));

    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;

    const points = safeRows
      .map((d) => {
        const x =
          padding + ((d.tiempo_s - minX) / xRange) * (width - padding * 2);
        const y =
          height -
          padding -
          ((d[key] - minY) / yRange) * (height - padding * 2);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

    const xTicks = Array.from(
      { length: tickCount },
      (_, i) => minX + (xRange * i) / (tickCount - 1),
    );
    const yTicks = Array.from(
      { length: tickCount },
      (_, i) => minY + (yRange * i) / (tickCount - 1),
    );

    const xTickMarks = xTicks
      .map((value) => {
        const x = padding + ((value - minX) / xRange) * (width - padding * 2);
        return `
          <line x1="${x}" y1="${height - padding}" x2="${x}" y2="${height - padding + 6}" stroke="#000" stroke-width="1" />
          <text x="${x}" y="${height - padding + 20}" text-anchor="middle" font-size="11" fill="#000">${value.toFixed(1)}</text>
        `;
      })
      .join("");

    const yTickMarks = yTicks
      .map((value) => {
        const y =
          height - padding - ((value - minY) / yRange) * (height - padding * 2);
        return `
          <line x1="${padding - 6}" y1="${y}" x2="${padding}" y2="${y}" stroke="#000" stroke-width="1" />
          <text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#000">${value.toFixed(1)}</text>
        `;
      })
      .join("");

    return `
      <div class="chart">
        <div class="chart-title">${title}</div>
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
          <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#000" stroke-width="1" />
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#000" stroke-width="1" />
          ${yTickMarks}
          ${xTickMarks}
          <polyline fill="none" stroke="#000" stroke-width="2" points="${points}" />
          <text x="${width / 2}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#000">Tiempo (seg)</text>
          <text x="16" y="${height / 2}" text-anchor="middle" font-size="12" fill="#000" transform="rotate(-90 16 ${height / 2})">${yLabel}</text>
        </svg>
      </div>
    `;
  };

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "Por favor, permite las ventanas emergentes para descargar el informe.",
    );
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe Uroflujometria - ${patient.nombre}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1f2937;
          background: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #000000;
        }
        .header h1 {
          color: #000000;
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          color: #333333;
          font-size: 14px;
        }
        .patient-info {
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #000000;
          margin-bottom: 25px;
        }
        .patient-info h2 {
          color: #000000;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .patient-info p {
          color: #000000;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 25px;
        }
        .section h3 {
          color: #000000;
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000000;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .stat-card {
          background: #ffffff;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #000000;
        }
        .stat-card .label {
          color: #333333;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-card .value {
          color: #000000;
          font-size: 24px;
          font-weight: bold;
          margin-top: 5px;
        }
        .stat-card .unit {
          color: #333333;
          font-size: 14px;
          font-weight: normal;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        .data-table th,
        .data-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #000000;
        }
        .data-table th {
          background: #ffffff;
          font-weight: 600;
          color: #000000;
          border-top: 1px solid #000000;
        }
        .data-table td,
        .data-table th {
          border-right: 1px solid #000000;
        }
        .data-table tr td:last-child,
        .data-table tr th:last-child {
          border-right: none;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #000000;
          text-align: center;
          color: #333333;
          font-size: 12px;
        }
        .average-stats {
          background: #ffffff;
          color: #000000;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #000000;
          margin-bottom: 25px;
        }
        .average-stats h3 {
          color: #000000;
          border-bottom-color: #000000;
        }
        .average-stats .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .average-stats .stat-card {
          background: #ffffff;
          border: 1px solid #000000;
        }
        .average-stats .stat-card .label {
          color: #333333;
        }
        .average-stats .stat-card .value {
          color: #000000;
        }
        .chart {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 6px;
          text-align: center;
        }
        .chart svg {
          max-width: 100%;
          height: auto;
        }
        }
        @media print {
          body { padding: 20px; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${hospitalName || "HOSPITAL"}</h1>
        <p>Informe de Uroflujometria</p>
      </div>

      <div class="patient-info">
        <h2>Datos del Paciente</h2>
        <p><strong>Nombre:</strong> ${patient.nombre}</p>
        <p><strong>DNI:</strong> ${patient.documento}</p>
        <p><strong>Fecha del Informe:</strong> ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
        ${selectedDate ? `<p><strong>Fecha de Sesión:</strong> ${formatDate(selectedDate)}</p>` : ""}
        ${selectedDate ? `<p><strong>Hora de Sesión:</strong> ${new Date(selectedDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>` : ""}
        ${selectedMiccion && selectedMiccion !== "all" ? `<p><strong>Micción #:</strong> ${selectedMiccion}</p>` : ""}
      </div>

      <div class="average-stats">
        <div class="section">
          <h3>Estadisticas Promedio del Paciente</h3>
          <p>Valores promedio de todas las micciones del paciente.</p>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="label">Micciones Totales</div>
              <div class="value">${averageStats.cantidadMicciones}</div>
            </div>
            <div class="stat-card">
              <div class="label">Volumen medio promedio</div>
              <div class="value">${averageStats.volumenPromedio.toFixed(1)} <span class="unit">ml</span></div>
            </div>
            <div class="stat-card">
              <div class="label">Volumen máximo promedio</div>
              <div class="value">${(averageStats.volumenMaximoPromedio ?? 0).toFixed(1)} <span class="unit">ml</span></div>
            </div>
            <div class="stat-card">
              <div class="label">Tiempo total promedio</div>
              <div class="value">${(averageStats.tiempoTotalPromedio ?? 0).toFixed(1)} <span class="unit">s</span></div>
            </div>
            <div class="stat-card">
              <div class="label">Caudal medio promedio</div>
              <div class="value">${averageStats.caudalPromedio.toFixed(2)} <span class="unit">ml/s</span></div>
            </div>
            <div class="stat-card">
              <div class="label">Caudal máximo promedio</div>
              <div class="value">${(averageStats.caudalMaximoPromedio ?? 0).toFixed(2)} <span class="unit">ml/s</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Resultados de la Sesion Seleccionada</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Volumen Maximo</div>
            <div class="value">${sessionStats.volumenMaximo.toFixed(1)} <span class="unit">ml</span></div>
          </div>
          <div class="stat-card">
            <div class="label">Caudal Maximo</div>
            <div class="value">${sessionStats.caudalMaximo.toFixed(2)} <span class="unit">ml/s</span></div>
          </div>
          <div class="stat-card">
            <div class="label">Tiempo Total</div>
            <div class="value">${sessionStats.tiempoTotal.toFixed(1)} <span class="unit">s</span></div>
          </div>
          <div class="stat-card">
            <div class="label">Caudal Medio</div>
            <div class="value">${sessionStats.caudalMedio.toFixed(2)} <span class="unit">ml/s</span></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Graficos de la Sesion</h3>
        ${createSvgChart(data, "caudal_ml_s", "Grafico de Caudal", "Caudal (mL/s)")}
        ${createSvgChart(data, "volumen_ml", "Grafico de Volumen", "Volumen (mL)")}
      </div>

      ${
        observaciones
          ? `
      <div class="section">
        <h3>Observaciones Médicas</h3>
        <div style="padding: 15px; background: #f8f9fa; border-left: 4px solid #000000; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
          ${observaciones}
        </div>
      </div>
      `
          : ""
      }

      ${
        includeDiary && diaryRows.length > 0
          ? `
        <div class="section">
          <h3>Diario miccial</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>N° Micción</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Volumen Total (ml)</th>
                <th>Tiempo Total (s)</th>
                <th>Caudal Promedio (ml/s)</th>
                  <th>Caudal Máximo (ml/s)</th>
              </tr>
            </thead>
            <tbody>
              ${diaryRows
                .map(
                  (row) => `
                <tr>
                  <td>${row.numeroMiccion}</td>
                  <td>${row.fecha}</td>
                  <td>${row.hora}</td>
                  <td>${row.volumenTotal.toFixed(2)}</td>
                  <td>${row.tiempoTotal.toFixed(2)}</td>
                  <td>${row.caudalPromedio.toFixed(2)}</td>
                  <td>${row.caudalMaximo.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>Informe generado por el dispositivo Uroflow de GyN Health Technologies</p>
        <p>Este documento es confidencial y para uso medico exclusivamente.</p>
      </div>
    </body>
    </html>
  `;

  const fileDate = selectedDate ? new Date(selectedDate) : new Date();
  const fileDateStr = fileDate
    .toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
  const fileTimeStr = fileDate
    .toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/:/g, "-");
  const miccionLabel = selectedMiccion ? `-miccion-${selectedMiccion}` : "";
  const patientLabel = patient.nombre
    ? patient.nombre
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
    : "paciente";
  const fileName = `informe-${patientLabel}-${fileDateStr}-${fileTimeStr}${miccionLabel}.pdf`;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.document.title = fileName;
    printWindow.print();
  };
}
