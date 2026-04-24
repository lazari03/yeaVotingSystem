import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getAll(): Promise<User[]>;
  getJuryMembers(): Promise<User[]>;
}