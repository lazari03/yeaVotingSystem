import { Event } from '../entities/Event';

export interface IEventRepository {
  create(event: Omit<Event, 'id'>): Promise<Event>;
  getById(id: string): Promise<Event | null>;
  getAll(): Promise<Event[]>;
  delete(id: string): Promise<void>;
}