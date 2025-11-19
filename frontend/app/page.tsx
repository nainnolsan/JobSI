'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg w-full p-8 rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">
        <h1 className="text-3xl font-bold mb-2">JobSI</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Genera tu CV y cover letters con IA.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Entrar</Link>
          <Link href="/register" className="px-5 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
