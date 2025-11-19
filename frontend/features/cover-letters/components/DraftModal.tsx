import React from 'react';
import { ParsedResult } from '../types';

type Step = 'select-mode' | 'input-data' | 'review';

interface Props {
  open: boolean;
  editingId: number | null;
  step: Step;
  setStep: (s: Step) => void;
  mode: 'manual' | 'auto';
  setMode: (m: 'manual' | 'auto') => void;
  rawText: string;
  setRawText: (v: string) => void;
  parsed: ParsedResult | null;
  setParsed: React.Dispatch<React.SetStateAction<ParsedResult | null>>;
  parseLoading: boolean;
  generateLoading: boolean;
  onParse: () => void;
  onGenerate: () => void;
  onSaveDraft: () => void;
  onClose: () => void;
}

export function DraftModal({ open, editingId, step, setStep, mode, setMode, rawText, setRawText, parsed, setParsed, parseLoading, generateLoading, onParse, onGenerate, onSaveDraft, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Editar Cover Letter' : 'Nueva Cover Letter'}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h4 className="text-gray-600 mb-6">
            {step === 'select-mode' && 'Selecciona cómo quieres crear tu cover letter'}
            {step === 'input-data' && (mode === 'auto' ? 'Pega la descripción del trabajo' : 'Ingresa los detalles manualmente')}
            {step === 'review' && 'Revisa y genera tu cover letter'}
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'select-mode' && (
            <div className="grid md:grid-cols-2 gap-4 p-6 pb-8">
              <button
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  mode === 'auto' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
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
                  mode === 'manual' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
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

          {step === 'input-data' && (
            <div className="p-6 pb-8">
              {mode === 'auto' ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-64 rounded-lg border-2 border-gray-200 p-4 focus:border-blue-500 focus:ring-0 transition-colors"
                    placeholder="Pega aquí la descripción completa del trabajo..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                  <button
                    className={`w-full py-3 rounded-lg text-white transition-colors ${
                      parseLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={onParse}
                    disabled={parseLoading || !rawText.trim()}
                  >
                    {parseLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analizando...</span>
                      </div>
                    ) : (
                      'Analizar descripción'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título del puesto</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                      placeholder="Ej: Software Engineer"
                      value={parsed?.title || ''}
                      onChange={(e) => parsed && setParsed({ ...parsed, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                      placeholder="Ej: Acme Inc."
                      value={parsed?.company || ''}
                      onChange={(e) => parsed && setParsed({ ...parsed, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del puesto</label>
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

          {step === 'review' && parsed && (
            <div className="p-6 pb-8">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título detectado</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    value={parsed?.title || ''}
                    onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa detectada</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    value={parsed?.company || ''}
                    onChange={(e) => setParsed({ ...parsed, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsabilidades detectadas</label>
                  <textarea
                    className="w-full h-32 rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    value={parsed?.responsibilities?.join('\n') || ''}
                    onChange={(e) =>
                      setParsed({
                        ...parsed,
                        responsibilities: e.target.value
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      } as ParsedResult)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos detectados</label>
                  <textarea
                    className="w-full h-32 rounded-lg border-2 border-gray-200 p-3 focus:border-blue-500 focus:ring-0 transition-colors"
                    value={parsed?.requirements?.join('\n') || ''}
                    onChange={(e) =>
                      setParsed({
                        ...parsed,
                        requirements: e.target.value
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      } as ParsedResult)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className={`flex-1 py-3 rounded-lg text-white transition-colors ${
                    generateLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={onGenerate}
                  disabled={generateLoading}
                >
                  {generateLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generando...</span>
                    </div>
                  ) : (
                    'Generar cover letter'
                  )}
                </button>
                <button
                  className="px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={onSaveDraft}
                >
                  Guardar borrador
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => {
              if (step === 'select-mode') {
                onClose();
              } else {
                setStep('select-mode');
                setParsed(null);
                setRawText('');
              }
            }}
          >
            {step === 'select-mode' ? 'Cancelar' : 'Atrás'}
          </button>
          {step === 'select-mode' && (
            <button
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={() => setStep('input-data')}
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
