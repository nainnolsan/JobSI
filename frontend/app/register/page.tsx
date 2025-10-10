"use client";
import React, { useState } from "react";
// import { BsLinkedin, BsTwitter, BsFacebook } from "react-icons/bs"; // No utilizados por ahora
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    password: "",
    linkedin: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrar usuario");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1200);
      }
  } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="username" placeholder="Nombre de usuario" value={form.username} onChange={handleChange} required />
          <Input name="nombres" placeholder="Nombres" value={form.nombres} onChange={handleChange} required />
          <Input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
          <Input name="fecha_nacimiento" type="date" placeholder="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />
          <Input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">¡Registro exitoso! Ahora puedes <Link href="/">iniciar sesión</Link>.</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          ¿Ya tienes cuenta? <Link href="/" className="text-blue-600 hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
