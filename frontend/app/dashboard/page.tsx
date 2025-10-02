"use client";
// ...existing imports...
import ExperienceSection from "../../components/ExperienceSection";
import InternshipSection from "../../components/InternshipSection";
import PortfolioSection from "../../components/PortfolioSection";
import { BsLinkedin } from "react-icons/bs";
console.log("DashboardPage montado");
import React, { useState, useEffect } from "react";
import { countryPhoneDataFull } from '@/lib/countryPhoneDataFull';
import { JWTPayload } from "@/lib/decodeJWT";
import { useRouter } from "next/navigation";
import { decodeJWT } from "@/lib/decodeJWT";
// ...existing code...

export default function DashboardPage() {
  // Estado para datos personales editables
  const [telefono, setTelefono] = useState(""); // solo el número, sin código país
  const [direccion, setDireccion] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos personales al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Si el teléfono tiene código de país, selecciona el país y separa el número
        if (data.telefono) {
          const match = countryPhoneDataFull.find(c => data.telefono.startsWith(c.dialCode));
          if (match) {
            setSelectedCountry(match);
            setTelefono(data.telefono.replace(match.dialCode, ""));
          } else {
            // Si no se detecta país, poner México por defecto
            const mexico = countryPhoneDataFull.find(c => c.code === "MX") || countryPhoneDataFull[0];
            setSelectedCountry(mexico);
            setTelefono(data.telefono);
          }
        } else {
          // Si no hay teléfono, país por defecto México y campo vacío
          const mexico = countryPhoneDataFull.find(c => c.code === "MX") || countryPhoneDataFull[0];
          setSelectedCountry(mexico);
          setTelefono("");
        }
        setDireccion(data.direccion || "");
        setLinkedin(data.linkedin || "");
      });
  }, []);

  // Guardar datos personales
  const handleSave = async (e: React.FormEvent) => {
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
    // Concatena el código de país con el número
    const telefonoCompleto = telefono ? `${selectedCountry.dialCode}${telefono}` : "";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ telefono: telefonoCompleto, direccion, linkedin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
  setSuccess(true);
  setTimeout(() => setSuccess(false), 2500); // Oculta el mensaje de éxito después de 2.5s
  setTimeout(() => setActiveTab("Experiencia"), 800); // Cambia a la pestaña de experiencia tras breve confirmación
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
      setTimeout(() => setError(null), 3500); // Oculta el mensaje de error después de 3.5s
    } finally {
      setLoading(false);
    }
  };
  // ...existing state and logic...
  const [username, setUsername] = useState<string | null>(null);
  const [nombres, setNombres] = useState<string | null>(null);
  const [jwtPayload, setJWTPayload] = useState<JWTPayload | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(countryPhoneDataFull[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  // Eliminado phone y setPhone porque no se usan
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Datos personales");
  const router = useRouter();

  useEffect(() => {
    // Fallback para esperar el token si no está disponible al primer render
    const checkToken = () => {
      const token = localStorage.getItem("token");
      console.log("Token JWT en localStorage:", token);
      if (!token) {
        setTimeout(checkToken, 100); // Espera 100ms y vuelve a intentar
        return;
      }
      try {
        const decoded = decodeJWT(token);
        console.log("Objeto decodificado del JWT:", decoded);
  setUsername(decoded && decoded.username ? decoded.username : "Usuario");
  setNombres(decoded && decoded.nombres ? decoded.nombres : null);
  setJWTPayload(decoded);
      } catch {
        setUsername("Usuario");
      }
    };
    checkToken();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header blanco, nombre y avatar a la izquierda, menú desplegable a la derecha */}
  <header className="w-full fixed top-0 left-0 z-20 bg-white/60 backdrop-blur-lg text-gray-900 py-4 px-8 shadow flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          {/* Avatar círculo */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
            {/* Iniciales del nombre */}
            {nombres ? nombres.split(' ').map(n => n[0]).join('') : (username ? username[0] : '?')}
          </div>
          {/* Nombre */}
          <span className="text-lg font-semibold">{nombres ? nombres : (username ? username : "Cargando...")}</span>
          {/* Flecha desplegable */}
          <div className="relative">
            <button
              className="flex items-center px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Menú desplegable */}
            {showMenu && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
  {/* Dashboard dividido en tres columnas */}
  <div className="flex w-full pt-[72px] flex-1">{/* 72px = header fijo + espacio extra */}
        {/* Menú lateral izquierdo - container flotante */}
        <aside className="w-56 flex items-start justify-start pl-8 pt-8">
          <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-lg flex flex-col p-6 gap-6 transition-all w-fit min-w-[180px]">
            <h2 className="text-xl font-bold mb-4">Progreso</h2>
            {/* Menú con tabs seleccionables */}
            <ul className="w-full flex flex-col gap-2">
              {[
                "Datos personales",
                "Experiencia",
                "Educación",
                "Habilidades",
                "Resumen"
              ].map(tab => (
                <li
                  key={tab}
                  className={`px-4 py-2 rounded cursor-pointer font-semibold transition-all ${activeTab === tab ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Área principal: cambia según la pestaña activa */}
        <main className="flex-1 p-12 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-8 ">{activeTab}</h2>
          {/* Formulario solo si estamos en 'Datos personales' */}
          {activeTab === "Datos personales" && (
            <form className="w-full max-w-lg bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-200 backdrop-blur" onSubmit={handleSave}>
              <div className="relative flex flex-col gap-2">
                <label className="block text-gray-700 font-semibold mb-2">Nombre completo</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-500 cursor-not-allowed pr-10"
                    value={nombres ?? " "}
                    disabled
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                <label className="block text-gray-700 font-semibold mb-2">Apellidos</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-500 cursor-not-allowed pr-10"
                    value={typeof jwtPayload?.apellidos === "string" ? jwtPayload.apellidos : " "}
                    disabled
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
                <div className="flex gap-2 items-center">
                  {/* Selector minimalista de país/código */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center bg-gray-100 rounded px-3 py-2 border border-gray-300 font-semibold text-gray-700 min-w-[90px] justify-center focus:outline-none gap-2"
                      onClick={() => setShowCountryDropdown((prev) => !prev)}
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="ml-1">{selectedCountry.dialCode}</span>
                      <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 max-h-64 overflow-auto">
                        {countryPhoneDataFull.map(country => (
                          <button
                            key={country.code}
                            type="button"
                            className={`flex items-center w-full px-4 py-2 gap-2 text-left hover:bg-blue-50 ${selectedCountry.code === country.code ? 'bg-blue-100 font-bold' : ''}`}
                            onClick={() => { setSelectedCountry(country); setShowCountryDropdown(false); }}
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span>{country.name}</span>
                            <span className="ml-auto text-gray-500">{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                    placeholder="Ejemplo: 145 1235"
                    maxLength={14}
                    value={telefono}
                    onChange={e => setTelefono(e.target.value.replace(/[^0-9 ]/g, ""))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Dirección</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-500 cursor-not-allowed pr-10"
                    value={typeof jwtPayload?.email === "string" ? jwtPayload.email : " "}
                    disabled
                    readOnly
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">LinkedIn</label>
                <div className="flex items-center gap-2">
                  <BsLinkedin style={{ fontSize: "2rem", color: "#5a6165ff" }} />
                  <input
                    type="url"
                    className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://linkedin.com/in/tuusuario"
                    // Validación eliminada para permitir cualquier URL
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-all" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
              {success && <div className="text-green-600 text-sm text-center mt-2">¡Datos personales guardados! Ahora puedes agregar tu experiencia.</div>}
              {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
            </form>
          )}
          {/* Mostrar componentes de experiencia, pasantía y portafolio si la pestaña es 'Experiencia' */}
          {activeTab === "Experiencia" && (
            <>
              <ExperienceSection />
              <InternshipSection />
              <PortfolioSection />
            </>
          )}
        </main>
        {/* Área derecha libre - container flotante */}
        <aside className="w-72 flex items-start justify-end pr-8 pt-8">
          <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-lg flex flex-col p-6 transition-all w-fit min-w-[180px]">
            {/* Aquí puedes agregar contenido futuro */}
          </div>
        </aside>
      </div>
      {/* Footer moderno */}
      <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-gray-200 py-6 flex items-center justify-center text-gray-600 font-semibold text-sm">
        © {new Date().getFullYear()} JobSI — Hecho con ♥ por nainnolsan
      </footer>
    </div>
  );
}
