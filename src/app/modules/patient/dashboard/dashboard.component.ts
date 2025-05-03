import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Dashboard stats
  upcomingAppointments = 2;
  unreadMessages = 3;
  pendingPrescriptions = 1;
  lastCheckup = '2023-04-15';
  
  // Mock health metrics
  healthMetrics = {
    heartRate: { value: 72, unit: 'bpm', status: 'normal' },
    bloodPressure: { value: '120/80', unit: 'mmHg', status: 'normal' },
    bloodSugar: { value: 90, unit: 'mg/dL', status: 'normal' },
    weight: { value: 68, unit: 'kg', status: 'normal' }
  };
  
  // Demo doctors
  doctorsList = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      rating: 4.8,
      avatar: 'assets/images/doctor-avatar.svg'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      rating: 4.7,
      avatar: 'assets/images/default-avatar.svg'
    },
    {
      id: 3,
      name: 'Dr. Emily Wilson',
      specialization: 'Dermatology',
      rating: 4.9,
      avatar: 'assets/images/default-avatar.svg'
    }
  ];

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
    this.router.navigate(['/appointments']);
  }

  chatWithDoctor(doctorId: number): void {
    this.router.navigate(['/chat'], { queryParams: { doctorId } });
  }

  viewMedicalRecords(): void {
    // In a real app, this would navigate to medical records
    alert('Medical records feature would open here');
  }

  startHealthAssistant(): void {
    this.router.navigate(['/health-bot']);
  }
}