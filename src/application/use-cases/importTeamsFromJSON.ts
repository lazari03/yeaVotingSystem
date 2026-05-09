import { ITeamRepository } from '@/domain/repositories/ITeamRepository';
import { Team } from '@/domain/entities/Team';

export interface TeamJSON {
  name: string;
  category?: string;
}

export interface ImportTeamsFromJSONInput {
  eventId: string;
  teams: TeamJSON[];
}

export interface ImportTeamsFromJSONDeps {
  teamRepository: ITeamRepository;
}

export async function importTeamsFromJSON(
  input: ImportTeamsFromJSONInput,
  deps: ImportTeamsFromJSONDeps
): Promise<Team[]> {
  const created: Team[] = [];
  for (const t of input.teams) {
    const team = await deps.teamRepository.create({
      eventId: input.eventId,
      name: t.name,
      category: t.category ?? '',
    });
    created.push(team);
  }
  return created;
}
