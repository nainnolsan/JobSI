"use client";
console.log("DashboardPage montado");
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJWT } from "@/lib/decodeJWT";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [nombres, setNombres] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fallback para esperar el token si no está disponible al primer render
    const checkToken = () => {
      const token = localStorage.getItem("token");
      console.log("Token JWT en localStorage:", token);
      if (!token) {
        setTimeout(checkToken, 100); // Espera 100ms y vuelve a intentar
        return;
      }
      try {
        const decoded = decodeJWT(token);
        console.log("Objeto decodificado del JWT:", decoded);
        setUsername(decoded && decoded.username ? decoded.username : "Usuario");
        setNombres(decoded && decoded.nombres ? decoded.nombres : null);
      } catch {
        setUsername("Usuario");
      }
    };
    checkToken();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header blanco, nombre y avatar a la izquierda, menú desplegable a la derecha */}
      <header className="w-full bg-white text-gray-900 py-4 px-8 shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar círculo */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
            {/* Iniciales del nombre */}
            {nombres ? nombres.split(' ').map(n => n[0]).join('') : (username ? username[0] : '?')}
          </div>
          {/* Nombre */}
          <span className="text-lg font-semibold">{nombres ? nombres : (username ? username : "Cargando...")}</span>
          {/* Flecha desplegable */}
          <div className="relative">
            <button
              className="flex items-center px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Menú desplegable */}
            {showMenu && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Dashboard dividido en tres columnas */}
      <div className="flex w-full h-[calc(100vh-64px)]">{/* 64px = header */}
        {/* Menú lateral izquierdo */}
        <aside className="w-56 bg-white border-r flex flex-col items-center py-8 gap-6">
          <h2 className="text-xl font-bold mb-4">Progreso</h2>
          {/* Aquí irán los pasos del cover letter */}
          <ul className="w-full flex flex-col gap-2">
            <li className="px-4 py-2 rounded bg-blue-50 text-blue-700 font-semibold">Datos personales</li>
            <li className="px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">Experiencia</li>
            <li className="px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">Educación</li>
            <li className="px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">Habilidades</li>
            <li className="px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">Resumen</li>
          </ul>
        </aside>
        {/* Área principal */}
        <main className="flex-1 p-12 flex flex-col items-center justify-center">
          <p className="text-gray-700 dark:text-gray-200 text-2xl font-semibold">
            {nombres ? `Hola ${nombres}, ¡comienza tu cover letter!` : "¡Bienvenido a tu dashboard!"}
          </p>
          {/* Aquí irá el contenido principal para subir información */}
        </main>
        {/* Área derecha libre */}
        <aside className="w-72 bg-transparent border-l"></aside>
      </div>
    </div>
  );
}
