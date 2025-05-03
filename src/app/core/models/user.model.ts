export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  token: string;
  avatar?: string;
  specialization?: string;
  licenseNumber?: string;
  affiliation?: string;
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
}