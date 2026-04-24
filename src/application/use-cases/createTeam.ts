import { ITeamRepository } from '@/domain/repositories/ITeamRepository';
import { Team } from '@/domain/entities/Team';

export interface CreateTeamInput {
  eventId: string;
  name: string;
}

export interface CreateTeamDeps {
  teamRepository: ITeamRepository;
}

export async function createTeam(
  input: CreateTeamInput,
  deps: CreateTeamDeps
): Promise<Team> {
  const team = await deps.teamRepository.create({
    eventId: input.eventId,
    name: input.name,
  });

  return team;
}