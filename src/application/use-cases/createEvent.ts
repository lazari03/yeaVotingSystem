import { IEventRepository } from '@/domain/repositories/IEventRepository';
import { Event } from '@/domain/entities/Event';

export interface CreateEventInput {
  name: string;
}

export interface CreateEventDeps {
  eventRepository: IEventRepository;
}

export async function createEvent(
  input: CreateEventInput,
  deps: CreateEventDeps
): Promise<Event> {
  const event = await deps.eventRepository.create({
    name: input.name,
    createdAt: Date.now(),
  });

  return event;
}