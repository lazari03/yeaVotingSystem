import { Log } from '../entities/Log';

export interface ILogRepository {
  create(log: Omit<Log, 'id'>): Promise<Log>;
  getByVoteId(voteId: string): Promise<Log[]>;
  getAll(): Promise<Log[]>;
}