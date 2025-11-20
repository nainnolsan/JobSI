'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">JobSI</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How it Works</Link>
            <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Log In</Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">Get Started</Button>
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
          <div className="md:hidden bg-white/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
              <Link 
                href="#features" 
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Take your <span className="text-purple-600">resume</span> from good to great in just{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create the perfect ATS-friendly resume and cover letters with a smart AI builder and 200+ template variations
          </p>
          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-lg px-8 py-6">
                Create new resume
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-200 text-purple-600 hover:bg-purple-50">
                Improve my resume
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div>
              <div className="text-3xl font-bold text-gray-900">7,531</div>
              <div className="text-sm text-gray-500">created today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">×2 more</div>
              <div className="text-sm text-gray-500">interview invitations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">+70%</div>
              <div className="text-sm text-gray-500">more resume views</div>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="relative">
          <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold">JASMINE CARTER</h3>
                  <p className="text-sm text-gray-500">Senior Business Analyst</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-gray-100 rounded w-full"></div>
                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                <div className="h-2 bg-gray-100 rounded w-4/6"></div>
              </div>
              <div className="pt-4">
                <h4 className="font-semibold mb-2">EMPLOYMENT HISTORY</h4>
                <div className="space-y-2">
                  <div className="h-2 bg-purple-100 rounded w-full"></div>
                  <div className="h-2 bg-purple-100 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-semibold mb-2">SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">Data Analysis</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">Python</span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">SQL</span>
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
      <section id="features" className="py-20 bg-gradient-to-br from-purple-50 via-white to-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose JobSI?</h2>
            <p className="text-xl text-gray-600">Everything you need to land your dream job</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow hover:border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600">Smart AI analyzes job descriptions and creates tailored cover letters instantly</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow hover:border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ATS-Friendly Templates</h3>
              <p className="text-gray-600">Professional templates optimized to pass Applicant Tracking Systems</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow hover:border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">Create professional documents in minutes, not hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white/80 to-violet-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get hired in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Paste Job Description</h3>
              <p className="text-gray-600">Simply copy and paste the job posting you&apos;re applying for</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">AI Generates Content</h3>
              <p className="text-gray-600">Our AI analyzes and creates a personalized cover letter</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Download & Apply</h3>
              <p className="text-gray-600">Review, customize, and download your professional documents</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to land your dream job?</h2>
          <p className="text-xl text-purple-100 mb-8">Join thousands of job seekers who&apos;ve found success with JobSI</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">J</span>
                </div>
                <span className="font-bold text-white">JobSI</span>
              </div>
              <p className="text-sm">AI-powered resume and cover letter builder</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cover Letter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 JobSI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
