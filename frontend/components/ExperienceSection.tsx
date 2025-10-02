import React, { useState, useEffect } from "react";

export interface Experience {
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  ubicacion?: string;
}

const ExperienceSection: React.FC = () => {
  const [experiencias, setExperiencias] = useState<Experience[]>([]);
  const [form, setForm] = useState<Experience>({
    empresa: "",
    puesto: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    ubicacion: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar experiencias al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiences`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExperiencias(data);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No autenticado");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          empresa: form.empresa,
          puesto: form.puesto,
          fechaInicio: form.fechaInicio ? form.fechaInicio + "-01" : "",
          fechaFin: form.fechaFin ? form.fechaFin + "-01" : "",
          descripcion: form.descripcion,
          ubicacion: form.ubicacion
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar experiencia");
      setExperiencias([...experiencias, form]);
      setForm({ empresa: "", puesto: "", fechaInicio: "", fechaFin: "", descripcion: "", ubicacion: "" });
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
      setTimeout(() => setError(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">Experiencia Laboral</h3>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(true)}>
        Agregar experiencia
      </button>
      {showForm && (
        <form className="bg-white rounded shadow p-6 mb-6 flex flex-col gap-4" onSubmit={handleAdd}>
          <input name="empresa" value={form.empresa} onChange={handleChange} placeholder="Empresa" className="border rounded px-3 py-2" required />
          <input name="puesto" value={form.puesto} onChange={handleChange} placeholder="Puesto" className="border rounded px-3 py-2" required />
          <div className="flex gap-2">
            <input name="fechaInicio" type="month" value={form.fechaInicio} onChange={handleChange} className="border rounded px-3 py-2 w-1/2" required />
            <input name="fechaFin" type="month" value={form.fechaFin} onChange={handleChange} className="border rounded px-3 py-2 w-1/2" required />
          </div>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="border rounded px-3 py-2" rows={2} />
          <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación (opcional)" className="border rounded px-3 py-2" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
          {success && <div className="text-green-600 text-sm mt-2">¡Experiencia guardada!</div>}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      )}
      <ul className="flex flex-col gap-4">
        {experiencias.map((exp, idx) => (
          <li key={idx} className="bg-gray-50 rounded shadow p-4">
            <div className="font-bold text-lg">{exp.puesto} en {exp.empresa}</div>
            <div className="text-sm text-gray-600">{exp.fechaInicio} - {exp.fechaFin} {exp.ubicacion && `| ${exp.ubicacion}`}</div>
            <div className="mt-2">{exp.descripcion}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceSection;
