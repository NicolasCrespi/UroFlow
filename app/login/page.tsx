"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [hospitalQuery, setHospitalQuery] = useState("");
  const [hospitalResults, setHospitalResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const normalizedQuery = useMemo(
    () => hospitalQuery.trim().toLowerCase(),
    [hospitalQuery],
  );

  useEffect(() => {
    const searchHospitals = async () => {
      if (normalizedQuery.length < 2) {
        setHospitalResults([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("hospitales")
        .select("nombre_hospital")
        .ilike("nombre_hospital", `%${normalizedQuery}%`)
        .limit(20);

      if (!fetchError && data) {
        const unique = Array.from(
          new Set(
            data
              .map((row) => row.nombre_hospital)
              .filter((value) => typeof value === "string" && value.trim()),
          ),
        );
        setHospitalResults(unique);
      } else {
        setHospitalResults([]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(searchHospitals, 250);
    return () => clearTimeout(debounce);
  }, [normalizedQuery]);

  const handleSelectHospital = (value: string) => {
    setHospitalQuery(value);
    setIsOpen(false);
  };

  const handleLogin = async () => {
    setError("");
    if (!hospitalQuery.trim() || !password.trim()) {
      setError("Completa hospital y contraseña.");
      return;
    }

    const supabase = createClient();
    const { data: hospitalData, error: hospitalError } = await supabase
      .from("hospitales")
      .select("id, nombre_hospital, password_hash")
      .ilike("nombre_hospital", hospitalQuery.trim())
      .limit(1)
      .maybeSingle();

    if (hospitalError || !hospitalData) {
      setError("Usuario incorrecto.");
      return;
    }

    if (hospitalData.password_hash !== password.trim()) {
      setError("Contraseña incorrecta.");
      return;
    }

    localStorage.setItem(
      "hospital",
      JSON.stringify({
        id: hospitalData.id,
        nombre_hospital: hospitalData.nombre_hospital,
      }),
    );
    localStorage.setItem(
      "doctor",
      JSON.stringify({
        id: hospitalData.id,
        nombre: hospitalData.nombre_hospital,
        hospital: hospitalData.nombre_hospital,
      }),
    );
    router.push("/dash");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/fondo.png')] bg-cover bg-center p-6">
      <form
        className="w-full max-w-lg bg-white border border-border rounded-2xl shadow-sm p-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleLogin();
        }}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <img
            src="/gyn-logo.png"
            alt="GyN Health Technologies"
            className="h-40 w-auto"
          />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Portal de Gestión Clínica | GyN Health Technologies
            </h1>
            <p className="text-sm text-muted-foreground">
              Inicie sesión para acceder a los datos de pacientes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hospital">Hospital o Clinica</Label>
          <div className="relative">
            <Input
              id="hospital"
              placeholder="Buscar hospital o clinica..."
              value={hospitalQuery}
              onChange={(event) => {
                setHospitalQuery(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            {isOpen && hospitalQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Buscando...
                  </div>
                ) : hospitalResults.length > 0 ? (
                  hospitalResults.map((hospital) => (
                    <button
                      key={hospital}
                      onClick={() => handleSelectHospital(hospital)}
                      className="w-full text-left px-4 py-2 hover:bg-muted/60 border-b border-border last:border-0"
                    >
                      {hospital}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No se encontraron hospitales
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive/40 bg-destructive/10 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <Button
          className="w-full py-5 px-6 rounded-lg font-bold flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors"
          type="submit"
          onClick={handleLogin}
        >
          Ingresar
        </Button>
      </form>
    </div>
  );
}
