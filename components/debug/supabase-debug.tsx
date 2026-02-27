"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SupabaseDebug() {
  const [status, setStatus] = useState("Verificando...");
  const [tables, setTables] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = createClient();

        // Intenta obtener todos los pacientes
        const {
          data: pacientes,
          error: pError,
          count,
        } = await supabase
          .from("pacientes")
          .select("*", { count: "exact" })
          .limit(10);

        if (pError) {
          setError(`Error: ${pError.message}`);
          setStatus("❌ Error de conexión");
          return;
        }

        if (pacientes && pacientes.length > 0) {
          setStatus("✅ Conectado a Supabase");
          setTables(pacientes);
        } else {
          setStatus("✅ Conectado a Supabase (sin datos)");
          setError("No hay pacientes en la base de datos");
        }
      } catch (err: any) {
        setError(err.message);
        setStatus("❌ Error");
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-4 bg-card border border-border rounded-lg m-4">
      <h3 className="font-bold mb-2">Debug Supabase</h3>
      <p className="mb-2">{status}</p>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <p className="text-sm">Pacientes encontrados: {tables.length}</p>
      {tables.length > 0 && (
        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
          {JSON.stringify(tables, null, 2)}
        </pre>
      )}
    </div>
  );
}
