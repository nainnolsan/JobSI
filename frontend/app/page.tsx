// Home/Landing Page (server component)
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-4">JobSI • AI Job Toolkit</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Crea cover letters épicas en minutos
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Pega la descripción del trabajo, conectamos tu perfil y generamos una cover letter personalizada, clara y profesional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Comenzar gratis</Link>
              <Link href="/login" className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Iniciar sesión</Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-green-500"/>Rápido</div>
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-purple-500"/>Personalizado</div>
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-amber-500"/>Exportable a PDF</div>
            </div>
          </div>
          <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="h-64 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
              Demo UI
            </div>
            <p className="mt-3 text-sm text-gray-500">Previsualiza, edita y descarga tu carta con nuestro editor.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">1. Pega la vacante</h3>
            <p className="mt-2 text-gray-600 text-sm">Analizamos responsabilidades y requisitos con IA para entender qué buscan.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">2. Conectamos tu perfil</h3>
            <p className="mt-2 text-gray-600 text-sm">Tomamos tu educación, experiencia y skills desde tu perfil.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">3. Genera y edita</h3>
            <p className="mt-2 text-gray-600 text-sm">Obtén una cover letter lista, edítala y descárgala en PDF.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-2xl bg-blue-600 text-white p-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold">Empieza ahora — es gratis</h3>
            <p className="text-blue-100 mt-1">Crea tu primera cover letter en menos de 3 minutos.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/register" className="px-5 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}