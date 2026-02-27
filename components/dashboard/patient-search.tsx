"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Paciente } from "@/lib/types";

interface PatientSearchProps {
  selectedPatient: Paciente | null;
  onSelectPatient: (patient: Paciente | null) => void;
}

export function PatientSearch({
  selectedPatient,
  onSelectPatient,
}: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Paciente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const rawHospital = localStorage.getItem("hospital");
    if (!rawHospital) {
      setHospitalId(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawHospital) as { id?: number };
      setHospitalId(typeof parsed.id === "number" ? parsed.id : null);
    } catch {
      setHospitalId(null);
    }
  }, []);

  useEffect(() => {
    const searchPatients = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      if (hospitalId === null) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      const normalizeText = (value: string) =>
        value
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();

      const normalizedQuery = normalizeText(query);

      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("nombre", { ascending: true })
        .limit(100);

      if (!error && data) {
        const filtered = data.filter((patient) => {
          const nombre = normalizeText(patient.nombre ?? "");
          const documento = (patient.documento ?? "").toLowerCase();
          return (
            nombre.includes(normalizedQuery) ||
            documento.includes(normalizedQuery)
          );
        });
        setResults(filtered.slice(0, 10));
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [query, hospitalId]);

  const handleSelect = (patient: Paciente) => {
    onSelectPatient(patient);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectPatient(null);
    setQuery("");
  };

  return (
    <div className="flex items-center gap-4 flex-1">
      <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar paciente por nombre o DNI..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 bg-white/80 border-border border-black"
        />

        {isOpen && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-[60] max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Buscando...
              </div>
            ) : results.length > 0 ? (
              results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/60 flex items-center gap-3 border-b border-border last:border-0"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-normal text-foreground">
                      {patient.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      DNI: {patient.documento}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron pacientes
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
          <User className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {selectedPatient.nombre}
            </p>
            <p className="text-sm text-muted-foreground">
              DNI: {selectedPatient.documento}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
