// ...existing code...
// Vista de Login minimalista usando TailwindCSS y shadcn/ui
import React from "react";
// Si usas shadcn/ui, normalmente importas los componentes así:
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Contenedor del formulario */}
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        {/* Formulario de login */}
        <form className="space-y-4">
          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            {/* Si tienes el componente Input de shadcn/ui, úsalo aquí */}
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          {/* Campo de contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            {/* Si tienes el componente Input de shadcn/ui, úsalo aquí */}
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="••••••••"
              required
            />
          </div>
          {/* Botón de login */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}