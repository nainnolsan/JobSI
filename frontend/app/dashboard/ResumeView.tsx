// Vista para Resume/CV
"use client";
import React, { useState } from "react";

export default function ResumeView() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDebugPost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        raw_job_text: 'Prueba rápida desde UI\nRESPONSIBILITIES:\n- Do X\n\nREQUIREMENTS:\n- Req A'
      };

      const resp = await fetch('/api/cover-letters/parse-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      console.log('parse-debug response', data);
      setResult({ status: resp.status, body: data });
    } catch (err: any) {
      console.error('Error calling parse-debug', err);
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 items-center justify-center pt-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Resume</h2>
        <p className="text-gray-600 text-lg">Generador de CV profesionales basado en tu perfil</p>

        <div className="mt-8">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={runDebugPost}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Run backend log test'}
          </button>
        </div>

        {result && (
          <div className="mt-6 text-left max-w-xl mx-auto bg-gray-50 p-4 rounded shadow-sm">
            <div className="font-semibold">Response (status: {result.status})</div>
            <pre className="text-sm mt-2 whitespace-pre-wrap">{JSON.stringify(result.body, null, 2)}</pre>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600">Error: {error}</div>
        )}

        <div className="mt-8 text-gray-500">Puedes usar este botón para forzar un POST al endpoint de debug y ver los logs del servidor.</div>
      </div>
    </div>
  );
}