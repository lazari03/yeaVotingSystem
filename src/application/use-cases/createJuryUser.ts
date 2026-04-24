import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';

export interface CreateJuryUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateJuryUserDeps {
  userRepository: IUserRepository;
  authCreateUser: (email: string, password: string) => Promise<string>;
}

export async function createJuryUser(
  input: CreateJuryUserInput,
  deps: CreateJuryUserDeps
): Promise<User> {
  const existingUser = await deps.userRepository.getByEmail(input.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const uid = await deps.authCreateUser(input.email, input.password);

  const user = await deps.userRepository.create({
    id: uid,
    name: input.name,
    email: input.email,
    role: 'jury',
  });

  return user;
}