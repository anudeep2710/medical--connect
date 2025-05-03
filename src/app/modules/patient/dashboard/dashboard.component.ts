import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

interface HealthMetric {
  name: string;
  value: string | number;
  unit: string;
  status: string;
  icon: string;
  color: string;
  statusColor: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  
  // Dashboard stats
  upcomingAppointments = 0;
  unreadMessages = 0;
  pendingPrescriptions = 0;
  lastCheckup = new Date();
  
  // Mock health metrics
  healthMetrics: HealthMetric[] = [
    {
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'Normal',
      icon: 'heart',
      color: 'red',
      statusColor: 'green'
    },
    {
      name: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'Normal',
      icon: 'activity',
      color: 'blue',
      statusColor: 'green'
    },
    {
      name: 'Blood Sugar',
      value: 95,
      unit: 'mg/dL',
      status: 'Normal',
      icon: 'droplet',
      color: 'purple',
      statusColor: 'green'
    },
    {
      name: 'Weight',
      value: 70,
      unit: 'kg',
      status: 'Normal',
      icon: 'trending-up',
      color: 'yellow',
      statusColor: 'green'
    }
  ];
  
  // Demo doctors
  doctorsList: Doctor[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoading = false;
    });
  }

  bookAppointment(): void {
    this.router.navigate(['/appointments/book']);
  }

  chatWithDoctor(doctorId: string): void {
    this.router.navigate(['/chat'], { queryParams: { doctorId } });
  }

  viewMedicalRecords(): void {
    this.router.navigate(['/medical-records']);
  }

  startHealthAssistant(): void {
    this.router.navigate(['/health-bot']);
  }
}