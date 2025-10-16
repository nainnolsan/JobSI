// Vista para Cover Letter
"use client";
import React from "react";

export default function CoverLetterView() {
  return (
    <div className="flex w-full flex-1 items-center justify-center pt-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">Cover Letter</h2>
        <p className="text-gray-600 text-lg">
          Herramienta para generar cartas de presentación personalizadas
        </p>
        <div className="mt-8 text-gray-500">Haz click donde quieras para iniciar una nueva cover letter</div>
      </div>
    </div>
  );
}