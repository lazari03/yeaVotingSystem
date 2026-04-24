export type LogAction = 'VOTE_CREATED' | 'VOTE_REVERTED';

export interface Log {
  id: string;
  action: LogAction;
  voteId: string;
  adminId: string;
  timestamp: number;
}