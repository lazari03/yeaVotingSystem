'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/presentation/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getContainer } from '@/application/container';
import { Event } from '@/domain/entities/Event';
import { Team } from '@/domain/entities/Team';
import { Criteria } from '@/domain/entities/Criteria';
import { Vote } from '@/domain/entities/Vote';
import { Log } from '@/domain/entities/Log';
import { User } from '@/domain/entities/User';
import { LeaderboardEntry, getLeaderboard } from '@/application/use-cases/getLeaderboard';
import { createEvent } from '@/application/use-cases/createEvent';
import { createJuryUser } from '@/application/use-cases/createJuryUser';
import { createTeam } from '@/application/use-cases/createTeam';
import { importCriteriaFromJSON, CriteriaJSON } from '@/application/use-cases/importCriteriaFromJSON';
import { importTeamsFromJSON, TeamJSON } from '@/application/use-cases/importTeamsFromJSON';
import { revertVote } from '@/application/use-cases/revertVote';
import { PackVote } from '@/domain/entities/PackVote';
import { createAuthUser } from '@/application/auth-helpers';
import { signOut } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

type TabType = 'teams' | 'votes' | 'leaderboard' | 'logs' | 'jury' | 'criteria' | 'stats';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [juryMembers, setJuryMembers] = useState<User[]>([]);
  const [packVotes, setPackVotes] = useState<PackVote[]>([]);
  
  const [newEventName, setNewEventName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState('');
  const [juryName, setJuryName] = useState('');
  const [juryEmail, setJuryEmail] = useState('');
  const [juryPassword, setJuryPassword] = useState('');
  const [criteriaJson, setCriteriaJson] = useState('');
  const [teamsJson, setTeamsJson] = useState('');
  const [selectedJury, setSelectedJury] = useState<User | null>(null);
  const [juryCategoryInput, setJuryCategoryInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'jury') {
      router.push('/jury');
    }
  }, [user, router]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const container = getContainer();
    const [allEvents, allJury] = await Promise.all([
      container.eventRepository.getAll(),
      container.userRepository.getJuryMembers(),
    ]);
    setEvents(allEvents);
    setJuryMembers(allJury);
    if (allEvents.length > 0 && !selectedEvent) {
      setSelectedEvent(allEvents[0]);
    }
  }

  useEffect(() => {
    if (selectedEvent) {
      loadEventData(selectedEvent.id);
    }
  }, [selectedEvent]);

  async function loadEventData(eventId: string) {
    const container = getContainer();
    const [eventTeams, eventCriteria, eventVotes, allLogs, eventPackVotes] = await Promise.all([
      container.teamRepository.getByEventId(eventId),
      container.criteriaRepository.getByEventId(eventId),
      container.voteRepository.getByEventId(eventId),
      container.logRepository.getAll(),
      container.packVoteRepository.getByEventId(eventId),
    ]);
    setTeams(eventTeams);
    setCriteria(eventCriteria);
    setVotes(eventVotes);
    setLogs(allLogs);
    setPackVotes(eventPackVotes);

    const lb = await getLeaderboard(
      { eventId },
      { ...container, userRepository: container.userRepository, teamRepository: container.teamRepository, voteRepository: container.voteRepository }
    );
    setLeaderboard(lb);
  }

  async function handleCreateEvent() {
    if (!newEventName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const container = getContainer();
      const event = await createEvent(
        { name: newEventName },
        { eventRepository: container.eventRepository }
      );
      setEvents([...events, event]);
      setSelectedEvent(event);
      setNewEventName('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam() {
    if (!selectedEvent || !newTeamName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const container = getContainer();
      const team = await createTeam(
        { eventId: selectedEvent.id, name: newTeamName, category: newTeamCategory.trim() },
        { teamRepository: container.teamRepository }
      );
      setTeams([...teams, team]);
      setNewTeamName('');
      setNewTeamCategory('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleImportTeams() {
    if (!selectedEvent || !teamsJson.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parsed: TeamJSON[] = JSON.parse(teamsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid teams format');
      }
      const container = getContainer();
      const imported = await importTeamsFromJSON(
        { eventId: selectedEvent.id, teams: parsed },
        { teamRepository: container.teamRepository }
      );
      setTeams([...teams, ...imported]);
      setTeamsJson('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON format';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateJuryCategory() {
    if (!selectedJury) return;
    setLoading(true);
    setError('');
    try {
      const container = getContainer();
      const updated = await container.userRepository.update({ ...selectedJury, category: juryCategoryInput.trim() });
      setJuryMembers(juryMembers.map(j => j.id === updated.id ? updated : j));
      setSelectedJury(updated);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update jury category';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJury() {
    if (!juryName.trim() || !juryEmail.trim() || !juryPassword.trim()) return;
    setLoading(true);
    setError('');
    try {
      const container = getContainer();
      await createJuryUser(
        { name: juryName, email: juryEmail, password: juryPassword },
        { userRepository: container.userRepository, authCreateUser: createAuthUser }
      );
      const allJury = await container.userRepository.getJuryMembers();
      setJuryMembers(allJury);
      setJuryName('');
      setJuryEmail('');
      setJuryPassword('');
      alert('Jury member created successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create jury member';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleImportCriteria() {
    if (!selectedEvent || !criteriaJson.trim()) return;
    setLoading(true);
    setError('');
    try {
      const parsed: CriteriaJSON[] = JSON.parse(criteriaJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid criteria format');
      }
      const container = getContainer();
      const imported = await importCriteriaFromJSON(
        { eventId: selectedEvent.id, criteria: parsed },
        { criteriaRepository: container.criteriaRepository }
      );
      setCriteria(imported);
      setCriteriaJson('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON format';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevertVote(voteId: string) {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const container = getContainer();
      await revertVote(
        { voteId, adminId: user.id },
        { voteRepository: container.voteRepository, logRepository: container.logRepository }
      );
      await loadEventData(selectedEvent!.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revert vote';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    router.push('/login');
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalVotes = votes.length;
    const activeVotes = votes.filter(v => v.isActive).length;
    const totalScore = votes.filter(v => v.isActive).reduce((sum, v) => sum + v.totalScore, 0);
    const avgScore = activeVotes > 0 ? totalScore / activeVotes : 0;
    
    const votesByTeam = teams.map(team => {
      const teamVotes = votes.filter(v => v.teamId === team.id && v.isActive);
      const score = teamVotes.reduce((sum, v) => sum + v.totalScore, 0);
      return { name: team.name, votes: teamVotes.length, score };
    });

    const votesByJury = juryMembers.map(jury => {
      const juryVotes = votes.filter(v => v.juryId === jury.id && v.isActive);
      return { name: jury.name, votes: juryVotes.length };
    });

    const criteriaChartData = criteria.map(c => {
      const scores = votes.filter(v => v.isActive).map(v => v.scores[c.id] || 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { name: c.title.slice(0, 15) + '...', fullName: c.title, average: avg, maxScore: c.maxScore };
    });

    return { totalVotes, activeVotes, avgScore, votesByTeam, votesByJury, criteriaChartData };
  }, [votes, teams, juryMembers, criteria]);

  const teamCategories = useMemo(() => {
    const cats = teams.map(t => t.category).filter((c): c is string => !!c);
    return Array.from(new Set(cats)).sort();
  }, [teams]);

  // Pack winners: for each pack name, find the team with the most votes
  const packWinners = useMemo(() => {
    const packNames = Array.from(new Set(packVotes.map(pv => pv.packName)));
    return packNames.map(packName => {
      const pvForPack = packVotes.filter(pv => pv.packName === packName);
      const counts: Record<string, number> = {};
      pvForPack.forEach(pv => { counts[pv.teamId] = (counts[pv.teamId] ?? 0) + 1; });
      const topTeamId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topTeam = teams.find(t => t.id === topTeamId);
      const topCount = topTeamId ? counts[topTeamId] : 0;
      const juryWhoVoted = pvForPack.map(pv => juryMembers.find(j => j.id === pv.juryId)?.name ?? pv.juryId);
      return { packName, team: topTeam ?? null, votes: topCount, total: pvForPack.length, juryWhoVoted };
    });
  }, [packVotes, teams, juryMembers]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'stats', label: 'Stats' },
    { id: 'teams', label: 'Teams' },
    { id: 'votes', label: 'Votes' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'jury', label: 'Jury' },
    { id: 'criteria', label: 'Criteria' },
    { id: 'logs', label: 'Logs' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-medium">{user.name.charAt(0)}</span>
                </div>
                <span className="text-slate-300 text-sm hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Events */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Events</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="New event name"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={handleCreateEvent}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Create Event
                  </button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Jury */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Create Jury</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={juryName}
                    onChange={(e) => setJuryName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={juryEmail}
                    onChange={(e) => setJuryEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={juryPassword}
                    onChange={(e) => setJuryPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={handleCreateJury}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Create Jury
                  </button>
                </div>
              </div>

              {/* Import Teams */}
              {selectedEvent && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-lg font-semibold text-white mb-1">Import Teams</h2>
                  <p className="text-xs text-slate-500 mb-3">JSON array of teams</p>
                  <textarea
                    placeholder='[{"name": "Team Alpha", "category": "Software"}]'
                    value={teamsJson}
                    onChange={(e) => setTeamsJson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none font-mono"
                  />
                  <button
                    onClick={handleImportTeams}
                    disabled={loading}
                    className="w-full mt-3 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Import Teams
                  </button>
                </div>
              )}

              {/* Import Criteria */}
              {selectedEvent && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-lg font-semibold text-white mb-1">Import Criteria</h2>
                  <p className="text-xs text-slate-500 mb-3">JSON array of criteria</p>
                  <textarea
                    placeholder='[{"title": "Innovation", "maxScore": 10}]'
                    value={criteriaJson}
                    onChange={(e) => setCriteriaJson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none font-mono"
                  />
                  <button
                    onClick={handleImportCriteria}
                    disabled={loading}
                    className="w-full mt-3 py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Import Criteria
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedEvent ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="border-b border-slate-700/50 overflow-x-auto">
                  <nav className="flex min-w-max">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Stats Tab */}
                  {activeTab === 'stats' && (
                    <div className="space-y-6">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-slate-400 text-sm">Total Votes</p>
                          <p className="text-2xl font-bold text-white mt-1">{stats.totalVotes}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-slate-400 text-sm">Active Votes</p>
                          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.activeVotes}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-slate-400 text-sm">Teams</p>
                          <p className="text-2xl font-bold text-blue-400 mt-1">{teams.length}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-slate-400 text-sm">Avg Score</p>
                          <p className="text-2xl font-bold text-purple-400 mt-1">{stats.avgScore.toFixed(1)}</p>
                        </div>
                      </div>

                      {/* Team Scores Table */}
                      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-white font-medium mb-4">Team Scores</h3>
                        <div className="space-y-2">
                          {stats.votesByTeam.map((team, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                              <span className="text-white">{team.name}</span>
                              <span className="text-blue-400 font-medium">{team.score} pts ({team.votes} votes)</span>
                            </div>
                          ))}
                          {stats.votesByTeam.length === 0 && <p className="text-slate-500">No votes yet</p>}
                        </div>
                      </div>

                      {/* Jury Activity */}
                      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-white font-medium mb-4">Jury Activity</h3>
                        <div className="space-y-2">
                          {stats.votesByJury.map((jury, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                              <span className="text-white">{jury.name}</span>
                              <span className="text-emerald-400 font-medium">{jury.votes} votes</span>
                            </div>
                          ))}
                          {stats.votesByJury.length === 0 && <p className="text-slate-500">No jury activity yet</p>}
                        </div>
                      </div>

                      {/* Pack Winners */}
                      {packWinners.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-white font-medium">Pack Awards</h3>
                          {packWinners.map(pw => (
                            <div
                              key={pw.packName}
                              className={`rounded-xl border p-4 ${pw.packName.toLowerCase().includes('startup') ? 'bg-blue-500/8 border-blue-500/25' : 'bg-purple-500/8 border-purple-500/25'}`}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <svg className={`w-4 h-4 flex-shrink-0 ${pw.packName.toLowerCase().includes('startup') ? 'text-blue-400' : 'text-purple-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${pw.packName.toLowerCase().includes('startup') ? 'text-blue-400' : 'text-purple-400'}`}>
                                  {pw.packName}
                                </span>
                                <span className="text-xs text-slate-600 ml-auto">{pw.total} vote{pw.total !== 1 ? 's' : ''} cast</span>
                              </div>

                              {pw.team ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-lg font-bold text-white">{pw.team.name}</p>
                                    {pw.team.category && (
                                      <p className="text-xs text-slate-500 mt-0.5">{pw.team.category}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xl font-bold tabular-nums ${pw.packName.toLowerCase().includes('startup') ? 'text-blue-400' : 'text-purple-400'}`}>
                                      {pw.votes}
                                    </p>
                                    <p className="text-xs text-slate-600">pack vote{pw.votes !== 1 ? 's' : ''}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-500 text-sm">No votes yet</p>
                              )}

                              {/* Who voted */}
                              {pw.juryWhoVoted.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-700/40">
                                  <p className="text-xs text-slate-500 mb-1.5">Voted by</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pw.juryWhoVoted.map((name, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-md">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teams Tab */}
                  {activeTab === 'teams' && (
                    <div>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <input
                          type="text"
                          placeholder="Team name"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="flex-1 min-w-32 px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Category (optional)"
                          value={newTeamCategory}
                          onChange={(e) => setNewTeamCategory(e.target.value)}
                          className="flex-1 min-w-32 px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={handleCreateTeam}
                          disabled={loading}
                          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          Add Team
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => (
                          <div key={team.id} className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50 flex items-center justify-between">
                            <h3 className="font-medium text-white">{team.name}</h3>
                            {team.category && (
                              <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 text-xs rounded-lg font-medium">
                                {team.category}
                              </span>
                            )}
                          </div>
                        ))}
                        {teams.length === 0 && (
                          <p className="text-slate-500 col-span-2 text-center py-8">No teams yet. Add a team or import via JSON.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Votes Tab */}
                  {activeTab === 'votes' && (
                    <div className="space-y-4">
                      {votes.map((vote) => (
                        <div key={vote.id} className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Team: {vote.teamId.slice(0, 8)}...</p>
                              <p className="text-sm text-slate-400">Jury: {vote.juryId.slice(0, 8)}...</p>
                              <p className="text-sm text-slate-400">Score: {vote.totalScore}</p>
                              <p className={`text-sm ${vote.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {vote.isActive ? 'Active' : 'Reverted'}
                              </p>
                            </div>
                            {vote.isActive && (
                              <button
                                onClick={() => handleRevertVote(vote.id)}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {votes.length === 0 && (
                        <p className="text-slate-500 text-center py-8">No votes yet.</p>
                      )}
                    </div>
                  )}

                  {/* Leaderboard Tab */}
                  {activeTab === 'leaderboard' && (
                    <div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Rank</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Team</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Avg Score</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Votes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((entry, index) => (
                            <tr key={entry.team.id} className="border-b border-slate-700/30">
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-slate-700/50 text-slate-400'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-white">{entry.team.name}</td>
                              <td className="py-3 px-4 text-blue-400 font-medium">{entry.averageScore.toFixed(2)}</td>
                              <td className="py-3 px-4 text-slate-400">{entry.voteCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {leaderboard.length === 0 && (
                        <p className="text-slate-500 text-center py-8">No leaderboard data yet.</p>
                      )}
                    </div>
                  )}

                  {/* Jury Tab */}
                  {activeTab === 'jury' && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {juryMembers.map((jury) => {
                          const juryVotes = votes.filter(v => v.juryId === jury.id && v.isActive).length;
                          return (
                            <button
                              key={jury.id}
                              onClick={() => { setSelectedJury(jury); setJuryCategoryInput(jury.category ?? ''); }}
                              className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50 text-left hover:border-slate-500/60 hover:bg-slate-900/50 transition-all group"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-emerald-400 font-medium">{jury.name.charAt(0)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-white truncate">{jury.name}</h3>
                                  <p className="text-xs text-slate-400 truncate">{jury.email}</p>
                                </div>
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div className="flex items-center justify-between">
                                {jury.category ? (
                                  <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 text-xs rounded-lg font-medium">
                                    {jury.category}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-600 italic">No category</span>
                                )}
                                <span className="text-xs text-slate-500">{juryVotes} votes</span>
                              </div>
                            </button>
                          );
                        })}
                        {juryMembers.length === 0 && (
                          <p className="text-slate-500 col-span-3 text-center py-8">No jury members yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Criteria Tab */}
                  {activeTab === 'criteria' && (
                    <div>
                      {criteria.length > 0 ? (
                        <div className="space-y-3">
                          {criteria.map((c) => (
                            <div key={c.id} className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50 flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-white">{c.title}</h3>
                              </div>
                              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg">
                                Max: {c.maxScore}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-center py-8">No criteria imported yet.</p>
                      )}
                    </div>
                  )}

                  {/* Logs Tab */}
                  {activeTab === 'logs' && (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
                          <p className="font-medium text-white">
                            {log.action === 'VOTE_CREATED' ? 'Vote Created' : 'Vote Reverted'}
                          </p>
                          <p className="text-sm text-slate-400">Vote ID: {log.voteId.slice(0, 8)}...</p>
                          <p className="text-sm text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <p className="text-slate-500 text-center py-8">No logs yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700/30 mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400">Select or create an event to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Jury Profile Modal */}
      {selectedJury && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedJury(null); setJuryCategoryInput(''); } }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
              <h2 className="text-base font-semibold text-white">Jury Profile</h2>
              <button
                onClick={() => { setSelectedJury(null); setJuryCategoryInput(''); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile info */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-xl font-semibold">{selectedJury.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-base">{selectedJury.name}</p>
                  <p className="text-slate-400 text-sm">{selectedJury.email}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {votes.filter(v => v.juryId === selectedJury.id && v.isActive).length} votes cast
                  </p>
                </div>
              </div>

              {/* Category assignment */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Assigned Category
                </label>
                <p className="text-xs text-slate-500">
                  This jury member will only see teams in the selected category.
                </p>

                {/* Category pills from existing teams */}
                {teamCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setJuryCategoryInput('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        juryCategoryInput === ''
                          ? 'bg-slate-600 border-slate-500 text-white'
                          : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      All teams
                    </button>
                    {teamCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setJuryCategoryInput(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          juryCategoryInput === cat
                            ? 'bg-blue-500/30 border-blue-500/60 text-blue-300'
                            : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Free-text fallback */}
                <input
                  type="text"
                  placeholder="Or type a category name…"
                  value={juryCategoryInput}
                  onChange={(e) => setJuryCategoryInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />

                {/* Preview of what the jury will see */}
                {juryCategoryInput && (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-2">Teams visible to this jury:</p>
                    {teams.filter(t => t.category === juryCategoryInput).length > 0 ? (
                      <ul className="space-y-1">
                        {teams.filter(t => t.category === juryCategoryInput).map(t => (
                          <li key={t.id} className="flex items-center gap-2 text-xs text-white">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                            {t.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No teams with this category yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-700/60 flex items-center justify-end gap-3">
              <button
                onClick={() => { setSelectedJury(null); setJuryCategoryInput(''); }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateJuryCategory}
                disabled={loading}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}