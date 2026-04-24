export interface Vote {
  id: string;
  eventId: string;
  teamId: string;
  juryId: string;
  scores: Record<string, number>;
  totalScore: number;
  isActive: boolean;
  createdAt: number;
}