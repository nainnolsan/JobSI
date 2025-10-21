// CoverLetterView: lista + creación (modo automático y manual)
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CoverLetterSummary {
  id: number;
  title: string;
  company: string | null;
  status: string;
  created_at: string;
}

interface ParsedResult {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  seniority?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  keywords?: string[];
}

export default function CoverLetterView() {
  const [letters, setLetters] = useState<CoverLetterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [config, setConfig] = useState({ template: "Formal", tone: "Profesional", length: "medium", language: "auto" });
  const router = useRouter();

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!rawText.trim()) {
      alert("Por favor pega primero la descripción del trabajo");
      return;
    }
    setParseLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Llamando a parse endpoint...", `${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/parse`);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raw_job_text: rawText })
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Parse resultado:", data);
        setParsed(data.parsed || null);
        alert("✓ Parseado exitoso! Revisa los campos detectados abajo.");
      } else {
        const errorText = await res.text();
        console.error("Parse failed", res.status, errorText);
        alert(`Error al parsear: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Parse error:", err);
      alert(`Error de red al parsear: ${err}`);
    } finally {
      setParseLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!parsed) {
      alert("Primero debes parsear la descripción del trabajo");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      console.log("Llamando a generate endpoint...", `${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/generate`);
      console.log("Datos enviados:", { parsed, config, user_profile: {}, variants: 1 });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ parsed, config, user_profile: {}, variants: 1 })
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Generate resultado:", data);
        const draft = data.variants?.[0];
        if (draft) {
          alert(`✓ Cover letter generada!\n\n${draft.substring(0, 500)}${draft.length > 500 ? '...' : ''}`);
        } else {
          alert("No se generó ninguna variante");
        }
      } else {
        const errorText = await res.text();
        console.error("Generate failed", res.status, errorText);
        alert(`Error al generar: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert(`Error de red al generar: ${err}`);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: parsed?.title || 'Cover Letter', company: parsed?.company || null, raw_job_text: rawText, parsed, config })
      });
      if (res.ok) {
        setShowNewModal(false);
        loadLetters();
      } else {
        console.error("Save failed", await res.text());
        alert("Error guardando borrador");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cover Letters</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowNewModal(true)}>Nueva</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <ul>
            {letters.map((l) => (
              <li key={l.id} className="py-2 border-b last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{l.title}</div>
                    <div className="text-sm text-gray-500">{l.company} · {new Date(l.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => router.push(`/dashboard/cover-letters/${l.id}`)}>Abrir</button>
                    <button className="px-3 py-1 bg-red-100 rounded">Eliminar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nueva Cover Letter</h3>
              <button onClick={() => setShowNewModal(false)} className="text-gray-500">Cerrar</button>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Modo</label>
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded ${mode === 'auto' ? 'bg-blue-100' : 'bg-gray-100'}`} onClick={() => setMode('auto')}>Automático</button>
                <button className={`px-3 py-1 rounded ${mode === 'manual' ? 'bg-blue-100' : 'bg-gray-100'}`} onClick={() => setMode('manual')}>Manual</button>
              </div>
            </div>

            {mode === 'auto' ? (
              <div>
                <label className="block mb-2 font-semibold">Pega aquí la descripción del trabajo</label>
                <textarea className="w-full h-40 border p-2 mb-2" value={rawText} onChange={(e) => setRawText(e.target.value)} />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleParse} disabled={parseLoading}>{parseLoading ? 'Parseando...' : 'Parsear'}</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleGenerate} disabled={!parsed}>Generar</button>
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleSaveDraft}>Guardar borrador</button>
                </div>

                {parsed && (
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold mb-2">Campos detectados (edítalos si es necesario)</h4>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Título</label>
                      <input className="w-full border p-2" value={parsed.title || ''} onChange={(e) => setParsed({ ...parsed, title: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Compañía</label>
                      <input className="w-full border p-2" value={parsed.company || ''} onChange={(e) => setParsed({ ...parsed, company: e.target.value })} />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Responsabilidades (una por línea)</label>
                      <textarea className="w-full border p-2" value={(parsed.responsibilities || []).join('\n')} onChange={(e) => setParsed({ ...parsed, responsibilities: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) })} />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Requisitos (una por línea)</label>
                      <textarea className="w-full border p-2" value={(parsed.requirements || []).join('\n')} onChange={(e) => setParsed({ ...parsed, requirements: e.target.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean) })} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block mb-2 font-semibold">Título de la posición</label>
                <input className="w-full border p-2 mb-2" placeholder="Ej: Ingeniero de Software" />
                <label className="block mb-2 font-semibold">Compañía</label>
                <input className="w-full border p-2 mb-2" placeholder="Ej: ACME S.A." />
                <label className="block mb-2 font-semibold">Descripción / Requisitos</label>
                <textarea className="w-full border p-2 mb-2" />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded">Generar</button>
                  <button className="px-4 py-2 bg-gray-200 rounded">Guardar borrador</button>
                </div>
              </div>
            )}

            <div className="mt-4 text-right">
              <button className="px-4 py-2 bg-gray-200 rounded mr-2" onClick={() => setShowNewModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowNewModal(false); }}>Hecho</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}