export class User {
  id!: number;
  name!: string;
  email!: string;
  dni!: string;
  phone!: string;
  role!: 'USER' | 'EMPLOYEE' | 'ADMIN';

  password?: string;
}
