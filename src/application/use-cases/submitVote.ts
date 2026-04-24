import { IVoteRepository } from '@/domain/repositories/IVoteRepository';
import { ILogRepository } from '@/domain/repositories/ILogRepository';
import { ICriteriaRepository } from '@/domain/repositories/ICriteriaRepository';
import { Vote } from '@/domain/entities/Vote';

export interface SubmitVoteInput {
  eventId: string;
  teamId: string;
  juryId: string;
  scores: Record<string, number>;
  adminId: string;
}

export interface SubmitVoteDeps {
  voteRepository: IVoteRepository;
  criteriaRepository: ICriteriaRepository;
  logRepository: ILogRepository;
}

export async function submitVote(
  input: SubmitVoteInput,
  deps: SubmitVoteDeps
): Promise<Vote> {
  const criteria = await deps.criteriaRepository.getByEventId(input.eventId);
  
  if (criteria.length === 0) {
    throw new Error('No criteria found for this event. Please import criteria before voting.');
  }

  for (const c of criteria) {
    const score = input.scores[c.id];
    if (score === undefined || score < 0 || score > c.maxScore) {
      throw new Error(`Invalid score for criteria "${c.title}". Must be between 0 and ${c.maxScore}`);
    }
  }

  const activeVote = await deps.voteRepository.getActiveVotesByJuryAndTeam(
    input.juryId,
    input.teamId
  );

  if (activeVote) {
    throw new Error('You already have an active vote for this team. Only one active vote per jury per team is allowed.');
  }

  const totalScore = Object.values(input.scores).reduce((sum, s) => sum + s, 0);

  const vote = await deps.voteRepository.create({
    eventId: input.eventId,
    teamId: input.teamId,
    juryId: input.juryId,
    scores: input.scores,
    totalScore,
    isActive: true,
    createdAt: Date.now(),
  });

  await deps.logRepository.create({
    action: 'VOTE_CREATED',
    voteId: vote.id,
    adminId: input.adminId,
    timestamp: Date.now(),
  });

  return vote;
}