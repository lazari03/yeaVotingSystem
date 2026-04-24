import { IVoteRepository } from '@/domain/repositories/IVoteRepository';
import { Vote } from '@/domain/entities/Vote';

export interface GetVotesRealtimeInput {
  eventId: string;
  onUpdate: (votes: Vote[]) => void;
}

export interface GetVotesRealtimeDeps {
  voteRepository: IVoteRepository;
}

export function getVotesRealtime(
  input: GetVotesRealtimeInput,
  deps: GetVotesRealtimeDeps
): () => void {
  return deps.voteRepository.subscribeToEventVotes(input.eventId, input.onUpdate);
}