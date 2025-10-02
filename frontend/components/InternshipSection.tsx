import React, { useState, useEffect } from "react";

export interface Internship {
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  ubicacion?: string;
}

interface BackendInternship {
  empresa: string;
  puesto: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  ubicacion?: string;
}

const InternshipSection: React.FC = () => {
  const [pasantias, setPasantias] = useState<Internship[]>([]);
  const [form, setForm] = useState<Internship>({
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

  // Cargar pasantías al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internships`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Mapear campos del backend a los del frontend
          const mapped = data.map((pas: BackendInternship) => ({
            empresa: pas.empresa,
            puesto: pas.puesto,
            fechaInicio: pas.fecha_inicio,
            fechaFin: pas.fecha_fin,
            descripcion: pas.descripcion,
            ubicacion: pas.ubicacion
          }));
          setPasantias(mapped);
        }
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.puesto,
          company: form.empresa,
          start_date: form.fechaInicio,
          end_date: form.fechaFin,
          description: form.descripcion,
          ubicacion: form.ubicacion
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar pasantía");
      setPasantias([...pasantias, form]);
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
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h3 className="text-2xl font-bold mb-4">Pasantías</h3>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(true)}>
        Agregar pasantía
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
          {success && <div className="text-green-600 text-sm mt-2">¡Pasantía guardada!</div>}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      )}
      <ul className="flex flex-col gap-4">
        {pasantias.map((pas, idx) => {
          function formatFecha(fecha: string) {
            if (!fecha) return "";
            const [year, month] = fecha.split("-");
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const mes = meses[parseInt(month, 10) - 1] || "";
            return mes + " " + year;
          }
          const inicio = formatFecha(pas.fechaInicio);
          const fin = formatFecha(pas.fechaFin);
          return (
            <li key={idx} className="bg-gray-50 rounded shadow p-4">
              <div className="font-bold text-lg">{pas.puesto} en {pas.empresa}</div>
              <div className="text-sm text-gray-600">{inicio} - {fin} {pas.ubicacion && `| ${pas.ubicacion}`}</div>
              <div className="mt-2">{pas.descripcion}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InternshipSection;
