'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/presentation/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getContainer } from '@/application/container';
import { Event } from '@/domain/entities/Event';
import { Team } from '@/domain/entities/Team';
import { Vote } from '@/domain/entities/Vote';
import { PackVote } from '@/domain/entities/PackVote';
import { submitPackVote } from '@/application/use-cases/submitPackVote';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

interface TeamWithVote extends Team {
  hasVoted: boolean;
  activeVote: Vote | null;
}

function resolvePackName(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('startup')) return 'Startup Pack';
  return 'Innovation Pack';
}

export default function JuryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<TeamWithVote[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [myPackVote, setMyPackVote] = useState<PackVote | null>(null);
  const [selectedPackTeamId, setSelectedPackTeamId] = useState('');
  const [packSubmitting, setPackSubmitting] = useState(false);
  const [packError, setPackError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') router.push('/admin');
  }, [user, router]);

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (selectedEvent) loadTeamsWithVotes();
  }, [selectedEvent, user]);

  async function loadEvents() {
    const container = getContainer();
    const allEvents = await container.eventRepository.getAll();
    setEvents(allEvents);
    if (allEvents.length > 0) setSelectedEvent(allEvents[0]);
  }

  async function loadTeamsWithVotes() {
    if (!selectedEvent || !user) return;
    const container = getContainer();
    const [eventTeams, votes, existingPackVote] = await Promise.all([
      container.teamRepository.getByEventId(selectedEvent.id),
      container.voteRepository.getByEventId(selectedEvent.id),
      container.packVoteRepository.getByJuryAndEvent(user.id, selectedEvent.id),
    ]);

    setAllVotes(votes);
    setMyPackVote(existingPackVote);

    const filteredTeams = user.category
      ? eventTeams.filter(t => t.category === user.category)
      : eventTeams;

    setTeams(
      filteredTeams.map(team => {
        const myVotes = votes.filter(v => v.teamId === team.id && v.juryId === user.id);
        const activeVote = myVotes.find(v => v.isActive) ?? null;
        return { ...team, hasVoted: !!activeVote, activeVote };
      })
    );
  }

  async function handlePackVoteSubmit() {
    if (!selectedEvent || !user || !selectedPackTeamId) return;
    setPackSubmitting(true);
    setPackError('');
    try {
      const container = getContainer();
      const pv = await submitPackVote(
        { eventId: selectedEvent.id, juryId: user.id, teamId: selectedPackTeamId, juryCategory: user.category ?? '' },
        { packVoteRepository: container.packVoteRepository }
      );
      setMyPackVote(pv);
    } catch (err: unknown) {
      setPackError(err instanceof Error ? err.message : 'Failed to submit pack vote');
    } finally {
      setPackSubmitting(false);
    }
  }

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push('/login');
  };

  // Compute winner: highest avg score team in the jury's visible teams
  const winner = useMemo(() => {
    if (teams.length === 0) return null;
    const scored = teams.map(team => {
      const teamVotes = allVotes.filter(v => v.teamId === team.id && v.isActive);
      const avg = teamVotes.length > 0
        ? teamVotes.reduce((sum, v) => sum + v.totalScore, 0) / teamVotes.length
        : 0;
      return { team, avg, voteCount: teamVotes.length };
    }).filter(e => e.voteCount > 0);

    if (scored.length === 0) return null;
    return scored.reduce((best, e) => e.avg > best.avg ? e : best);
  }, [teams, allVotes]);

  const allEvaluated = teams.length > 0 && teams.every(t => t.hasVoted);
  const packName = user?.category ? resolvePackName(user.category) : 'Pack';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'jury') return null;

  const voted = teams.filter(t => t.hasVoted).length;
  const total = teams.length;
  const pct = total > 0 ? Math.round((voted / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Header */}
      <header className="h-12 border-b border-slate-800 flex items-center px-5 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">YEA Voting</span>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium">Jury</span>
          {user.category && (
            <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-medium">
              {user.category}
            </span>
          )}
        </div>

        {/* Event tabs */}
        {events.length > 0 && (
          <nav className="flex items-center gap-1 ml-4">
            {events.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEvent(e)}
                className={[
                  'px-3 py-1.5 rounded text-xs transition-colors font-medium',
                  selectedEvent?.id === e.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-300',
                ].join(' ')}
              >
                {e.name}
              </button>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-slate-600 hover:text-white transition-colors text-xs"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-10">

        {!selectedEvent && events.length === 0 && (
          <p className="text-sm text-slate-600">No events available. Contact the administrator.</p>
        )}

        {selectedEvent && (
          <>
            {/* Progress summary */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-white tabular-nums">
                  {voted}<span className="text-slate-600 font-normal">/{total}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">teams evaluated</p>
              </div>
              <div className="flex-1">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-700 mt-1">{pct}%</p>
              </div>
            </div>

            {/* Winner banner — shown once there is scoring data */}
            {winner && (
              <div className={`rounded-2xl border p-5 ${allEvaluated ? 'bg-yellow-500/8 border-yellow-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {allEvaluated ? (
                    <>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Winner</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Leader</span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xl font-bold ${allEvaluated ? 'text-yellow-300' : 'text-white'}`}>
                      {winner.team.name}
                    </p>
                    {winner.team.category && (
                      <p className="text-xs text-slate-500 mt-0.5">{winner.team.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold tabular-nums ${allEvaluated ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {winner.avg.toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-600">avg pts · {winner.voteCount} vote{winner.voteCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Teams list */}
            {teams.length === 0 ? (
              <p className="text-sm text-slate-600">No teams in this event yet.</p>
            ) : (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Evaluations</h2>
                <div className="divide-y divide-slate-800/60">
                  {teams.map(team => (
                    <div key={team.id} className="flex items-center justify-between py-3.5 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${team.hasVoted ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                        <span className="text-sm font-medium text-white truncate">{team.name}</span>
                        {team.hasVoted && team.activeVote && (
                          <span className="text-xs text-slate-600 font-mono flex-shrink-0">{team.activeVote.totalScore} pts</span>
                        )}
                      </div>
                      <button
                        onClick={() => router.push(`/jury/team/${team.id}?eventId=${selectedEvent.id}`)}
                        disabled={team.hasVoted}
                        className={[
                          'text-xs font-medium px-3 py-1.5 rounded transition-colors flex-shrink-0',
                          team.hasVoted
                            ? 'text-slate-700 cursor-not-allowed'
                            : 'bg-white text-slate-950 hover:bg-slate-100',
                        ].join(' ')}
                      >
                        {team.hasVoted ? 'Done' : 'Evaluate'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pack Vote section */}
            {teams.length > 0 && (
              <div className="border-t border-slate-800 pt-8">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                  <h2 className="text-sm font-semibold text-white">{packName}</h2>
                  <span className="text-xs bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-medium">Special Award</span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Pick one team for the {packName}. You can only vote once.
                </p>

                {myPackVote ? (
                  /* Already voted */
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/8 border border-purple-500/20">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {teams.find(t => t.id === myPackVote.teamId)?.name ?? 'Unknown team'}
                      </p>
                      <p className="text-xs text-purple-400 mt-0.5">{packName} awarded</p>
                    </div>
                  </div>
                ) : (
                  /* Voting form */
                  <div className="space-y-3">
                    {packError && (
                      <div className="px-3 py-2.5 rounded-md bg-red-950/60 border border-red-900/50 text-red-400 text-xs">
                        {packError}
                      </div>
                    )}

                    <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 overflow-hidden">
                      {teams.map(team => (
                        <label
                          key={team.id}
                          className={[
                            'flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors',
                            selectedPackTeamId === team.id
                              ? 'bg-purple-500/10'
                              : 'bg-slate-900/20 hover:bg-slate-800/40',
                          ].join(' ')}
                        >
                          <input
                            type="radio"
                            name="packVote"
                            value={team.id}
                            checked={selectedPackTeamId === team.id}
                            onChange={() => setSelectedPackTeamId(team.id)}
                            className="accent-purple-500 w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-sm text-white flex-1">{team.name}</span>
                          {team.hasVoted && team.activeVote && (
                            <span className="text-xs text-slate-600 font-mono">{team.activeVote.totalScore} pts</span>
                          )}
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handlePackVoteSubmit}
                      disabled={!selectedPackTeamId || packSubmitting}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {packSubmitting ? 'Submitting…' : `Award ${packName}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
