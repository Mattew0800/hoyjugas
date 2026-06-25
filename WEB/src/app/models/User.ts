export class User{
  id?: number;
  name?: string;
  password?: string;
  email?: string;
  dni?: string;
  phone?: string;
  role?: 'USER' | 'EMPLOYEE' | 'ADMIN';
}
