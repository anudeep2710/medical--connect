export interface Doctor {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  avatar?: string;
  affiliation?: string;
  yearsOfExperience?: number;
}

export interface Patient {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
}

export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type AppointmentType = 'IN_PERSON' | 'VIDEO_CALL';

export interface Appointment {
  id: number;
  doctor: Doctor;
  patient: Patient;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reasonForVisit?: string;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AppointmentRequest {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  reasonForVisit?: string;
  notes?: string;
}