// ...existing code...
// Vista de Login minimalista usando TailwindCSS y shadcn/ui
"use client";
import React from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
// Si usas shadcn/ui, normalmente importas los componentes así:
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button"
export default function LoginPage() {
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              {/* Contenedor del formulario */}
              <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Iniciar sesión</h1>
        {/* Formulario de login */}
        <form className="space-y-4">
          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <Input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-900 dark:text-gray-100"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          {/* Campo de contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <Input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-900 dark:text-gray-100"
              placeholder="••••••••"
              required
            />
          </div>
          {/* Botón de login usando shadcn/ui */}
      <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-gray-900">Iniciar sesión</Button>
        </form>
      </div>
      {/* Botón flotante para activar/desactivar modo oscuro */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="outline"
          onClick={() => setDarkMode((prev) => !prev)}
          className={darkMode
            ? "bg-gray-900 text-yellow-400 border-yellow-400 flex items-center justify-center"
            : "bg-white text-gray-400 border-gray-300 flex items-center justify-center group"
          }
        >
          {darkMode
            ? <Sun className="w-5 h-5 text-yellow-400" />
            : <Moon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
          }
        </Button>
      </div>
    </div>
  );
}