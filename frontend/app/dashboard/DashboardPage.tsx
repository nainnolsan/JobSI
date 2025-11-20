// Componente principal del dashboard con las 3 opciones en el header
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJWT, JWTPayload } from "@/shared/lib/decodeJWT";
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
            <div className="text-center max-w-2xl">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-3xl">C</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
                Welcome to CoverME
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Create professional cover letters with AI, manage your profile, and land your dream job.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-12">
                <button
                  onClick={() => setActiveView("Profile")}
                  className="p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Edit your information</p>
                </button>
                <button
                  onClick={() => setActiveView("Cover Letter")}
                  className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 mx-auto bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cover Letters</h3>
                  <p className="text-sm text-gray-600 mt-1">Generate with AI</p>
                </button>
                <button
                  onClick={() => setActiveView("Resume")}
                  className="p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 mx-auto bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Resume</h3>
                  <p className="text-sm text-gray-500 mt-1">Build your CV</p>
                </button>
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 flex flex-col">
      {/* Header principal con navegación */}
      <header className="w-full fixed top-0 left-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg text-gray-900 dark:text-white py-4 px-8 shadow-sm flex items-center justify-between transition-all border-b border-gray-100 dark:border-gray-800">
        {/* Logo/Título */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView("Home")}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">CoverME</h1>
          </div>
          
          {/* Navegación principal */}
          <nav className="flex gap-1">
            {( ["Profile", "Cover Letter", "Resume"] as DashboardView[] ).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === view
                    ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                    : "hover:bg-purple-50 text-gray-600"
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>

        {/* Usuario y menú */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-lg font-bold text-purple-700">
            {nombres ? nombres.split(' ').map(n => n[0]).join('') : (username ? username[0] : '?')}
          </div>
          <span className="text-base font-medium text-gray-700">{nombres ? nombres : (username ? username : "Loading...")}</span>
          
          <div className="relative">
            <button
              className="flex items-center px-2 py-1 rounded-lg hover:bg-purple-50 focus:outline-none transition-colors"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 pt-[72px] px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-100 border-t border-gray-200 py-6 flex items-center justify-center text-gray-600 text-sm">
        © {new Date().getFullYear()} CoverME — Made with ♥
      </footer>
    </div>
  );
}