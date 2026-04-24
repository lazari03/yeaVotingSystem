'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/context/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getContainer } from '@/application/container';
import { Team } from '@/domain/entities/Team';
import { Criteria } from '@/domain/entities/Criteria';
import { submitVote } from '@/application/use-cases/submitVote';

export default function TeamEvaluationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.id as string;
  const eventId = searchParams.get('eventId');

  const [team, setTeam] = useState<Team | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') router.push('/admin');
  }, [user, router]);

  useEffect(() => {
    if (teamId && eventId && user) loadData();
  }, [teamId, eventId, user]);

  async function loadData() {
    if (!eventId || !teamId) return;
    setLoading(true);
    const container = getContainer();
    const [teamData, criteriaData] = await Promise.all([
      container.teamRepository.getById(teamId),
      container.criteriaRepository.getByEventId(eventId),
    ]);
    setTeam(teamData);
    setCriteria(criteriaData);
    const initial: Record<string, number> = {};
    criteriaData.forEach(c => { initial[c.id] = 0; });
    setScores(initial);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!eventId || !teamId || !user) return;
    const invalid = criteria.some(c => scores[c.id] === undefined || scores[c.id] < 0 || scores[c.id] > c.maxScore);
    if (invalid) {
      setError('Please provide valid scores for all criteria');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const container = getContainer();
      await submitVote(
        { eventId, teamId, juryId: user.id, scores, adminId: user.id },
        {
          voteRepository: container.voteRepository,
          criteriaRepository: container.criteriaRepository,
          logRepository: container.logRepository,
        }
      );
      router.push('/jury');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  }

  function handleScoreChange(criteriaId: string, value: string) {
    setScores(prev => ({ ...prev, [criteriaId]: parseInt(value) || 0 }));
  }

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const maxScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'jury') return null;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Header */}
      <header className="h-12 border-b border-slate-800 flex items-center px-5 gap-3">
        <button
          onClick={() => router.push('/jury')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-slate-700">/</span>
        <span className="text-sm text-white font-medium">{team?.name ?? 'Evaluate'}</span>
      </header>

      <div className="max-w-xl mx-auto px-5 py-8">

        {/* Title + running total */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">{team?.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Score each criterion</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white tabular-nums">{totalScore}</p>
            <p className="text-xs text-slate-600">of {maxScore} pts</p>
          </div>
        </div>

        {criteria.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">No criteria for this event.</p>
            <p className="text-xs text-slate-700 mt-1">Contact the admin to import criteria.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 px-3 py-2.5 rounded-md bg-red-950/60 border border-red-900/50 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Criteria */}
            <div className="space-y-7">
              {criteria.map(c => {
                const score = scores[c.id] ?? 0;
                const halfScore = Math.floor(c.maxScore / 2);
                return (
                  <div key={c.id}>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-sm font-medium text-white">{c.title}</span>
                      <span className="text-sm text-white tabular-nums font-mono">
                        {score}
                        <span className="text-slate-600"> / {c.maxScore}</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={c.maxScore}
                      step="1"
                      value={score}
                      onChange={(e) => handleScoreChange(c.id, e.target.value)}
                      className="w-full"
                    />

                    {/* Quick picks */}
                    <div className="flex gap-1.5 mt-2">
                      {[0, halfScore, c.maxScore].map(val => (
                        <button
                          key={val}
                          onClick={() => handleScoreChange(c.id, String(val))}
                          className={[
                            'px-2.5 py-1 rounded text-xs transition-colors',
                            score === val
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-600 hover:text-slate-400',
                          ].join(' ')}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800 my-8" />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/jury')}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Vote'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
