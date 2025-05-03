import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeatherDirective } from '../../../shared/directives/feather.directive';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FeatherDirective]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Dashboard stats
  todayAppointments = 5;
  totalPatients = 48;
  pendingReports = 3;
  
  // Demo appointments for today
  todaysAppointmentsList = [
    {
      id: 101,
      patientName: 'John Smith',
      patientAvatar: 'assets/images/patient-avatar.svg',
      time: '09:30 AM',
      type: 'VIDEO_CALL',
      status: 'CONFIRMED'
    },
    {
      id: 102,
      patientName: 'Emily Johnson',
      patientAvatar: 'assets/images/default-avatar.svg',
      time: '11:00 AM',
      type: 'IN_PERSON',
      status: 'CONFIRMED'
    },
    {
      id: 103,
      patientName: 'Michael Brown',
      patientAvatar: 'assets/images/default-avatar.svg',
      time: '01:15 PM',
      type: 'VIDEO_CALL',
      status: 'PENDING'
    },
    {
      id: 104,
      patientName: 'Sarah Williams',
      patientAvatar: 'assets/images/default-avatar.svg',
      time: '03:30 PM',
      type: 'IN_PERSON',
      status: 'CONFIRMED'
    },
    {
      id: 105,
      patientName: 'David Garcia',
      patientAvatar: 'assets/images/default-avatar.svg',
      time: '05:00 PM',
      type: 'VIDEO_CALL',
      status: 'CONFIRMED'
    }
  ];
  
  // Demo recent patients
  recentPatientsList = [
    {
      id: 201,
      name: 'John Smith',
      avatar: 'assets/images/patient-avatar.svg',
      age: 42,
      lastVisit: '2023-04-15',
      condition: 'Hypertension'
    },
    {
      id: 202,
      name: 'Emily Johnson',
      avatar: 'assets/images/default-avatar.svg',
      age: 35,
      lastVisit: '2023-04-10',
      condition: 'Diabetes Type 2'
    },
    {
      id: 203,
      name: 'Michael Brown',
      avatar: 'assets/images/default-avatar.svg',
      age: 28,
      lastVisit: '2023-04-05',
      condition: 'Asthma'
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

  startAppointment(appointmentId: number, type: string): void {
    if (type === 'VIDEO_CALL') {
      this.router.navigate(['/video-call'], { queryParams: { appointmentId } });
    } else {
      // In a real app, this would open the in-person appointment view
      alert('In-person appointment view would open here');
    }
  }

  viewPatientDetails(patientId: number): void {
    // In a real app, this would navigate to patient details
    alert('Patient details view would open here');
  }

  viewAllAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  messagePatient(patientId: number): void {
    this.router.navigate(['/chat'], { queryParams: { patientId } });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAppointmentTypeIcon(type: string): string {
    return type === 'VIDEO_CALL' ? 'video' : 'user';
  }
}