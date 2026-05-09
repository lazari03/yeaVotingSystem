import { PackVote } from '../entities/PackVote';

export interface IPackVoteRepository {
  create(packVote: Omit<PackVote, 'id'>): Promise<PackVote>;
  getByEventId(eventId: string): Promise<PackVote[]>;
  getByJuryAndEvent(juryId: string, eventId: string): Promise<PackVote | null>;
}
