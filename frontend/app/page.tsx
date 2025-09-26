// ...existing code...
// Vista de Login minimalista usando TailwindCSS y shadcn/ui
"use client";
import React from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react";
// Usar rutas públicas para las banderas
import { useEffect, useState } from "react";
// Si usas shadcn/ui, normalmente importas los componentes así:
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button"
export default function LoginPage() {
  // Diccionario de traducciones tipado
  const t: Record<"es" | "en", { title: string; email: string; password: string; login: string }> = {
    es: {
      title: "Iniciar sesión",
      email: "Correo electrónico",
      password: "Contraseña",
      login: "Iniciar sesión"
    },
    en: {
      title: "Sign in",
      email: "Email",
      password: "Password",
      login: "Sign in"
    }
  };
  // Estado para idioma
  const [lang, setLang] = useState<"es" | "en">("es");
  // Estado para modo oscuro
  const [darkMode, setDarkMode] = useState(false);

  // Aplica la clase dark al html según el estado
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      {/* Botón flotante para cambiar idioma usando SVGs locales */}
      <div className="fixed top-6 right-6 z-50 cursor-pointer">
        {lang === "es" ? (
          <img src="/mexico.svg" alt="México" className="w-8 h-5 rounded-md hover:scale-125 transition-transform duration-200" onClick={() => setLang("en")} />
        ) : (
          <img src="/usa.svg" alt="USA" className="w-8 h-5 rounded-md hover:scale-125 transition-transform duration-200" onClick={() => setLang("es")} />
        )}
      </div>
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
      >
        {/* Contenedor del formulario */}
        <div
          className={`w-full max-w-sm p-8 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
        >
          <h1 className="text-2xl font-bold mb-6 text-center">{t[lang].title}</h1>
          {/* Formulario de login */}
          <form className="space-y-4">
            {/* Campo de email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">{t[lang].email}</label>
              <Input
                type="email"
                id="email"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-400 selection:bg-blue-400 selection:text-white' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 selection:bg-blue-200 selection:text-gray-900'}`}
                placeholder={lang === "es" ? "tucorreo@ejemplo.com" : "youremail@example.com"}
                required
              />
            </div>
            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">{t[lang].password}</label>
              <Input
                type="password"
                id="password"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-400 selection:bg-blue-400 selection:text-white' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 selection:bg-blue-200 selection:text-gray-900'}`}
                placeholder={lang === "es" ? "••••••••" : "••••••••"}
                required
              />
            </div>
            {/* Botón de login usando shadcn/ui */}
            <Button
              type="submit"
              className={`w-full text-white ${darkMode ? 'bg-purple-500 hover:bg-purple-600 text-gray-100' : 'bg-amber-400 hover:bg-amber-500'}`}
            >
              {t[lang].login}
            </Button>
          </form>
        </div>
        {/* Botón flotante para activar/desactivar modo oscuro */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="outline"
            onClick={() => setDarkMode((prev) => !prev)}
            className={`flex items-center justify-center group transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-400 border border-gray-300'}`}
          >
            {darkMode
              ? <Sun className="w-5 h-5 text-gray-700 group-hover:text-yellow-400 transition-colors duration-200" />
              : <Moon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
            }
          </Button>
        </div>
      </div>
    </>
  );
}