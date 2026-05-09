import { IPackVoteRepository } from '@/domain/repositories/IPackVoteRepository';
import { PackVote } from '@/domain/entities/PackVote';

export interface SubmitPackVoteInput {
  eventId: string;
  juryId: string;
  teamId: string;
  juryCategory: string;
}

export interface SubmitPackVoteDeps {
  packVoteRepository: IPackVoteRepository;
}

function resolvePackName(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('startup')) return 'Startup Pack';
  return 'Innovation Pack';
}

export async function submitPackVote(
  input: SubmitPackVoteInput,
  deps: SubmitPackVoteDeps
): Promise<PackVote> {
  const existing = await deps.packVoteRepository.getByJuryAndEvent(input.juryId, input.eventId);
  if (existing) {
    throw new Error('You have already cast your pack vote for this event.');
  }

  return deps.packVoteRepository.create({
    eventId: input.eventId,
    juryId: input.juryId,
    teamId: input.teamId,
    packName: resolvePackName(input.juryCategory),
    createdAt: Date.now(),
  });
}
