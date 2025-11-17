"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t: Record<"es" | "en", { title: string; username: string; password: string; login: string }> = {
    es: { title: "Iniciar sesión", username: "Nombre de usuario", password: "Contraseña", login: "Iniciar sesión" },
    en: { title: "Sign in", username: "Username", password: "Password", login: "Sign in" }
  };

  const [lang, setLang] = useState<"es" | "en">("es");
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) html.classList.add("dark"); else html.classList.remove("dark");
  }, [darkMode]);

  return (
    <>
      <div className="fixed top-6 right-6 z-50 cursor-pointer">
        {lang === "es" ? (
          <Image src="/mexico.svg" alt="México" width={32} height={20} className="rounded-md hover:scale-125 transition-transform duration-200" onClick={() => setLang("en")} />
        ) : (
          <Image src="/usa.svg" alt="USA" width={32} height={20} className="rounded-md hover:scale-125 transition-transform duration-200" onClick={() => setLang("es")} />
        )}
      </div>

      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className={`w-full max-w-sm p-8 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-6 text-center">{t[lang].title}</h1>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault(); setLoading(true); setError(null);
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
                router.push("/dashboard?view=home");
              }
            } catch {
              setError(lang === "es" ? "Error de red" : "Network error");
            } finally { setLoading(false); }
          }}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">{t[lang].username}</label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className={`${darkMode ? 'bg-gray-800 text-gray-100 border border-gray-500/40 placeholder:text-gray-400 focus:ring-gray-400/40 focus:border-gray-400/40' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'} mt-1`} placeholder={lang === "es" ? "tusuario" : "username"} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">{t[lang].password}</label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={`${darkMode ? 'bg-gray-800 text-gray-100 border border-gray-500/40 placeholder:text-gray-400 focus:ring-gray-400/40 focus:border-gray-400/40' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'} mt-1`} placeholder={lang === "es" ? "••••••••" : "••••••••"} required />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className={`w-full text-white ${darkMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-amber-400 hover:bg-amber-500'}`} disabled={loading}>
              {loading ? (lang === "es" ? "Entrando..." : "Signing in...") : t[lang].login}
            </Button>
          </form>
          <div className="mt-4 text-center">
            ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <Button variant="outline" onClick={() => setDarkMode(prev => !prev)} className={`${darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-400 border border-gray-300'}`}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </>
  );
}
