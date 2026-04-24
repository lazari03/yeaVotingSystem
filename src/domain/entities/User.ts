export type Role = 'admin' | 'jury';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}