import { ITeamRepository } from '@/domain/repositories/ITeamRepository';
import { Team } from '@/domain/entities/Team';

export interface GetTeamsForEventInput {
  eventId: string;
}

export interface GetTeamsForEventDeps {
  teamRepository: ITeamRepository;
}

export async function getTeamsForEvent(
  input: GetTeamsForEventInput,
  deps: GetTeamsForEventDeps
): Promise<Team[]> {
  return deps.teamRepository.getByEventId(input.eventId);
}