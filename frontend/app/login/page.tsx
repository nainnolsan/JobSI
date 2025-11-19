'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Backend espera 'username'; el input local se llama 'email' pero contiene el username.
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Credenciales inválidas');
        } else {
          setError('Error del servidor, intenta de nuevo');
        }
        return;
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError('Error del servidor, intenta de nuevo');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error del servidor, intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-1 text-center">Iniciar Sesión</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Accede a tu cuenta JobSI</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            name="username"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
