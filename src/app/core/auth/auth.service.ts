import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  // Demo users for testing without a backend
  private demoUsers = [
    {
      id: 1,
      fullName: 'Dr. Sarah Johnson',
      email: 'doctor@example.com',
      password: 'doctor123',
      role: 'DOCTOR',
      token: 'demo-doctor-token',
      avatar: 'assets/images/doctor-avatar.svg',
      specialization: 'Cardiology',
      licenseNumber: 'MD-12345',
      affiliation: 'Central Hospital',
      yearsOfExperience: 8,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      fullName: 'John Smith',
      email: 'patient@example.com',
      password: 'patient123',
      role: 'PATIENT',
      token: 'demo-patient-token',
      avatar: 'assets/images/patient-avatar.svg',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in from localStorage
    this.populate();
  }

  populate() {
    // Check if user is already logged in from localStorage or sessionStorage
    let user = this.getItemFromStorage('user');
    
    // If not in localStorage, check sessionStorage
    if (!user) {
      user = sessionStorage.getItem('user');
    }
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        this.setAuth(parsedUser);
      } catch (e) {
        this.purgeAuth();
      }
      return;
    }

    // If no user in storage, purge auth
    this.purgeAuth();
  }

  setAuth(user: User, rememberMe: boolean = false) {
    // Save JWT sent from server in localStorage (if rememberMe is true) or sessionStorage
    if (rememberMe) {
      // For long-term storage, use localStorage
      this.saveItemToStorage('user', JSON.stringify(user));
    } else {
      // For session-only storage, use sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    
    // Set current user data into observable
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Clear both localStorage and sessionStorage to ensure complete logout
    this.removeItemFromStorage('user');
    sessionStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: { email: string; password: string; role: string; rememberMe?: boolean }): Observable<User> {
    // In a real implementation, this would be an API call
    // For demo, we will use the demo users

    const demoUser = this.demoUsers.find(
      user => user.email === credentials.email && 
              user.password === credentials.password &&
              user.role === credentials.role
    );

    if (demoUser) {
      // Remove the password before returning the user
      const { password, ...user } = demoUser;
      // Return a mock Observable that emits the user
      return new Observable<User>(observer => {
        observer.next(user as User);
        observer.complete();
      }).pipe(
        tap(user => this.setAuth(user, credentials.rememberMe))
      );
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }

  register(user: any): Observable<User> {
    // In a real implementation, this would be an API call
    // For demo, we will throw an error since registration is not supported in demo mode
    return throwError(() => new Error('Registration is not available in demo mode'));
  }

  logout() {
    this.purgeAuth();
    this.router.navigateByUrl('/auth/login');
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser !== null && roles.includes(currentUser.role);
  }

  // Helper methods for localStorage/sessionStorage
  private saveItemToStorage(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private getItemFromStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  private removeItemFromStorage(key: string): void {
    localStorage.removeItem(key);
  }
}