// ...existing code...
// Vista de Login minimalista usando TailwindCSS y shadcn/ui
"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Si usas shadcn/ui, normalmente importas los componentes así:
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button"
export default function LoginPage() {
  // Diccionario de traducciones tipado
  const t: Record<"es" | "en", { title: string; username: string; password: string; login: string }> = {
    es: {
      title: "Iniciar sesión",
      username: "Nombre de usuario",
      password: "Contraseña",
      login: "Iniciar sesión"
    },
    en: {
      title: "Sign in",
      username: "Username",
      password: "Password",
      login: "Sign in"
    }
  };
  // Estado para idioma
  const [lang, setLang] = useState<"es" | "en">("es");
  // Estado para modo oscuro
  const [darkMode, setDarkMode] = useState(false);
  // Estado para login
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error || (lang === "es" ? "Credenciales incorrectas" : "Invalid credentials"));
              } else {
                localStorage.setItem("token", data.token);
                setError(null);
                router.push("/dashboard");
              }
            } catch (err) {
              setError(lang === "es" ? "Error de red" : "Network error");
            } finally {
              setLoading(false);
            }
          }}>
            {/* Campo de username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium">{t[lang].username}</label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${darkMode ? 'bg-gray-800 text-gray-100 border border-gray-500/40 placeholder:text-gray-400 selection:bg-blue-400 selection:text-white focus:ring-1 focus:ring-gray-400/40 focus:border-gray-400/40' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 selection:bg-blue-200 selection:text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'}`}
                placeholder={lang === "es" ? "tusuario" : "username"}
                required
              />
            </div>
            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">{t[lang].password}</label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${darkMode ? 'bg-gray-800 text-gray-100 border border-gray-500/40 placeholder:text-gray-400 selection:bg-blue-400 selection:text-white focus:ring-1 focus:ring-gray-400/40 focus:border-gray-400/40' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 selection:bg-blue-200 selection:text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'}`}
                placeholder={lang === "es" ? "••••••••" : "••••••••"}
                required
              />
            </div>
            {/* Botón de login usando shadcn/ui */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className={`w-full text-white ${darkMode ? 'bg-purple-500 hover:bg-purple-600 text-gray-100' : 'bg-amber-400 hover:bg-amber-500'}`}
              disabled={loading}
            >
              {loading ? (lang === "es" ? "Entrando..." : "Signing in...") : t[lang].login}
            </Button>
          </form>
          <div className="mt-4 text-center">
            ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
          </div>
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