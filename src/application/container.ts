import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IEventRepository } from '../domain/repositories/IEventRepository';
import { ICriteriaRepository } from '../domain/repositories/ICriteriaRepository';
import { ITeamRepository } from '../domain/repositories/ITeamRepository';
import { IVoteRepository } from '../domain/repositories/IVoteRepository';
import { ILogRepository } from '../domain/repositories/ILogRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { CriteriaRepository } from '../infrastructure/repositories/CriteriaRepository';
import { TeamRepository } from '../infrastructure/repositories/TeamRepository';
import { VoteRepository } from '../infrastructure/repositories/VoteRepository';
import { LogRepository } from '../infrastructure/repositories/LogRepository';

export interface AppContainer {
  userRepository: IUserRepository;
  eventRepository: IEventRepository;
  criteriaRepository: ICriteriaRepository;
  teamRepository: ITeamRepository;
  voteRepository: IVoteRepository;
  logRepository: ILogRepository;
}

let container: AppContainer | null = null;

export function getContainer(): AppContainer {
  if (!container) {
    container = {
      userRepository: new UserRepository(),
      eventRepository: new EventRepository(),
      criteriaRepository: new CriteriaRepository(),
      teamRepository: new TeamRepository(),
      voteRepository: new VoteRepository(),
      logRepository: new LogRepository(),
    };
  }
  return container;
}