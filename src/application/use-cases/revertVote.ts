import { IVoteRepository } from '@/domain/repositories/IVoteRepository';
import { ILogRepository } from '@/domain/repositories/ILogRepository';
import { Vote } from '@/domain/entities/Vote';

export interface RevertVoteInput {
  voteId: string;
  adminId: string;
}

export interface RevertVoteDeps {
  voteRepository: IVoteRepository;
  logRepository: ILogRepository;
}

export async function revertVote(
  input: RevertVoteInput,
  deps: RevertVoteDeps
): Promise<Vote> {
  const vote = await deps.voteRepository.getById(input.voteId);

  if (!vote) {
    throw new Error('Vote not found');
  }

  if (!vote.isActive) {
    throw new Error('Vote is already inactive');
  }

  const updatedVote = await deps.voteRepository.update({
    ...vote,
    isActive: false,
  });

  await deps.logRepository.create({
    action: 'VOTE_REVERTED',
    voteId: vote.id,
    adminId: input.adminId,
    timestamp: Date.now(),
  });

  return updatedVote;
}