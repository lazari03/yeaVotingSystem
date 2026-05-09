import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IEventRepository } from '../domain/repositories/IEventRepository';
import { ICriteriaRepository } from '../domain/repositories/ICriteriaRepository';
import { ITeamRepository } from '../domain/repositories/ITeamRepository';
import { IVoteRepository } from '../domain/repositories/IVoteRepository';
import { ILogRepository } from '../domain/repositories/ILogRepository';
import { IPackVoteRepository } from '../domain/repositories/IPackVoteRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { CriteriaRepository } from '../infrastructure/repositories/CriteriaRepository';
import { TeamRepository } from '../infrastructure/repositories/TeamRepository';
import { VoteRepository } from '../infrastructure/repositories/VoteRepository';
import { LogRepository } from '../infrastructure/repositories/LogRepository';
import { PackVoteRepository } from '../infrastructure/repositories/PackVoteRepository';

export interface AppContainer {
  userRepository: IUserRepository;
  eventRepository: IEventRepository;
  criteriaRepository: ICriteriaRepository;
  teamRepository: ITeamRepository;
  voteRepository: IVoteRepository;
  logRepository: ILogRepository;
  packVoteRepository: IPackVoteRepository;
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
      packVoteRepository: new PackVoteRepository(),
    };
  }
  return container;
}