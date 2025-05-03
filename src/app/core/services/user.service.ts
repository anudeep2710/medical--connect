import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // Get current user profile
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData);
  }

  // Update user password
  updatePassword(passwords: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, passwords);
  }

  // Get health statistics for patient
  getHealthStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/health-statistics`);
  }

  // Get doctor by ID
  getDoctor(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/doctors/${id}`);
  }

  // Get patient by ID
  getPatient(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/patients/${id}`);
  }

  // Get list of patients for doctor
  getMyPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/doctors/me/patients`);
  }

  // Get list of doctors for patient
  getMyDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/patients/me/doctors`);
  }
}
