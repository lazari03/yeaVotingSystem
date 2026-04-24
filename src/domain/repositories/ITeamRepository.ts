import { Team } from '../entities/Team';

export interface ITeamRepository {
  create(team: Omit<Team, 'id'>): Promise<Team>;
  getById(id: string): Promise<Team | null>;
  getByEventId(eventId: string): Promise<Team[]>;
  delete(id: string): Promise<void>;
}