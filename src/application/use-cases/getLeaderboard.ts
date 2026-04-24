import { IVoteRepository } from '@/domain/repositories/IVoteRepository';
import { ITeamRepository } from '@/domain/repositories/ITeamRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { Team } from '@/domain/entities/Team';

export interface LeaderboardEntry {
  team: Team;
  averageScore: number;
  voteCount: number;
}

export interface GetLeaderboardInput {
  eventId: string;
}

export interface GetLeaderboardDeps {
  voteRepository: IVoteRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
}

export async function getLeaderboard(
  input: GetLeaderboardInput,
  deps: GetLeaderboardDeps
): Promise<LeaderboardEntry[]> {
  const teams = await deps.teamRepository.getByEventId(input.eventId);
  const allVotes = await deps.voteRepository.getByEventId(input.eventId);
  const activeVotes = allVotes.filter(v => v.isActive);

  const voteCountsByTeam: Record<string, number> = {};
  const scoreSumsByTeam: Record<string, number> = {};

  for (const team of teams) {
    voteCountsByTeam[team.id] = 0;
    scoreSumsByTeam[team.id] = 0;
  }

  for (const vote of activeVotes) {
    if (voteCountsByTeam[vote.teamId] !== undefined) {
      voteCountsByTeam[vote.teamId]++;
      scoreSumsByTeam[vote.teamId] += vote.totalScore;
    }
  }

  const leaderboard: LeaderboardEntry[] = teams.map(team => ({
    team,
    averageScore: voteCountsByTeam[team.id] > 0 
      ? scoreSumsByTeam[team.id] / voteCountsByTeam[team.id] 
      : 0,
    voteCount: voteCountsByTeam[team.id],
  }));

  leaderboard.sort((a, b) => b.averageScore - a.averageScore);

  return leaderboard;
}