'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getContainer } from '@/application/container';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const container = getContainer();
      const dbUser = await container.userRepository.getById(credential.user.uid);
      router.push(dbUser?.role === 'jury' ? '/jury' : '/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">YEA Voting</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-5 px-3 py-2.5 rounded-md bg-red-950/60 border border-red-900/50 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          No account?{' '}
          <a href="/register" className="text-slate-400 hover:text-white transition-colors">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
