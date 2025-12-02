'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslations } from '@/shared/hooks/useTranslations';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-transparent dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Cover ME</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.nav.features}</Link>
            <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.nav.howItWorks}</Link>
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.nav.login}</Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">{t.nav.getStarted}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
              <Link 
                href="#features" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.features}
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.howItWorks}
              </Link>
              <Link 
                href="/login" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                  {t.nav.getStarted}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 dark:text-white">
            {t.hero.title.create} <span className="text-purple-600 dark:text-purple-400">{t.hero.title.perfect}</span> {t.hero.title.in}{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">{t.hero.title.minutes}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t.hero.subtitle}
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-lg px-8 py-6">
                {t.hero.createButton}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                {t.hero.viewButton}
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">2,847</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t.hero.stats.letters}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{t.hero.stats.faster}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t.hero.stats.fasterDesc}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{t.hero.stats.satisfaction}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t.hero.stats.satisfactionDesc}</div>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">JASMINE CARTER</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Senior Business Analyst</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
              <div className="pt-4">
                <h4 className="font-semibold mb-2 dark:text-white">EMPLOYMENT HISTORY</h4>
                <div className="space-y-2">
                  <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded w-full"></div>
                  <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-semibold mb-2 dark:text-white">SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">Data Analysis</span>
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">Python</span>
                  <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">SQL</span>
                </div>
              </div>
            </div>
          </div>
          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full px-6 py-3 shadow-lg transform rotate-12">
            <div className="text-sm font-semibold">AI-Powered</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t.features.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow hover:border-purple-100 dark:hover:border-purple-800 bg-white dark:bg-gray-800/50">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.features.aiPowered.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.features.aiPowered.description}</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow hover:border-purple-100 dark:hover:border-purple-800 bg-white dark:bg-gray-800/50">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.features.templates.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.features.templates.description}</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow hover:border-orange-100 dark:hover:border-orange-800 bg-white dark:bg-gray-800/50">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.features.saveTime.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.features.saveTime.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white/80 dark:bg-gray-900/80 to-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">{t.howItWorks.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.howItWorks.step1.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.howItWorks.step1.description}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.howItWorks.step2.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.howItWorks.step2.description}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{t.howItWorks.step3.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.howItWorks.step3.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t.cta.title}</h2>
          <p className="text-xl text-purple-100 mb-8">{t.cta.subtitle}</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
              {t.cta.button}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-12 border-t border-transparent dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  <span>C</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">CoverME</span>
              </div>
              <p className="text-sm">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.generator}</Link></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.templates}</Link></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.myLetters}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">{t.footer.company}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.about}</Link></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.contact}</Link></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.blog}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.privacy}</Link></li>
                <li><Link href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t.footer.links.terms}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 pt-8 text-center text-sm">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
