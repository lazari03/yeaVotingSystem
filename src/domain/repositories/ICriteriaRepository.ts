import { Criteria } from '../entities/Criteria';

export interface ICriteriaRepository {
  create(criteria: Omit<Criteria, 'id'>): Promise<Criteria>;
  getById(id: string): Promise<Criteria | null>;
  getByEventId(eventId: string): Promise<Criteria[]>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}