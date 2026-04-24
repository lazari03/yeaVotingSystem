import { ICriteriaRepository } from '@/domain/repositories/ICriteriaRepository';
import { Criteria } from '@/domain/entities/Criteria';

export interface CriteriaJSON {
  title: string;
  maxScore: number;
}

export interface ImportCriteriaFromJSONInput {
  eventId: string;
  criteria: CriteriaJSON[];
}

export interface ImportCriteriaFromJSONDeps {
  criteriaRepository: ICriteriaRepository;
}

export async function importCriteriaFromJSON(
  input: ImportCriteriaFromJSONInput,
  deps: ImportCriteriaFromJSONDeps
): Promise<Criteria[]> {
  await deps.criteriaRepository.deleteByEventId(input.eventId);

  const createdCriteria: Criteria[] = [];

  for (const c of input.criteria) {
    const criteria = await deps.criteriaRepository.create({
      eventId: input.eventId,
      title: c.title,
      maxScore: c.maxScore,
    });
    createdCriteria.push(criteria);
  }

  return createdCriteria;
}