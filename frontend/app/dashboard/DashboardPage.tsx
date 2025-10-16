// Componente principal del dashboard con las 3 opciones en el header
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJWT, JWTPayload } from "@/lib/decodeJWT";
import ProfileView from "./ProfileView";
import CoverLetterView from "./CoverLetterView";
import ResumeView from "./ResumeView";

type DashboardView = "Home" | "Profile" | "Cover Letter" | "Resume";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>("Home");
  // read search params from window.location inside useEffect (avoid useSearchParams during prerender)
  const [username, setUsername] = useState<string | null>(null);
  const [nombres, setNombres] = useState<string | null>(null);
  const [jwtPayload, setJWTPayload] = useState<JWTPayload | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setTimeout(checkToken, 100);
        return;
      }
      try {
        const decoded = decodeJWT(token);
        setUsername(decoded && decoded.username ? decoded.username : "Usuario");
        setNombres(decoded && decoded.nombres ? decoded.nombres : null);
        setJWTPayload(decoded);
      } catch {
        setUsername("Usuario");
      }
    };
    checkToken();
    // If view param provided (e.g. /dashboard?view=profile), set active view (read from window on client)
    let viewParam: string | null = null;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      viewParam = params.get("view");
    }
    if (viewParam) {
      const normalized = viewParam === "home" ? "Home" : (viewParam === "profile" ? "Profile" : (viewParam === "cover" ? "Cover Letter" : (viewParam === "resume" ? "Resume" : null)));
      if (normalized) setActiveView(normalized as DashboardView);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const renderView = () => {
    switch (activeView) {
      case "Home":
        return (
          <div className="flex w-full flex-1 items-center justify-center pt-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-blue-700 mb-4">Bienvenido a JobSI</h2>
              <p className="text-gray-600 text-lg">Aquí podrás completar tu perfil, subir tu CV y generar cartas de presentación.</p>
              <div className="mt-8 text-gray-500">Cuando estés listo, haz clic en &quot;Profile&quot; para editar tus datos.</div>
            </div>
          </div>
        );
      case "Profile":
        return <ProfileView jwtPayload={jwtPayload} />;
      case "Cover Letter":
        return <CoverLetterView />;
      case "Resume":
        return <ResumeView />;
      default:
        return <ProfileView jwtPayload={jwtPayload} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header principal con navegación */}
      <header className="w-full fixed top-0 left-0 z-20 bg-white/60 backdrop-blur-lg text-gray-900 py-4 px-8 shadow flex items-center justify-between transition-all">
        {/* Logo/Título */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-700 cursor-pointer" onClick={() => setActiveView("Home")}>JobSI</h1>
          
          {/* Navegación principal */}
          <nav className="flex gap-1">
            {( ["Profile", "Cover Letter", "Resume"] as DashboardView[] ).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === view
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>

        {/* Usuario y menú */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
            {nombres ? nombres.split(' ').map(n => n[0]).join('') : (username ? username[0] : '?')}
          </div>
          <span className="text-lg font-semibold">{nombres ? nombres : (username ? username : "Cargando...")}</span>
          
          <div className="relative">
            <button
              className="flex items-center px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
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

      {/* Contenido principal */}
      <main className="flex-1 pt-[72px] px-12">
        <div className="w-full max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-gray-200 py-6 flex items-center justify-center text-gray-600 font-semibold text-sm">
        © {new Date().getFullYear()} JobSI — Hecho con ♥ por nainnolsan
      </footer>
    </div>
  );
}