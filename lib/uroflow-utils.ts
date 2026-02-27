import type { Medicion, ProcessedData, SessionStats } from "./types"; // Importa los tipos necesarios desde el archivo de tipos.

// Comentario original en inglés con la densidad aproximada de la orina.
const URINE_DENSITY = 1.0175; // Constante que define la densidad de la orina en g/ml para convertir peso a volumen.

//flujo
//Supabase → mediciones (datos crudos de la BD)
//processMediaciones(mediciones) → processed (datos transformados con tiempo, volumen, caudal)
//setProcessedData(processed) → Se usa para los gráficos en <Charts data={processedData} />
//calculateSessionStats(processed) → Se usa para las estadísticas que se muestran (actualmente no las estás mostrando, pero están calculadas)
export function processMediciones(mediciones: Medicion[]): ProcessedData[] {
  // Función que transforma mediciones crudas en datos procesados.
  if (!mediciones || mediciones.length === 0) return []; // Si no hay mediciones, devuelve un array vacío.

  const sorted = [...mediciones].sort(
    //Los tres puntos se llaman Spread Operator.
    // Su función es crear una copia exacta del array original.
    // Crea una copia del array y la ordena.
    //.sort() es una herramienta de JavaScript que sirve
    // para reorganizar los elementos de un array(destructiva)
    (a, b) => a.numero_secuencia - b.numero_secuencia,
    // Orden ascendente por numero_secuencia.
  ); // Finaliza la llamada a sort.

  const processed: ProcessedData[] = [];
  // Inicializa el array donde se guardarán los datos procesados.

  for (let i = 0; i < sorted.length; i++) {
    // Recorre todas las mediciones ordenadas.
    const current = sorted[i]; // Toma la medición actual según el índice.
    const secuencia = Number(current.numero_secuencia);
    // Assumimos que cada secuencia representa 100ms (ajustar según tu dispositivo) // Comentario original: cada secuencia son 100ms.
    const tiempo_s = secuencia * 0.252;
    // Convierte la secuencia a segundos

    //  Comentario original: convertir peso a volumen.
    const peso = Number(current.peso);
    const peso_g = Number.isFinite(peso) ? peso : 0;
    const volumen_ml = peso_g / URINE_DENSITY; // Calcula el volumen en ml usando la densidad de la orina.

    // Comentario original: calcula el caudal como derivada.
    let caudal_ml_s = 0; // Inicializa el caudal en 0 por defecto.
    //let es la palabra clave que usamos en JavaScript para declarar
    //variables que pueden cambiar su valor (variables mutables).
    //La variable let solo vive dentro de las llaves { } donde fue creada.
    if (i > 0) {
      // Solo calcula el caudal si hay una medición previa.
      const prev = sorted[i - 1]; // Obtiene la medición anterior.
      const prevSecuencia = Number(prev.numero_secuencia);
      const deltaTime = 0.252; // Inicia el cálculo del delta de tiempo. // Diferencia de secuencias convertida a segundos.
      const prevPeso = Number(prev.peso);
      const prevVolumen =
        (Number.isFinite(prevPeso) ? prevPeso : 0) / URINE_DENSITY; // Calcula el volumen de la medición anterior.
      const deltaVolumen = volumen_ml - prevVolumen; // Diferencia de volumen entre la medición actual y la anterior.

      if (Number.isFinite(deltaTime) && deltaTime > 0) {
        // Evita divisiones por cero o tiempos negativos.
        caudal_ml_s = deltaVolumen / deltaTime; // Calcula el caudal (ml/s).
      } // Cierra la validación de deltaTime.
    } // Cierra la validación de i > 0.

    processed.push({
      // Agrega un nuevo punto procesado al array.
      tiempo_s: Number(tiempo_s.toFixed(2)), // Redondea el tiempo a 2 decimales y lo convierte a número.
      peso_g: Number(peso_g.toFixed(2)),
      volumen_ml: Number(volumen_ml.toFixed(2)), // Redondea el volumen a 2 decimales y lo convierte a número.
      caudal_ml_s: Math.max(0, Number(caudal_ml_s.toFixed(2))), // Redondea el caudal y lo fuerza a no ser negativo.
    }); // Cierra el objeto y el push.
  } // Cierra el bucle for.

  return processed; // Devuelve el array de datos procesados.
} // Cierra la función processMediaciones.

export function calculateSessionStats(data: ProcessedData[]): SessionStats {
  // Función que calcula estadísticas de una sesión.
  if (!data || data.length === 0) {
    // Si no hay datos, devuelve estadísticas en cero.
    return {
      // Retorna un objeto con valores base en cero.
      volumenMaximo: 0, // Volumen máximo en cero.
      caudalMaximo: 0, // Caudal máximo en cero.
      tiempoTotal: 0, // Tiempo total en cero.
      caudalMedio: 0, // Caudal medio en cero.
    }; // Cierra el objeto de retorno.
  } // Cierra el if de datos vacíos.

  const volumenMaximo = Math.max(...data.map((d) => d.volumen_ml));
  // Obtiene el volumen máximo del conjunto.
  const caudalMaximo = Math.max(...data.map((d) => d.caudal_ml_s));
  // Obtiene el caudal máximo del conjunto.
  const tiempoTotal = Math.max(...data.map((d) => d.tiempo_s));
  // Obtiene el tiempo total como el máximo tiempo.

  // Average flow rate (excluding zero values at start/end) // Comentario original: promedio excluyendo ceros.
  const flowRates = data // Comienza una cadena para filtrar caudales positivos.
    .filter((d) => d.caudal_ml_s > 0) // Conserva solo valores de caudal mayores a cero.
    .map((d) => d.caudal_ml_s); // Extrae el valor del caudal de cada punto.
  const caudalMedio = // Inicia el cálculo del caudal medio.
    flowRates.length > 0 // Si hay valores positivos...
      ? flowRates.reduce((a, b) => a + b, 0) / flowRates.length // ...promedia sumando y dividiendo por cantidad.
      : 0; // Si no hay valores, devuelve 0.

  return {
    // Devuelve el objeto con estadísticas finales.
    volumenMaximo: Number(volumenMaximo.toFixed(1)), // Redondea volumen máximo a 1 decimal.
    caudalMaximo: Number(caudalMaximo.toFixed(2)), // Redondea caudal máximo a 2 decimales.
    tiempoTotal: Number(tiempoTotal.toFixed(1)), // Redondea tiempo total a 1 decimal.
    caudalMedio: Number(caudalMedio.toFixed(2)), // Redondea caudal medio a 2 decimales.
  }; // Cierra el objeto de retorno.
} // Cierra la función calculateSessionStats.

export function formatDate(dateString: string): string {
  // Función que formatea una fecha en español.
  return new Date(dateString).toLocaleDateString("es-ES", {
    // Crea un Date y lo formatea con locale es-ES.
    year: "numeric", // Muestra el año en formato numérico.
    month: "long", // Muestra el mes con nombre completo.
    day: "numeric", // Muestra el día en formato numérico.
  }); // Cierra la configuración del formateo.
} // Cierra la función formatDate.
