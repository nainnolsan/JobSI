import React, { useState, useEffect } from "react";

export interface Portfolio {
  title: string;
  link: string;
  description: string;
}

const PortfolioSection: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [form, setForm] = useState<Portfolio>({
    title: "",
    link: "",
    description: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar portafolios al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPortfolios(data);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/portfolios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar portafolio");
      setPortfolios([...portfolios, form]);
      setForm({ title: "", link: "", description: "" });
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
      <h3 className="text-2xl font-bold mb-4">Portafolio</h3>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowForm(true)}>
        Agregar portafolio
      </button>
      {showForm && (
        <form className="bg-white rounded shadow p-6 flex flex-col gap-4" onSubmit={handleAdd}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título"
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="link"
            type="url"
            value={form.link}
            onChange={handleChange}
            placeholder="URL de tu portafolio (ejemplo: https://miportafolio.com)"
            className="border rounded px-3 py-2"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className="border rounded px-3 py-2"
            rows={2}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
          {success && <div className="text-green-600 text-sm mt-2">¡Portafolio guardado!</div>}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      )}
      <ul className="flex flex-col gap-4">
        {portfolios.map((port, idx) => (
          <li key={idx} className="bg-gray-50 rounded shadow p-4">
            <div className="font-bold text-lg">{port.title}</div>
            <div className="text-sm text-blue-600"><a href={port.link} target="_blank" rel="noopener noreferrer">{port.link}</a></div>
            <div className="mt-2">{port.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioSection;
