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

// (ParsedResult type is declared inside the component to match the normalized shape returned by the backend)

export default function CoverLetterView() {
  const [letters, setLetters] = useState<CoverLetterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [step, setStep] = useState<"select-mode" | "input-data" | "review">("select-mode");
  const [rawText, setRawText] = useState("");
  interface ParsedResult {
    title: string;
    company: string;
    responsibilities: string[];
    requirements: string[];
    confidence: number;
    method: 'ai' | 'heuristic';
    language: string;
  }

  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [config] = useState({ template: "Formal", tone: "Profesional", length: "medium", language: "auto" });
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
    if (!rawText.trim()) return;
    
    setParseLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ raw_job_text: rawText })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Normalize parsed response: ensure confidence is a number [0..1], method and language set
        const incoming = data.parsed || null;
        if (incoming) {
          const normalized = {
            title: incoming.title || "",
            company: incoming.company || "",
            responsibilities: incoming.responsibilities || [],
            requirements: incoming.requirements || [],
            confidence: typeof incoming.confidence === 'number' && isFinite(incoming.confidence) ? incoming.confidence : 0,
            method: incoming.method === 'heuristic' ? 'heuristic' : 'ai',
            language: incoming.language || 'en'
          };
          setParsed(normalized as ParsedResult);
        } else {
          setParsed(null);
        }
        setStep("review");
      } else {
        const errorText = await res.text();
        console.error("Parse failed", res.status, errorText);
        // TODO: Mostrar error en UI
      }
    } catch (err) {
      console.error("Parse error:", err);
      // TODO: Mostrar error en UI
    } finally {
      setParseLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!parsed) return;
    
    setGenerateLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cover-letters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ parsed, config, user_profile: {}, variants: 1 })
      });
      
      if (res.ok) {
        const data = await res.json();
        const draft = data.variants?.[0];
        if (draft) {
          // TODO: Mostrar preview modal con el texto generado
          handleSaveDraft();
        }
      } else {
        const errorText = await res.text();
        console.error("Generate failed", res.status, errorText);
        // TODO: Mostrar error en UI
      }
    } catch (err) {
      console.error("Generate error:", err);
      // TODO: Mostrar error en UI
    } finally {
      setGenerateLoading(false);
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

      <div 
        className="bg-white rounded-lg shadow-lg transition-all hover:shadow-xl cursor-pointer"
        onClick={() => !loading && setShowNewModal(true)}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : letters.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes cover letters</h3>
            <p className="text-gray-500">Haz click en cualquier parte para crear una nueva</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {letters.map((l) => (
              <div key={l.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{l.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {l.company && <span className="mr-2">{l.company}</span>}
                      <span>{new Date(l.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/cover-letters/${l.id}`);
                      }}
                    >
                      Abrir
                    </button>
                    <button 
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Nueva Cover Letter</h3>
                <button 
                  onClick={() => setShowNewModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <h4 className="text-gray-600 mb-6">
                {step === "select-mode" && "Selecciona cómo quieres crear tu cover letter"}
                {step === "input-data" && (mode === "auto" ? "Pega la descripción del trabajo" : "Ingresa los detalles manualmente")}
                {step === "review" && "Revisa y genera tu cover letter"}
              </h4>
            </div>

            {/* Modal content based on current step */}
            <div className="flex-1">
              {step === "select-mode" && (
                <div className="grid md:grid-cols-2 gap-4 p-6">
                  <button
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      mode === 'auto' 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setMode('auto')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">Modo Automático</h3>
                      <p className="text-gray-500 text-sm">Pega la descripción del trabajo y generaremos una cover letter personalizada usando IA</p>
                    </div>
                    {mode === 'auto' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    className={`relative p-6 rounded-lg border-2 transition-all ${
                      mode === 'manual' 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setMode('manual')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">Modo Manual</h3>
                      <p className="text-gray-500 text-sm">Crea tu cover letter paso a paso con nuestro asistente guiado</p>
                    </div>
                    {mode === 'manual' && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {step === "input-data" && (
                <div className="p-6">
                  {mode === "auto" ? (
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-64 rounded-lg border-2 border-gray-200 p-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Pega aquí la descripción completa del trabajo..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                      />
                      <button
                        className={`w-full py-3 rounded-lg text-white transition-colors ${
                          parseLoading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                        onClick={handleParse}
                        disabled={parseLoading || !rawText.trim()}
                      >
                        {parseLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Analizando...</span>
                          </div>
                        ) : (
                          "Analizar descripción"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título del puesto
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                          placeholder="Ej: Software Engineer"
                          value={parsed?.title || ""}
                          onChange={(e) => parsed && setParsed({ ...parsed, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                          placeholder="Ej: Acme Inc."
                          value={parsed?.company || ""}
                          onChange={(e) => parsed && setParsed({ ...parsed, company: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción del puesto
                        </label>
                        <textarea
                          className="w-full h-32 rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                          placeholder="Describe las responsabilidades y requisitos principales..."
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "review" && parsed && (
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {parsed.method === 'ai' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        )}
                      </svg>
                      <span>{parsed.method === 'ai' ? 'Analizado con IA' : 'Análisis heurístico'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Confianza: {Number.isFinite(parsed.confidence) ? Math.round(parsed.confidence * 100) + '%' : 'N/A'}</span>
                    </div>
                    {parsed.language && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span>Idioma detectado: {parsed.language.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título detectado
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                        value={parsed?.title || ""}
                        onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa detectada
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                        value={parsed?.company || ""}
                        onChange={(e) => setParsed({ ...parsed, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsabilidades detectadas
                      </label>
                      <textarea
                        className="w-full h-32 rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                        value={parsed?.responsibilities?.join("\n") || ""}
                        onChange={(e) =>
                          setParsed({
                            ...parsed,
                            responsibilities: e.target.value
                              .split(/\r?\n/)
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requisitos detectados
                      </label>
                      <textarea
                        className="w-full h-32 rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                        value={parsed?.requirements?.join("\n") || ""}
                        onChange={(e) =>
                          setParsed({
                            ...parsed,
                            requirements: e.target.value
                              .split(/\r?\n/)
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className={`flex-1 py-3 rounded-lg text-white transition-colors ${
                        generateLoading
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      onClick={handleGenerate}
                      disabled={generateLoading}
                    >
                      {generateLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generando...</span>
                        </div>
                      ) : (
                        "Generar cover letter"
                      )}
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      onClick={handleSaveDraft}
                    >
                      Guardar borrador
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 p-6">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (step === "select-mode") {
                    setShowNewModal(false);
                  } else {
                    setStep("select-mode");
                    setParsed(null);
                    setRawText("");
                  }
                }}
              >
                {step === "select-mode" ? "Cancelar" : "Atrás"}
              </button>
              {step === "select-mode" && (
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  onClick={() => setStep("input-data")}
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}