'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getContainer } from '@/application/container';
import { Event } from '@/domain/entities/Event';
import { Team } from '@/domain/entities/Team';
import { Vote } from '@/domain/entities/Vote';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

interface TeamWithVote extends Team {
  hasVoted: boolean;
  activeVote: Vote | null;
}

export default function JuryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<TeamWithVote[]>([]);

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
    const [eventTeams, allVotes] = await Promise.all([
      container.teamRepository.getByEventId(selectedEvent.id),
      container.voteRepository.getByEventId(selectedEvent.id),
    ]);
    setTeams(
      eventTeams.map(team => {
        const myVotes = allVotes.filter(v => v.teamId === team.id && v.juryId === user.id);
        const activeVote = myVotes.find(v => v.isActive) ?? null;
        return { ...team, hasVoted: !!activeVote, activeVote };
      })
    );
  }

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push('/login');
  };

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

      <div className="max-w-3xl mx-auto px-5 py-8">

        {!selectedEvent && events.length === 0 && (
          <p className="text-sm text-slate-600">No events available. Contact the administrator.</p>
        )}

        {selectedEvent && (
          <>
            {/* Progress summary */}
            <div className="mb-8 flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-white tabular-nums">{voted}<span className="text-slate-600 font-normal">/{total}</span></p>
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

            {/* Teams */}
            {teams.length === 0 ? (
              <p className="text-sm text-slate-600">No teams in this event yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between py-3.5 gap-4"
                  >
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
