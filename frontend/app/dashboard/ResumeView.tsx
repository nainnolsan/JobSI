// Vista para Resume/CV
"use client";
import React from "react";

export default function ResumeView() {
  return (
    <div className="flex w-full flex-1 items-center justify-center pt-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Resume</h2>
        <p className="text-gray-600 text-lg">
          Generador de CV profesionales basado en tu perfil
        </p>
        <div className="mt-8 text-gray-500">
          Próximamente disponible...
        </div>
      </div>
    </div>
  );
}