import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { UserService } from '../../../core/services/user.service';
import { Appointment } from '../../../core/models/appointment.model';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

interface HealthStat {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: string;
  color: string;
}

interface HealthTip {
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  icon: string;
}

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, FeatherDirective, ButtonComponent, CardComponent]
})
export class PatientDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  healthStats: HealthStat[] = [];
  healthTips: HealthTip[] = [];
  isLoading = true;
  error = '';
  
  constructor(
    private appointmentService: AppointmentService,
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    this.isLoading = true;
    
    // Fetch upcoming appointments and health statistics
    forkJoin({
      appointments: this.appointmentService.getAppointments('CONFIRMED').pipe(
        catchError(error => {
          console.error('Error fetching appointments', error);
          return of([]);
        })
      ),
      healthStats: this.userService.getHealthStatistics().pipe(
        catchError(error => {
          console.error('Error fetching health statistics', error);
          return of({});
        })
      )
    }).subscribe({
      next: (results) => {
        this.appointments = results.appointments.slice(0, 3); // Show only the first 3
        this.mapHealthStats(results.healthStats);
        this.generateHealthTips();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  mapHealthStats(data: any) {
    if (data && data.stats) {
      this.healthStats = [
        {
          title: 'Heart Rate',
          value: data.stats.heartRate?.value || '75',
          unit: 'bpm',
          trend: data.stats.heartRate?.trend || 'stable',
          trendValue: data.stats.heartRate?.trendValue || '0%',
          icon: 'heart',
          color: 'text-danger-500'
        },
        {
          title: 'Blood Pressure',
          value: data.stats.bloodPressure?.value || '120/80',
          unit: 'mmHg',
          trend: data.stats.bloodPressure?.trend || 'stable',
          trendValue: data.stats.bloodPressure?.trendValue || '0%',
          icon: 'activity',
          color: 'text-primary-500'
        },
        {
          title: 'Steps',
          value: data.stats.steps?.value || '5,280',
          unit: 'steps',
          trend: data.stats.steps?.trend || 'up',
          trendValue: data.stats.steps?.trendValue || '+12%',
          icon: 'trending-up',
          color: 'text-success-500'
        },
        {
          title: 'Sleep',
          value: data.stats.sleep?.value || '7.2',
          unit: 'hours',
          trend: data.stats.sleep?.trend || 'down',
          trendValue: data.stats.sleep?.trendValue || '-5%',
          icon: 'moon',
          color: 'text-secondary-500'
        }
      ];
    } else {
      // Fallback if no data is available
      this.healthStats = [
        {
          title: 'Heart Rate',
          value: '75',
          unit: 'bpm',
          trend: 'stable',
          trendValue: '0%',
          icon: 'heart',
          color: 'text-danger-500'
        },
        {
          title: 'Blood Pressure',
          value: '120/80',
          unit: 'mmHg',
          trend: 'stable',
          trendValue: '0%',
          icon: 'activity',
          color: 'text-primary-500'
        },
        {
          title: 'Steps',
          value: '5,280',
          unit: 'steps',
          trend: 'up',
          trendValue: '+12%',
          icon: 'trending-up',
          color: 'text-success-500'
        },
        {
          title: 'Sleep',
          value: '7.2',
          unit: 'hours',
          trend: 'down',
          trendValue: '-5%',
          icon: 'moon',
          color: 'text-secondary-500'
        }
      ];
    }
  }
  
  generateHealthTips() {
    this.healthTips = [
      {
        title: 'Stay Hydrated',
        description: 'Aim to drink at least 8 glasses of water per day for optimal health.',
        importance: 'medium',
        icon: 'droplet'
      },
      {
        title: 'Take a Break',
        description: 'For every hour of screen time, take a 5-minute break to rest your eyes.',
        importance: 'low',
        icon: 'coffee'
      },
      {
        title: 'Annual Check-up',
        description: 'Schedule your annual physical examination to monitor your health.',
        importance: 'high',
        icon: 'calendar'
      }
    ];
  }
  
  bookAppointment() {
    this.router.navigate(['/appointments/book']);
  }
  
  viewAllAppointments() {
    this.router.navigate(['/appointments']);
  }
  
  joinCall(appointment: Appointment) {
    this.router.navigate(['/video-call'], { 
      queryParams: { appointmentId: appointment.id } 
    });
  }
  
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  }
  
  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'text-success-500';
      case 'down': return 'text-danger-500';
      default: return 'text-gray-500';
    }
  }
  
  getImportanceClass(importance: string): string {
    switch (importance) {
      case 'high': return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'medium': return 'bg-warning-100 text-warning-800 border-warning-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}
