'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), { id: uid, name, email, role: 'admin' });
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">YEA Voting</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Set up your administrator account</p>
        </div>

        {error && (
          <div className="mb-5 px-3 py-2.5 rounded-md bg-red-950/60 border border-red-900/50 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/login" className="text-slate-400 hover:text-white transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
