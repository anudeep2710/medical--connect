import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentRequest, TimeSlot, Doctor } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/api/appointments`;

  constructor(private http: HttpClient) {}

  // Get appointments
  getAppointments(status?: string, type?: string, startDate?: string, endDate?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    
    if (status) {
      params = params.append('status', status);
    }
    
    if (type) {
      params = params.append('type', type);
    }
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    
    return this.http.get<Appointment[]>(this.apiUrl, { params });
  }

  // Get appointment by ID
  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  // Create a new appointment
  createAppointment(appointment: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  // Update an existing appointment
  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  // Cancel appointment
  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get available time slots for a doctor
  getAvailableTimeSlots(doctorId: number, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${environment.apiUrl}/api/doctors/${doctorId}/time-slots`, {
      params: { date }
    });
  }

  // Get all doctors
  getDoctors(specialization?: string): Observable<Doctor[]> {
    let params = new HttpParams();
    
    if (specialization) {
      params = params.append('specialization', specialization);
    }
    
    return this.http.get<Doctor[]>(`${environment.apiUrl}/api/doctors`, { params });
  }
}
