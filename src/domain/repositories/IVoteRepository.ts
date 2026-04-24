import { Vote } from '../entities/Vote';

export interface IVoteRepository {
  create(vote: Omit<Vote, 'id'>): Promise<Vote>;
  getById(id: string): Promise<Vote | null>;
  getByEventId(eventId: string): Promise<Vote[]>;
  getByJuryAndTeam(juryId: string, teamId: string): Promise<Vote | null>;
  getActiveVotesByJuryAndTeam(juryId: string, teamId: string): Promise<Vote | null>;
  update(vote: Vote): Promise<Vote>;
  delete(id: string): Promise<void>;
  subscribeToEventVotes(eventId: string, onUpdate: (votes: Vote[]) => void): () => void;
}