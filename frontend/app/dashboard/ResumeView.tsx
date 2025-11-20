// Vista para Resume/CV
"use client";
import React, { useState } from "react";

type DebugResult = {
  status: number;
  body: unknown;
};

export default function ResumeView() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDebugPost = async (): Promise<void> => {
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

      const data: unknown = await resp.json();
      console.log('parse-debug response', data);
      setResult({ status: resp.status, body: data });
    } catch (err: unknown) {
      console.error('Error calling parse-debug', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 items-center justify-center pt-12">
      <div className="text-center max-w-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">Resume Builder</h2>
        <p className="text-gray-600 text-lg mb-12">Professional CV generator based on your profile — Coming Soon</p>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Development Tools</h3>
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all"
            onClick={runDebugPost}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Run Backend Test'}
          </button>

          {result && (
            <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Response (status: {result.status})</div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(result.body, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">Error: {error}</div>
          )}

          <p className="mt-6 text-sm text-gray-500">Debug tool to test backend connectivity and logging</p>
        </div>
      </div>
    </div>
  );
}