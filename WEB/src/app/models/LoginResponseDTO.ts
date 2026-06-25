export interface LoginResponseDTO {
  name?: string;
  email?: string;
  role?: 'USER' | 'EMPLOYEE' | 'ADMIN';

}
