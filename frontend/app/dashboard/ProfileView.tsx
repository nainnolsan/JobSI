// Vista del perfil del usuario (dashboard anterior)
"use client";
import React, { useState, useEffect } from "react";
import { countryPhoneDataFull } from '@/lib/countryPhoneDataFull';
import { JWTPayload } from "@/lib/decodeJWT";
import { BsLinkedin, BsInstagram, BsFacebook, BsTwitterX, BsGithub, BsYoutube, BsTiktok, BsGlobe, BsPlusCircle, BsXCircle, BsPencil, BsTrash } from "react-icons/bs";
import ExperienceSection from "../../components/ExperienceSection";
import InternshipSection from "../../components/InternshipSection";
import PortfolioSection from "../../components/PortfolioSection";

interface ProfileViewProps {
  jwtPayload: JWTPayload | null;
}

export default function ProfileView({ jwtPayload }: ProfileViewProps) {
  // Estado para información de contacto
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(countryPhoneDataFull[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Estado para redes sociales
  const [socialLinks, setSocialLinks] = useState<{[key: string]: string}>({});
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("LinkedIn");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  
  // Estado para edición de redes sociales
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  
  // Estado de carga para debug
  const [dataLoaded, setDataLoaded] = useState(false);

  // Mapeo de plataformas con íconos y colores
  const socialPlatforms = {
    LinkedIn: { icon: BsLinkedin, color: "#0077B5", dbValue: "LinkedIn" },
    Instagram: { icon: BsInstagram, color: "#E4405F", dbValue: "Instagram" },
    Facebook: { icon: BsFacebook, color: "#1877F2", dbValue: "Facebook" },
    "X (Twitter)": { icon: BsTwitterX, color: "#000000", dbValue: "X (Twitter)" },
    GitHub: { icon: BsGithub, color: "#333333", dbValue: "GitHub" },
    TikTok: { icon: BsTiktok, color: "#000000", dbValue: "TikTok" },
    YouTube: { icon: BsYoutube, color: "#FF0000", dbValue: "YouTube" },
    Otra: { icon: BsGlobe, color: "#6B7280", dbValue: "Otra" }
  };
  
  const [activeTab, setActiveTab] = useState<string>("Información de contacto");

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPlatformDropdown) {
        const target = event.target as Element;
        if (!target.closest('.platform-dropdown')) {
          setShowPlatformDropdown(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPlatformDropdown]);

  // Cargar datos de contacto al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Procesar teléfono
        if (data.telefono) {
          const match = countryPhoneDataFull.find(c => data.telefono.startsWith(c.dialCode));
          if (match) {
            setSelectedCountry(match);
            setTelefono(data.telefono.replace(match.dialCode, ""));
          } else {
            const mexico = countryPhoneDataFull.find(c => c.code === "MX") || countryPhoneDataFull[0];
            setSelectedCountry(mexico);
            setTelefono(data.telefono);
          }
        } else {
          const mexico = countryPhoneDataFull.find(c => c.code === "MX") || countryPhoneDataFull[0];
          setSelectedCountry(mexico);
          setTelefono("");
        }
        
        // Procesar dirección
        setDireccion(data.direccion || "");
        
        // Cargar todas las redes sociales desde la nueva estructura
        if (data.socialLinks) {
          setSocialLinks(data.socialLinks);
        } else if (data.linkedin) {
          // Fallback para compatibilidad
          setSocialLinks({ LinkedIn: data.linkedin });
        }
        
        setDataLoaded(true);
      })
      .catch(error => {
        console.error("Error al cargar datos del usuario:", error);
        setDataLoaded(true);
      });
  }, []);

  // Guardar información de contacto
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
    const telefonoCompleto = telefono ? `${selectedCountry.dialCode}${telefono}` : "";
    try {
      // Guardar toda la información de contacto en una sola llamada
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          telefono: telefonoCompleto, 
          direccion,
          socialLinks 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar información de contacto");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
      setTimeout(() => setError(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1">
      {/* Menú lateral izquierdo */}
      <aside className="w-56 flex items-start justify-start pl-8 pt-8">
        <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-lg flex flex-col p-6 gap-6 transition-all w-fit min-w-[180px]">
          <h2 className="text-xl font-bold mb-4">Progreso</h2>
          <ul className="w-full flex flex-col gap-2">
            {[
              "Información de contacto",
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

      {/* Área principal */}
      <main className="flex-1 p-12 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-8">{activeTab}</h2>
        
        {/* Información de contacto */}
        {activeTab === "Información de contacto" && (
          <form className="w-full max-w-lg bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-200 backdrop-blur" onSubmit={handleSave}>
            {/* Los datos se cargan automáticamente al montar el componente */}
            <div className="relative flex flex-col gap-2">
              <label className="block text-gray-700 font-semibold mb-2">Nombre completo</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-500 cursor-not-allowed pr-10"
                  value={jwtPayload?.nombres ?? " "}
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
            
            {/* Redes Sociales */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Redes Sociales</label>
              
              {/* Redes sociales existentes */}
              <div className="space-y-2 mb-4">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  const platformInfo = socialPlatforms[platform as keyof typeof socialPlatforms];
                  const IconComponent = platformInfo?.icon || BsGlobe;
                  
                  // Si está en modo edición para esta plataforma
                  if (editingPlatform === platform) {
                    return (
                      <div key={platform} className="flex items-center gap-3 py-2">
                        {/* Ícono gris de la plataforma */}
                        <div className="flex items-center justify-center w-6 h-6">
                          <IconComponent style={{ fontSize: "1.2rem", color: "#6B7280" }} />
                        </div>
                        
                        {/* Input para editar URL */}
                        <input
                          type="url"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="URL del perfil"
                          autoFocus
                        />
                        
                        {/* Botón guardar */}
                        <button
                          type="button"
                          onClick={() => {
                            if (editingUrl.trim()) {
                              setSocialLinks(prev => ({ ...prev, [platform]: editingUrl.trim() }));
                            }
                            setEditingPlatform(null);
                            setEditingUrl("");
                          }}
                          className="text-gray-400 hover:text-green-500 transition-colors"
                          title="Guardar"
                        >
                          <BsPlusCircle size={16} />
                        </button>
                        
                        {/* Botón cancelar */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlatform(null);
                            setEditingUrl("");
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Cancelar"
                        >
                          <BsXCircle size={16} />
                        </button>
                      </div>
                    );
                  }
                  
                  // Modo vista normal
                  return (
                    <div key={platform} className="flex items-center gap-3 py-2">
                      {/* Ícono gris de la plataforma */}
                      <div className="flex items-center justify-center w-6 h-6">
                        <IconComponent style={{ fontSize: "1.2rem", color: "#6B7280" }} />
                      </div>
                      
                      {/* Nombre de la plataforma */}
                      <span className="flex-1 text-sm text-gray-700 font-medium">{platform}</span>
                      
                      {/* Botón editar */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlatform(platform);
                          setEditingUrl(url);
                        }}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Editar URL"
                      >
                        <BsPencil size={14} />
                      </button>
                      
                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = { ...socialLinks };
                          delete newLinks[platform];
                          setSocialLinks(newLinks);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <BsTrash size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Agregar nueva red social */}
              {!showAddSocial ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSocial(true);
                    setNewSocialPlatform("LinkedIn");
                    setNewSocialUrl("");
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
                >
                  + Agregar red social
                </button>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Selector de plataforma con ícono */}
                    <div className="relative platform-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px]"
                      >
                        {(() => {
                          const platformInfo = socialPlatforms[newSocialPlatform as keyof typeof socialPlatforms];
                          const IconComponent = platformInfo?.icon || BsLinkedin;
                          return (
                            <>
                              <IconComponent style={{ fontSize: "1.2rem", color: "#6B7280" }} />
                              <span className="text-sm text-gray-700">{newSocialPlatform}</span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 20 20">
                                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </>
                          );
                        })()}
                      </button>
                      
                      {/* Dropdown de plataformas */}
                      {showPlatformDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
                          {Object.entries(socialPlatforms).map(([platform, info]) => (
                            <button
                              key={platform}
                              type="button"
                              className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 ${newSocialPlatform === platform ? 'bg-blue-50 font-medium' : ''}`}
                              onClick={() => {
                                setNewSocialPlatform(platform);
                                setShowPlatformDropdown(false);
                              }}
                            >
                              <info.icon style={{ fontSize: "1.2rem", color: "#6B7280" }} />
                              <span className="text-sm text-gray-700">{platform}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Input de URL */}
                    <input
                      type="url"
                      placeholder="URL del perfil"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    
                    {/* Botones de acción */}
                    <button
                      type="button"
                      onClick={() => {
                        if (newSocialPlatform && newSocialUrl.trim()) {
                          const dbValue = socialPlatforms[newSocialPlatform as keyof typeof socialPlatforms]?.dbValue || newSocialPlatform;
                          setSocialLinks(prev => ({ ...prev, [dbValue]: newSocialUrl.trim() }));
                          setNewSocialPlatform("LinkedIn");
                          setNewSocialUrl("");
                          setShowAddSocial(false);
                          setShowPlatformDropdown(false);
                        }
                      }}
                      className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded transition-all"
                      disabled={!newSocialPlatform || !newSocialUrl.trim()}
                      title="Agregar"
                    >
                      <BsPlusCircle size={18} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddSocial(false);
                        setNewSocialPlatform("LinkedIn");
                        setNewSocialUrl("");
                        setShowPlatformDropdown(false);
                      }}
                      className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Cancelar"
                    >
                      <BsXCircle size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-all" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            {success && <div className="text-green-600 text-sm text-center mt-2">¡Información de contacto guardada exitosamente!</div>}
            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
          </form>
        )}
        
        {/* Experiencia */}
        {activeTab === "Experiencia" && (
          <>
            <ExperienceSection />
            <InternshipSection />
            <PortfolioSection />
          </>
        )}
        
        {/* Educación */}
        {activeTab === "Educación" && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Educación Formal */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Educación Formal</h3>
              <div className="text-gray-500 text-center py-8">
                Formulario para agregar estudios universitarios, certificaciones, etc.
                <br />
                <span className="text-sm">Conectado a la tabla `education`</span>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Certificaciones</h3>
              <div className="text-gray-500 text-center py-8">
                Formulario para agregar certificaciones profesionales
                <br />
                <span className="text-sm">Conectado a la tabla `certifications`</span>
              </div>
            </div>

            {/* Enlaces del Portafolio */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Enlaces del Portafolio</h3>
              <div className="text-gray-500 text-center py-8">
                Sección para agregar enlaces de proyectos, LinkedIn, GitHub, etc.
                <br />
                <span className="text-sm">Conectado a la tabla `user_links`</span>
              </div>
            </div>
          </div>
        )}

        {/* Habilidades */}
        {activeTab === "Habilidades" && (
          <div className="w-full max-w-4xl">
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Habilidades Técnicas y Profesionales</h3>
              <div className="text-gray-500 text-center py-8">
                Formulario para agregar habilidades con niveles de competencia
                <br />
                <span className="text-sm">Conectado a la tabla `skills`</span>
              </div>
            </div>
          </div>
        )}

        {/* Resumen */}
        {activeTab === "Resumen" && (
          <div className="w-full max-w-4xl">
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen del Perfil</h3>
              <div className="text-gray-500 text-center py-8">
                Vista general de toda la información del perfil
                <br />
                <span className="text-sm">Próximamente disponible</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Área derecha */}
      <aside className="w-72 flex items-start justify-end pr-8 pt-8">
        <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-200 backdrop-blur-lg flex flex-col p-6 transition-all w-fit min-w-[180px]">
          {/* Contenido futuro */}
        </div>
      </aside>
    </div>
  );
}