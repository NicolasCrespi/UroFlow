export interface Paciente {
  id: number;
  documento: string;
  nombre: string;
  hospital_id: number;
  creado_en: string;
}

export interface Sesion {
  id: number;
  paciente_id: number;
  numero_sesion_dispositivo: number;
  fecha_hora: string | null;
  observaciones?: string | null;
}

export interface Medicion {
  id: number;
  sesion_id: number;
  numero_secuencia: number;
  peso: number;
}

export interface ProcessedData {
  tiempo_s: number;
  peso_g: number;
  volumen_ml: number;
  caudal_ml_s: number;
}

export interface SessionStats {
  volumenMaximo: number;
  caudalMaximo: number;
  tiempoTotal: number;
  caudalMedio: number;
}

export interface AverageStats {
  cantidadMicciones: number;
  volumenPromedio: number;
  tiempoPromedio: number;
  caudalPromedio: number;
  volumenMaximoPromedio?: number;
  tiempoTotalPromedio?: number;
  caudalMaximoPromedio?: number;
}
