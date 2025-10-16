// Vista del perfil del usuario (dashboard anterior)
"use client";
import React, { useState, useEffect } from "react";
import { countryPhoneDataFull } from '@/lib/countryPhoneDataFull';
import { JWTPayload } from "@/lib/decodeJWT";
import { BsLinkedin, BsInstagram, BsFacebook, BsTwitterX, BsGithub, BsYoutube, BsTiktok, BsGlobe, BsPlusCircle, BsXCircle, BsPencil, BsTrash } from "react-icons/bs";

interface ProfileViewProps {
  jwtPayload: JWTPayload | null;
}

// Types used in this view
interface WorkExperience {
  id: number;
  user_id?: number;
  category: 'trabajo' | 'pasantia';
  time_type: 'part_time' | 'full_time';
  empresa: string;
  puesto: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  descripcion?: string | null;
  ubicacion?: string | null;
  created_at?: string;
}

interface EditForm {
  category: WorkExperience['category'];
  time_type: WorkExperience['time_type'];
  empresa: string;
  puesto: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  ubicacion: string;
  is_current: boolean;
}

interface Education {
  id: number;
  user_id?: number;
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  grade?: string | null;
  description?: string | null;
  created_at?: string;
}

interface Certification {
  id: number;
  user_id?: number;
  name: string;
  issuing_organization?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  description?: string | null;
  created_at?: string;
}

interface UserLink {
  id: number;
  user_id?: number;
  type: string;
  title?: string | null;
  url: string;
  is_public?: boolean;
  display_order?: number;
  created_at?: string;
}

interface Skill {
  id: number;
  user_id?: number;
  name: string;
  category?: string | null;
  level?: string | null;
  years_experience?: number | null;
  description?: string | null;
  created_at?: string;
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
  
  // Estados para experiencia laboral
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [experienceLoading, setExperienceLoading] = useState(false);
  const [experienceError, setExperienceError] = useState<string | null>(null);
  const [experienceSuccess, setExperienceSuccess] = useState(false);
  
  // Estado del formulario de experiencia
  const [experienceForm, setExperienceForm] = useState({
    category: 'trabajo',
    time_type: 'full_time',
    empresa: '',
    puesto: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    ubicacion: '',
    is_current: false
  });
  
  // Estado de carga para debug (removed unused state)

  // Educación / Certificaciones / Enlaces (frontend states)
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [educationFormState, setEducationFormState] = useState({
    institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false, grade: '', description: ''
  });
  const [educationLoading, setEducationLoading] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);

  const [certificationsList, setCertificationsList] = useState<Certification[]>([]);
  const [certFormState, setCertFormState] = useState({
    name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '', description: ''
  });
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [showCertForm, setShowCertForm] = useState(false);

  const [userLinksList, setUserLinksList] = useState<UserLink[]>([]);
  const [linkFormState, setLinkFormState] = useState({ type: 'portfolio', title: '', url: '', is_public: true, display_order: 0 });
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  // Estado para habilidades
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: '',
    level: '',
    years_experience: '',
    description: ''
  });
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);

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
        
  // data loaded
      })
      .catch(error => {
        console.error("Error al cargar datos del usuario:", error);
  // data loaded
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

  // ====== FUNCIONES PARA EXPERIENCIA LABORAL ======
  
  // Cargar experiencias del usuario
  const loadWorkExperiences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-experiences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const experiences = await res.json();
        setWorkExperiences(experiences);
      }
    } catch (err) {
      console.error("Error loading work experiences:", err);
    }
  };

  // Agregar nueva experiencia
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setExperienceLoading(true);
    setExperienceError(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setExperienceError("No hay token de autenticación");
      setExperienceLoading(false);
      return;
    }

    try {
      const formData = { ...experienceForm };
      
      // Si es trabajo actual, no enviar fecha_fin
      if (formData.is_current) {
        formData.fecha_fin = '';
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear experiencia");

      // Recargar experiencias y resetear formulario
      await loadWorkExperiences();
      setExperienceForm({
        category: 'trabajo',
        time_type: 'full_time',
        empresa: '',
        puesto: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        ubicacion: '',
        is_current: false
      });
      setShowAddExperience(false);
      setExperienceSuccess(true);
      setTimeout(() => setExperienceSuccess(false), 2500);
      
    } catch (err: unknown) {
      if (err instanceof Error) setExperienceError(err.message);
      else setExperienceError("Error desconocido");
      setTimeout(() => setExperienceError(null), 3500);
    } finally {
      setExperienceLoading(false);
    }
  };

  // Eliminar experiencia
  const handleDeleteExperience = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-experiences/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        await loadWorkExperiences();
      }
    } catch (err) {
      console.error("Error deleting experience:", err);
    }
  };

  // Editar experiencia: iniciar edición
  const startEditExperience = (exp: WorkExperience) => {
    setEditingExpId(exp.id);
    setEditForm({
      category: exp.category,
      time_type: exp.time_type,
      empresa: exp.empresa,
      puesto: exp.puesto,
      fecha_inicio: exp.fecha_inicio ? exp.fecha_inicio.substring(0,10) : '',
      fecha_fin: exp.fecha_fin ? exp.fecha_fin.substring(0,10) : '',
      descripcion: exp.descripcion || '',
      ubicacion: exp.ubicacion || '',
      is_current: !exp.fecha_fin
    });
  };

  const cancelEdit = () => {
    setEditingExpId(null);
    setEditForm(null);
  };

  const saveEditExperience = async (id: number) => {
    if (!editForm) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setEditError('No autenticado');
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const payload = { ...editForm };
      if (payload.is_current) payload.fecha_fin = '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-experiences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error updating experience');
      await loadWorkExperiences();
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 2500);
      cancelEdit();
    } catch (err: unknown) {
      console.error('Error saving experience', err);
      if (err instanceof Error) setEditError(err.message);
      else setEditError('Error desconocido');
      setTimeout(() => setEditError(null), 3500);
    } finally {
      setEditLoading(false);
    }
  };

  // Cargar experiencias al montar el componente
  useEffect(() => {
    if (jwtPayload) {
      loadWorkExperiences();
      loadEducation();
      loadCertifications();
      loadUserLinks();
      loadSkills();
    }
  }, [jwtPayload]);

  // Load education
  const loadEducation = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEducationList(data);
      }
    } catch (err) {
      console.error('Error loading education', err);
    }
  };

  const createEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEducationLoading(true);
    setEducationError(null);
    const token = localStorage.getItem('token');
    if (!token) { setEducationError('No autenticado'); setEducationLoading(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(educationFormState)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creando educación');
      await loadEducation();
      setEducationFormState({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', is_current: false, grade: '', description: '' });
    } catch (err: unknown) {
      if (err instanceof Error) setEducationError(err.message); else setEducationError('Error desconocido');
    } finally { setEducationLoading(false); }
  };

  const deleteEducation = async (id: number) => {
    const token = localStorage.getItem('token'); if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) await loadEducation();
    } catch (err) { console.error('Error deleting education', err); }
  };

  // Certifications
  const loadCertifications = async () => {
    const token = localStorage.getItem('token'); if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCertificationsList(await res.json());
    } catch (err) { console.error('Error loading certs', err); }
  };

  const createCertification = async (e: React.FormEvent) => {
    e.preventDefault(); setCertLoading(true); setCertError(null);
    const token = localStorage.getItem('token'); if (!token) { setCertError('No autenticado'); setCertLoading(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certifications`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(certFormState) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Error creando certificación');
      await loadCertifications();
      setCertFormState({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '', description: '' });
    } catch (err: unknown) { if (err instanceof Error) setCertError(err.message); else setCertError('Error desconocido'); } finally { setCertLoading(false); }
  };

  const deleteCertification = async (id: number) => { const token = localStorage.getItem('token'); if (!token) return; try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/certifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) await loadCertifications(); } catch (err) { console.error('Error deleting cert', err); } };

  // User links (portfolio)
  const loadUserLinks = async () => { const token = localStorage.getItem('token'); if (!token) return; try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-links`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) setUserLinksList(await res.json()); } catch (err) { console.error('Error loading user links', err); } };

  const createUserLink = async (e: React.FormEvent) => { e.preventDefault(); setLinkLoading(true); setLinkError(null); const token = localStorage.getItem('token'); if (!token) { setLinkError('No autenticado'); setLinkLoading(false); return; } try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-links`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(linkFormState) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Error creando enlace'); await loadUserLinks(); setLinkFormState({ type: 'portfolio', title: '', url: '', is_public: true, display_order: 0 }); } catch (err: unknown) { if (err instanceof Error) setLinkError(err.message); else setLinkError('Error desconocido'); } finally { setLinkLoading(false); } };

  const deleteUserLink = async (id: number) => { const token = localStorage.getItem('token'); if (!token) return; try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-links/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) await loadUserLinks(); } catch (err) { console.error('Error deleting link', err); } };

  // Helper para mostrar fechas en formato 'Sep 2025'
  const formatDate = (isoDate: string | null | undefined) => {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch {
      return isoDate;
    }
  };

  // Helper para mostrar fechas en formato bonito
  const formatPrettyDate = (isoDate: string | null | undefined) => {
    if (!isoDate) return '';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
    } catch {
      return isoDate;
    }
  };

  // Cargar habilidades
  const loadSkills = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSkillsError('No autenticado. Inicia sesión para ver tus habilidades.');
      return;
    }
    setSkillsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSkills(await res.json());
        setSkillsError(null);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setSkillsError('No autenticado o token inválido. Inicia sesión nuevamente.');
        } else {
          setSkillsError(data.error ? `Error: ${data.error}` : 'Error al cargar habilidades');
        }
      }
    } catch (err) {
      console.error('Error loading skills', err);
      setSkillsError('Error de red al cargar habilidades');
    } finally {
      setSkillsLoading(false);
    }
  };

  // Agregar habilidad
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    setSkillsLoading(true);
    setSkillsError(null);
    try {
      const payload = {
        ...skillForm,
        years_experience: skillForm.years_experience ? Number(skillForm.years_experience) : null
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al agregar habilidad');
      await loadSkills();
      setSkillForm({ name: '', category: '', level: '', years_experience: '', description: '' });
      setShowSkillForm(false);
    } catch (err) {
      console.error('Error adding skill', err);
      setSkillsError('Error al agregar habilidad');
    } finally {
      setSkillsLoading(false);
    }
  };

  // Eliminar habilidad
  const handleDeleteSkill = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSkillsLoading(true);
    setSkillsError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar habilidad');
      await loadSkills();
    } catch (err) {
      console.error('Error deleting skill', err);
      setSkillsError('Error al eliminar habilidad');
    } finally {
      setSkillsLoading(false);
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
          <div className="w-full max-w-3xl space-y-6">
            {/* Clasificar experiencias */}
            {(() => {
              // Categorizar experiencias
              const internshipsAll = workExperiences.filter(e => e.category === 'pasantia');

              // Trabajo actual: todos los items sin fecha_fin (incluye pasantías actuales)
              const currentJobs = workExperiences.filter(e => !e.fecha_fin);

              // Trabajos pasados: sólo category 'trabajo' con fecha_fin
              const pastJobs = workExperiences.filter(e => e.category === 'trabajo' && !!e.fecha_fin);

              return (
                <>
                  {/* Trabajo Actual */}
                  {currentJobs.length > 0 && (
                    <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur max-w-2xl mx-auto">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Trabajo Actual</h3>
                      <div className="space-y-4">
                        {currentJobs.map((exp) => (
                          <div key={exp.id} className="border-l-4 border-green-500 pl-3 py-1.5">
                            {editingExpId === exp.id ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input className="px-2 py-1 border rounded" value={editForm?.empresa} onChange={(e) => setEditForm((p)=>({...(p as EditForm), empresa: e.target.value}))} />
                                  <input className="px-2 py-1 border rounded" value={editForm?.puesto} onChange={(e) => setEditForm((p)=>({...(p as EditForm), puesto: e.target.value}))} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_inicio} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_inicio:e.target.value}))} />
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_fin} disabled={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_fin:e.target.value}))} />
                                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), is_current: e.target.checked, fecha_fin: e.target.checked ? '' : (p as EditForm).fecha_fin}))} /> Actual</label>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => saveEditExperience(exp.id)} disabled={editLoading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60">{editLoading ? 'Guardando...' : 'Guardar'}</button>
                                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                                </div>
                                {editSuccess && <div className="text-green-600 text-sm mt-2">Guardado</div>}
                                {editError && <div className="text-red-500 text-sm mt-2">{editError}</div>}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-gray-800">{exp.puesto}</h4>
                                  <p className="text-gray-600 font-medium">{exp.empresa}</p>
                                  <p className="text-sm text-gray-500">{exp.ubicacion}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(exp.fecha_inicio)} - Actualidad
                                    {exp.time_type === 'part_time' && ' (Medio tiempo)'}
                                  </p>
                                  {exp.descripcion && (
                                    <p className="mt-2 text-gray-700 text-sm">{exp.descripcion}</p>
                                  )}
                                </div>
                                <div className="flex items-start gap-2">
                                  <button onClick={() => startEditExperience(exp)} className="text-gray-500 hover:text-blue-600" title="Editar"><BsPencil size={14} /></button>
                                  <button onClick={() => handleDeleteExperience(exp.id)} className="text-gray-400 hover:text-red-500 ml-3" title="Eliminar"><BsTrash size={14} /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trabajos Pasados */}
                  {pastJobs.length > 0 && (
                    <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur max-w-2xl mx-auto">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Trabajos Pasados</h3>
                      <div className="space-y-4">
                        {pastJobs.map((exp) => (
                          <div key={exp.id} className="border-l-4 border-blue-500 pl-3 py-1.5">
                            {editingExpId === exp.id ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input className="px-2 py-1 border rounded" value={editForm?.empresa} onChange={(e) => setEditForm((p)=>({...(p as EditForm), empresa: e.target.value}))} />
                                  <input className="px-2 py-1 border rounded" value={editForm?.puesto} onChange={(e) => setEditForm((p)=>({...(p as EditForm), puesto: e.target.value}))} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_inicio} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_inicio:e.target.value}))} />
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_fin} disabled={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_fin:e.target.value}))} />
                                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), is_current: e.target.checked, fecha_fin: e.target.checked ? '' : (p as EditForm).fecha_fin}))} /> Actual</label>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => saveEditExperience(exp.id)} disabled={editLoading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60">{editLoading ? 'Guardando...' : 'Guardar'}</button>
                                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                                </div>
                                {editSuccess && <div className="text-green-600 text-sm mt-2">Guardado</div>}
                                {editError && <div className="text-red-500 text-sm mt-2">{editError}</div>}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-gray-800">{exp.puesto}</h4>
                                  <p className="text-gray-600 font-medium">{exp.empresa}</p>
                                  <p className="text-sm text-gray-500">{exp.ubicacion}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(exp.fecha_inicio)} - {formatDate(exp.fecha_fin)}
                                    {exp.time_type === 'part_time' && ' (Medio tiempo)'}
                                  </p>
                                  {exp.descripcion && (
                                    <p className="mt-2 text-gray-700 text-sm">{exp.descripcion}</p>
                                  )}
                                </div>
                                <div className="flex items-start gap-2">
                                  <button onClick={() => startEditExperience(exp)} className="text-gray-500 hover:text-blue-600" title="Editar"><BsPencil size={14} /></button>
                                  <button onClick={() => handleDeleteExperience(exp.id)} className="text-gray-400 hover:text-red-500 ml-3" title="Eliminar"><BsTrash size={14} /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pasantías */}
                  {internshipsAll.length > 0 && (
                    <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur max-w-2xl mx-auto">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Pasantías</h3>
                      <div className="space-y-4">
                        {internshipsAll.map((exp) => (
                          <div key={exp.id} className="border-l-4 border-purple-500 pl-3 py-1.5">
                            {editingExpId === exp.id ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input className="px-2 py-1 border rounded" value={editForm?.empresa} onChange={(e) => setEditForm((p)=>({...(p as EditForm), empresa: e.target.value}))} />
                                  <input className="px-2 py-1 border rounded" value={editForm?.puesto} onChange={(e) => setEditForm((p)=>({...(p as EditForm), puesto: e.target.value}))} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_inicio} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_inicio:e.target.value}))} />
                                  <input type="date" className="px-2 py-1 border rounded" value={editForm?.fecha_fin} disabled={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), fecha_fin:e.target.value}))} />
                                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm?.is_current} onChange={(e)=>setEditForm((p)=>({...(p as EditForm), is_current: e.target.checked, fecha_fin: e.target.checked ? '' : (p as EditForm).fecha_fin}))} /> Actual</label>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => saveEditExperience(exp.id)} disabled={editLoading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60">{editLoading ? 'Guardando...' : 'Guardar'}</button>
                                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
                                </div>
                                {editSuccess && <div className="text-green-600 text-sm mt-2">Guardado</div>}
                                {editError && <div className="text-red-500 text-sm mt-2">{editError}</div>}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-gray-800">{exp.puesto}</h4>
                                  <p className="text-gray-600 font-medium">{exp.empresa}</p>
                                  <p className="text-sm text-gray-500">{exp.ubicacion}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(exp.fecha_inicio)} - 
                                    {exp.fecha_fin ? formatDate(exp.fecha_fin) : ' Actualidad'}
                                    {exp.time_type === 'part_time' && ' (Medio tiempo)'}
                                  </p>
                                  {exp.descripcion && (
                                    <p className="mt-2 text-gray-700 text-sm">{exp.descripcion}</p>
                                  )}
                                </div>
                                <div className="flex items-start gap-2">
                                  <button onClick={() => startEditExperience(exp)} className="text-gray-500 hover:text-blue-600" title="Editar"><BsPencil size={14} /></button>
                                  <button onClick={() => handleDeleteExperience(exp.id)} className="text-gray-400 hover:text-red-500 ml-3" title="Eliminar"><BsTrash size={14} /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulario para agregar experiencia */}
                  {(workExperiences.length === 0 || showAddExperience) && (
                    <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {workExperiences.length === 0 ? 'Agregar tu primera experiencia' : 'Agregar nueva experiencia'}
                      </h3>
                      
                      <form onSubmit={handleAddExperience} className="space-y-4">
                        {/* Tipo de experiencia */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Tipo</label>
                            <select
                              value={experienceForm.category}
                              onChange={(e) => setExperienceForm(prev => ({...prev, category: e.target.value}))}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="trabajo">Trabajo</option>
                              <option value="pasantia">Pasantía</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Modalidad</label>
                            <select
                              value={experienceForm.time_type}
                              onChange={(e) => setExperienceForm(prev => ({...prev, time_type: e.target.value}))}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="full_time">Tiempo completo</option>
                              <option value="part_time">Medio tiempo</option>
                            </select>
                          </div>
                        </div>

                        {/* Empresa y puesto */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Empresa</label>
                            <input
                              type="text"
                              required
                              value={experienceForm.empresa}
                              onChange={(e) => setExperienceForm(prev => ({...prev, empresa: e.target.value}))}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nombre de la empresa"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Puesto</label>
                            <input
                              type="text"
                              required
                              value={experienceForm.puesto}
                              onChange={(e) => setExperienceForm(prev => ({...prev, puesto: e.target.value}))}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Tu puesto de trabajo"
                            />
                          </div>
                        </div>

                        {/* Ubicación */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Ubicación</label>
                          <input
                            type="text"
                            value={experienceForm.ubicacion}
                            onChange={(e) => setExperienceForm(prev => ({...prev, ubicacion: e.target.value}))}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ciudad, País"
                          />
                        </div>

                        {/* Fechas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Fecha de inicio</label>
                            <input
                              type="date"
                              required
                              value={experienceForm.fecha_inicio}
                              onChange={(e) => setExperienceForm(prev => ({...prev, fecha_inicio: e.target.value}))}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">Fecha de fin</label>
                            <div className="space-y-2">
                              <input
                                type="date"
                                disabled={experienceForm.is_current}
                                value={experienceForm.is_current ? '' : experienceForm.fecha_fin}
                                onChange={(e) => setExperienceForm(prev => ({...prev, fecha_fin: e.target.value}))}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={experienceForm.is_current}
                                  onChange={(e) => setExperienceForm(prev => ({
                                    ...prev, 
                                    is_current: e.target.checked,
                                    fecha_fin: e.target.checked ? '' : prev.fecha_fin
                                  }))}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">Trabajo actual</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
                          <textarea
                            value={experienceForm.descripcion}
                            onChange={(e) => setExperienceForm(prev => ({...prev, descripcion: e.target.value}))}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Describe tus responsabilidades y logros..."
                          />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                          <button
                            type="submit"
                            disabled={experienceLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                          >
                            {experienceLoading ? "Guardando..." : "Guardar Experiencia"}
                          </button>
                          
                          {workExperiences.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddExperience(false);
                                setExperienceForm({
                                  category: 'trabajo',
                                  time_type: 'full_time',
                                  empresa: '',
                                  puesto: '',
                                  fecha_inicio: '',
                                  fecha_fin: '',
                                  descripcion: '',
                                  ubicacion: '',
                                  is_current: false
                                });
                              }}
                              className="px-6 py-2 bg-gray-500 text-white rounded font-bold hover:bg-gray-600 transition-all"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>

                        {experienceSuccess && <div className="text-green-600 text-sm">¡Experiencia guardada exitosamente!</div>}
                        {experienceError && <div className="text-red-500 text-sm">{experienceError}</div>}
                      </form>
                    </div>
                  )}

                  {/* Botón para agregar más experiencias */}
                  {workExperiences.length > 0 && !showAddExperience && (
                    <div className="text-center">
                      <button
                        onClick={() => setShowAddExperience(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all inline-flex items-center gap-2"
                      >
                        <BsPlusCircle size={18} />
                        Agregar más experiencia
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        
        {/* Educación */}
        {activeTab === "Educación" && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Educación Formal - Lista y formulario */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Educación Formal</h3>
              <div className="space-y-4">
                {educationList.length === 0 ? (
                  <div className="text-gray-500">No hay registros de educación todavía.</div>
                ) : (
                  educationList.map(ed => (
                    <div key={ed.id} className="flex justify-between items-start p-2 border-b">
                      <div>
                        <div className="font-semibold">{ed.degree} — {ed.institution}</div>
                        <div className="text-sm text-gray-600">{ed.field_of_study || ''} • {formatDate(ed.start_date)} - {ed.is_current ? 'Actualidad' : formatDate(ed.end_date)}</div>
                        {ed.description && <div className="text-sm text-gray-700 mt-1">{ed.description}</div>}
                      </div>
                      <div>
                        <button onClick={() => deleteEducation(ed.id)} className="text-red-500">Eliminar</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-2 border-t pt-4">
                  {!showEducationForm ? (
                    <div className="text-center">
                      <button type="button" onClick={() => setShowEducationForm(true)} className="px-4 py-2 bg-green-600 text-white rounded">+ Agregar educación</button>
                    </div>
                  ) : (
                    <form onSubmit={createEducation} className="pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Institución" value={educationFormState.institution} onChange={e=>setEducationFormState(prev=>({...prev,institution:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input required placeholder="Título / Grado" value={educationFormState.degree} onChange={e=>setEducationFormState(prev=>({...prev,degree:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="Área de estudio" value={educationFormState.field_of_study} onChange={e=>setEducationFormState(prev=>({...prev,field_of_study:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input type="date" value={educationFormState.start_date} onChange={e=>setEducationFormState(prev=>({...prev,start_date:e.target.value}))} className="px-3 py-2 border rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input type="date" disabled={educationFormState.is_current} value={educationFormState.end_date} onChange={e=>setEducationFormState(prev=>({...prev,end_date:e.target.value}))} className="px-3 py-2 border rounded" />
                    <label className="flex items-center gap-2"><input type="checkbox" checked={educationFormState.is_current} onChange={e=>setEducationFormState(prev=>({...prev,is_current:e.target.checked, end_date: e.target.checked ? '' : prev.end_date}))} /> Actualmente estudio aquí</label>
                  </div>
                  <textarea placeholder="Descripción (opcional)" value={educationFormState.description} onChange={e=>setEducationFormState(prev=>({...prev,description:e.target.value}))} className="w-full px-3 py-2 border rounded mt-3" />
                  <div className="flex gap-2 mt-3">
                    <button type="submit" disabled={educationLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{educationLoading ? 'Guardando...' : 'Agregar educación'}</button>
                    {educationError && <div className="text-red-500">{educationError}</div>}
                  </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Certificaciones</h3>
              <div className="space-y-4">
                {certificationsList.length === 0 ? (
                  <div className="text-gray-500">No hay certificaciones agregadas.</div>
                ) : (
                  certificationsList.map(c => (
                    <div key={c.id} className="flex justify-between items-start p-2 border-b">
                      <div>
                        <div className="font-semibold">{c.name} — {c.issuing_organization}</div>
                        <div className="text-sm text-gray-600">Emitido: {formatDate(c.issue_date)} {c.expiration_date ? ' • Expira: ' + formatDate(c.expiration_date) : ''}</div>
                        {c.description && <div className="text-sm text-gray-700 mt-1">{c.description}</div>}
                      </div>
                      <div>
                        <button onClick={() => deleteCertification(c.id)} className="text-red-500">Eliminar</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-2 border-t pt-4">
                  {!showCertForm ? (
                    <div className="text-center">
                      <button type="button" onClick={() => setShowCertForm(true)} className="px-4 py-2 bg-green-600 text-white rounded">+ Agregar certificación</button>
                    </div>
                  ) : (
                    <form onSubmit={createCertification} className="pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Nombre de la certificación" value={certFormState.name} onChange={e=>setCertFormState(prev=>({...prev,name:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="Organización emisora" value={certFormState.issuing_organization} onChange={e=>setCertFormState(prev=>({...prev,issuing_organization:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input type="date" value={certFormState.issue_date} onChange={e=>setCertFormState(prev=>({...prev,issue_date:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input type="date" value={certFormState.expiration_date} onChange={e=>setCertFormState(prev=>({...prev,expiration_date:e.target.value}))} className="px-3 py-2 border rounded" />
                  </div>
                  <input placeholder="ID del certificado (opcional)" value={certFormState.credential_id} onChange={e=>setCertFormState(prev=>({...prev,credential_id:e.target.value}))} className="px-3 py-2 border rounded mt-3" />
                  <input placeholder="URL de verificación (opcional)" value={certFormState.credential_url} onChange={e=>setCertFormState(prev=>({...prev,credential_url:e.target.value}))} className="px-3 py-2 border rounded mt-3" />
                  <textarea placeholder="Descripción (opcional)" value={certFormState.description} onChange={e=>setCertFormState(prev=>({...prev,description:e.target.value}))} className="w-full px-3 py-2 border rounded mt-3" />
                  <div className="flex gap-2 mt-3">
                    <button type="submit" disabled={certLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{certLoading ? 'Guardando...' : 'Agregar certificación'}</button>
                    {certError && <div className="text-red-500">{certError}</div>}
                  </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Enlaces de portafolio (user_links) */}
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Enlaces del Portafolio</h3>
              <div className="space-y-4">
                {userLinksList.length === 0 ? (
                  <div className="text-gray-500">No hay enlaces.</div>
                ) : (
                  userLinksList.map(l => (
                    <div key={l.id} className="flex justify-between items-start p-2 border-b">
                      <div>
                        <div className="font-semibold">{l.title || l.type}</div>
                        <div className="text-sm text-gray-600"><a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600">{l.url}</a></div>
                      </div>
                      <div>
                        <button onClick={() => deleteUserLink(l.id)} className="text-red-500">Eliminar</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-2 border-t pt-4">
                  {!showLinkForm ? (
                    <div className="text-center">
                      <button type="button" onClick={() => setShowLinkForm(true)} className="px-4 py-2 bg-green-600 text-white rounded">+ Agregar enlace</button>
                    </div>
                  ) : (
                    <form onSubmit={createUserLink} className="pt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="Tipo (github, portfolio...)" value={linkFormState.type} onChange={e=>setLinkFormState(prev=>({...prev,type:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="Título (opcional)" value={linkFormState.title} onChange={e=>setLinkFormState(prev=>({...prev,title:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="URL" required value={linkFormState.url} onChange={e=>setLinkFormState(prev=>({...prev,url:e.target.value}))} className="px-3 py-2 border rounded" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="submit" disabled={linkLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{linkLoading ? 'Guardando...' : 'Agregar enlace'}</button>
                    {linkError && <div className="text-red-500">{linkError}</div>}
                  </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habilidades */}
        {activeTab === "Habilidades" && (
          <div className="w-full max-w-4xl">
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Habilidades Técnicas y Profesionales</h3>
              {skillsError && (
                <div className="text-red-500 text-center mb-4">{skillsError}</div>
              )}
              {skillsLoading ? (
                <div className="text-gray-500">Cargando habilidades...</div>
              ) : skills.length === 0 ? (
                <div className="text-gray-500">No hay habilidades registradas.</div>
              ) : (
                <ul className="mb-6">
                  {skills.map(skill => (
                    <li key={skill.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <span className="font-semibold">{skill.name}</span>
                        {skill.category && <span className="ml-2 text-gray-500">[{skill.category}]</span>}
                        {skill.level && <span className="ml-2 text-blue-600">Nivel: {skill.level}</span>}
                        {skill.years_experience !== null && skill.years_experience !== undefined && (
                          <span className="ml-2 text-green-600">{skill.years_experience} años</span>
                        )}
                        {skill.description && <span className="ml-2 text-gray-400">{skill.description}</span>}
                      </div>
                      <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-500 ml-4">Eliminar</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-4">
                {!showSkillForm ? (
                  <button type="button" onClick={() => setShowSkillForm(true)} className="px-4 py-2 bg-green-600 text-white rounded">+ Agregar habilidad</button>
                ) : (
                  <form onSubmit={handleAddSkill} className="grid grid-cols-2 gap-4">
                    <input required placeholder="Nombre" value={skillForm.name} onChange={e=>setSkillForm(f=>({...f,name:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="Categoría" value={skillForm.category} onChange={e=>setSkillForm(f=>({...f,category:e.target.value}))} className="px-3 py-2 border rounded" />
                    <select required value={skillForm.level} onChange={e=>setSkillForm(f=>({...f,level:e.target.value}))} className="px-3 py-2 border rounded">
                      <option value="">Selecciona nivel</option>
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                      <option value="expert">Experto</option>
                    </select>
                    <input type="number" min="0" placeholder="Años de experiencia" value={skillForm.years_experience} onChange={e=>setSkillForm(f=>({...f,years_experience:e.target.value}))} className="px-3 py-2 border rounded" />
                    <input placeholder="Descripción" value={skillForm.description} onChange={e=>setSkillForm(f=>({...f,description:e.target.value}))} className="px-3 py-2 border rounded col-span-2" />
                    <div className="col-span-2 flex gap-2 mt-2">
                      <button type="submit" disabled={skillsLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{skillsLoading ? 'Guardando...' : 'Agregar habilidad'}</button>
                      <button type="button" onClick={()=>setShowSkillForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded">Cancelar</button>
                      {skillsError && <div className="text-red-500 ml-2">{skillsError}</div>}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen */}
        {activeTab === "Resumen" && (

          <div className="w-full max-w-4xl">
            <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-gray-200 backdrop-blur">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen del Perfil</h3>
              <div className="space-y-6">
                {/* Contacto */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Información de contacto</h4>
                  <div className="text-gray-700">Teléfono: {telefono || "-"}</div>
                  <div className="text-gray-700">Dirección: {direccion || "-"}</div>
                </div>
                {/* Experiencia */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Experiencia laboral</h4>
                  {workExperiences.length === 0 ? (
                    <div className="text-gray-500">Sin experiencia registrada.</div>
                  ) : (
                    <ul className="list-disc ml-6">
                      {workExperiences.map(exp => (
                        <li key={exp.id}>
                          <span className="font-semibold">{exp.puesto}</span> en {exp.empresa} ({exp.category})
                          {exp.fecha_inicio && ` | ${formatPrettyDate(exp.fecha_inicio)}`}
                          {exp.fecha_fin && ` - ${formatPrettyDate(exp.fecha_fin)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Educación */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Educación</h4>
                  {educationList.length === 0 ? (
                    <div className="text-gray-500">Sin educación registrada.</div>
                  ) : (
                    <ul className="list-disc ml-6">
                      {educationList.map(ed => (
                        <li key={ed.id}>
                          <span className="font-semibold">{ed.degree}</span> en {ed.institution}
                          {ed.start_date && ` | ${formatPrettyDate(ed.start_date)}`}
                          {ed.end_date && ` - ${formatPrettyDate(ed.end_date)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Certificaciones */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Certificaciones</h4>
                  {certificationsList.length === 0 ? (
                    <div className="text-gray-500">Sin certificaciones.</div>
                  ) : (
                    <ul className="list-disc ml-6">
                      {certificationsList.map(cert => (
                        <li key={cert.id}>
                          <span className="font-semibold">{cert.name}</span> ({cert.issuing_organization})
                          {cert.issue_date && ` | ${formatPrettyDate(cert.issue_date)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Enlaces */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Enlaces de portafolio</h4>
                  {userLinksList.length === 0 ? (
                    <div className="text-gray-500">Sin enlaces.</div>
                  ) : (
                    <ul className="list-disc ml-6">
                      {userLinksList.map(link => (
                        <li key={link.id}>
                          <span className="font-semibold">{link.title || link.type}</span>: <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600">{link.url}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Habilidades */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Habilidades</h4>
                  {skills.length === 0 ? (
                    <div className="text-gray-500">Sin habilidades registradas.</div>
                  ) : (
                    <ul className="list-disc ml-6">
                      {skills.map(skill => (
                        <li key={skill.id}>
                          <span className="font-semibold">{skill.name}</span>
                          {skill.category && ` [${skill.category}]`}
                          {skill.level && ` | Nivel: ${skill.level}`}
                          {skill.years_experience !== null && skill.years_experience !== undefined && ` | ${skill.years_experience} años`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Botón aceptar */}
                <div className="pt-6 text-center">
                  <button type="button" className="px-6 py-3 bg-blue-700 text-white rounded font-bold text-lg shadow hover:bg-blue-800 transition">Aceptar y continuar</button>
                </div>
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