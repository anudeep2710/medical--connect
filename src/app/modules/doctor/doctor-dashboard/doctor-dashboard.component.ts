import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ChatService } from '../../../core/services/chat.service';
import { UserService } from '../../../core/services/user.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Message, Chat } from '../../../core/models/chat.model';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

interface DoctorStat {
  title: string;
  value: number | string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent, FeatherDirective, ButtonComponent, AvatarComponent]
})
export class DoctorDashboardComponent implements OnInit {
  todayAppointments: Appointment[] = [];
  recentMessages: Chat[] = [];
  doctorStats: DoctorStat[] = [];
  isLoading = true;
  error = '';
  
  // Date info for schedule
  today: Date = new Date();
  currentHour = this.today.getHours();
  hourSlots: number[] = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 7 PM
  
  constructor(
    private appointmentService: AppointmentService,
    private chatService: ChatService,
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    this.isLoading = true;
    
    // Format today's date for appointment filtering
    const todayDate = this.today.toISOString().split('T')[0];
    
    // Fetch appointments, messages, and patient stats
    forkJoin({
      appointments: this.appointmentService.getAppointments(undefined, undefined, todayDate, todayDate).pipe(
        catchError(error => {
          console.error('Error fetching appointments', error);
          return of([]);
        })
      ),
      chats: this.chatService.getChats().pipe(
        catchError(error => {
          console.error('Error fetching chats', error);
          return of([]);
        })
      ),
      stats: this.getUserStatistics().pipe(
        catchError(error => {
          console.error('Error fetching statistics', error);
          return of({});
        })
      )
    }).subscribe({
      next: (results) => {
        this.todayAppointments = results.appointments;
        this.recentMessages = results.chats.slice(0, 5); // Show only the first 5
        this.mapDoctorStats(results.stats);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  getUserStatistics(): Observable<any> {
    // This would typically be a real API call to get doctor statistics
    // For now, we'll simulate it with realistic data
    return of({
      patientsToday: 8,
      totalPatients: 247,
      completedAppointments: 6,
      pendingReviews: 3,
      trends: {
        patientsToday: { value: 8, trend: 'up', percentage: 12.5 },
        totalPatients: { value: 247, trend: 'up', percentage: 4.2 },
        completedAppointments: { value: 6, trend: 'stable', percentage: 0 },
        pendingReviews: { value: 3, trend: 'down', percentage: 25 }
      }
    });
  }
  
  mapDoctorStats(data: any) {
    if (data && data.trends) {
      this.doctorStats = [
        {
          title: 'Patients Today',
          value: data.trends.patientsToday.value,
          icon: 'users',
          trend: data.trends.patientsToday.trend,
          trendValue: `${data.trends.patientsToday.percentage}%`,
          color: 'text-primary-500'
        },
        {
          title: 'Total Patients',
          value: data.trends.totalPatients.value,
          icon: 'user-check',
          trend: data.trends.totalPatients.trend,
          trendValue: `${data.trends.totalPatients.percentage}%`,
          color: 'text-secondary-500'
        },
        {
          title: 'Completed Appointments',
          value: data.trends.completedAppointments.value,
          icon: 'check-circle',
          trend: data.trends.completedAppointments.trend,
          trendValue: `${data.trends.completedAppointments.percentage}%`,
          color: 'text-success-500'
        },
        {
          title: 'Pending Reviews',
          value: data.trends.pendingReviews.value,
          icon: 'clipboard',
          trend: data.trends.pendingReviews.trend,
          trendValue: `${data.trends.pendingReviews.percentage}%`,
          color: 'text-warning-500'
        }
      ];
    } else {
      // Fallback if no data is available
      this.doctorStats = [
        {
          title: 'Patients Today',
          value: 8,
          icon: 'users',
          trend: 'up',
          trendValue: '12.5%',
          color: 'text-primary-500'
        },
        {
          title: 'Total Patients',
          value: 247,
          icon: 'user-check',
          trend: 'up',
          trendValue: '4.2%',
          color: 'text-secondary-500'
        },
        {
          title: 'Completed Appointments',
          value: 6,
          icon: 'check-circle',
          trend: 'stable',
          trendValue: '0%',
          color: 'text-success-500'
        },
        {
          title: 'Pending Reviews',
          value: 3,
          icon: 'clipboard',
          trend: 'down',
          trendValue: '25%',
          color: 'text-warning-500'
        }
      ];
    }
  }
  
  viewDetails(appointment: Appointment) {
    this.router.navigate(['/appointments'], { 
      queryParams: { id: appointment.id } 
    });
  }
  
  rescheduleAppointment(appointment: Appointment) {
    this.router.navigate(['/appointments/reschedule'], { 
      queryParams: { id: appointment.id } 
    });
  }
  
  cancelAppointment(appointmentId: number) {
    this.appointmentService.cancelAppointment(appointmentId).subscribe({
      next: () => {
        this.loadDashboardData(); // Refresh data after cancellation
      },
      error: (err) => {
        console.error('Error cancelling appointment', err);
        this.error = 'Failed to cancel appointment. Please try again.';
      }
    });
  }
  
  joinCall(appointment: Appointment) {
    this.router.navigate(['/video-call'], { 
      queryParams: { appointmentId: appointment.id } 
    });
  }
  
  openChat(chatId: number) {
    this.router.navigate(['/chat'], { 
      queryParams: { id: chatId } 
    });
  }
  
  getAppointmentForHour(hour: number): Appointment | null {
    const hourString = hour.toString().padStart(2, '0') + ':00';
    return this.todayAppointments.find(a => a.startTime.startsWith(hourString)) || null;
  }
  
  isPastHour(hour: number): boolean {
    return hour < this.currentHour;
  }
  
  isCurrentHour(hour: number): boolean {
    return hour === this.currentHour;
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
  
  formatTime(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    const minutes = time.split(':')[1];
    
    if (hour === 0) return `12:${minutes} AM`;
    if (hour < 12) return `${hour}:${minutes} AM`;
    if (hour === 12) return `12:${minutes} PM`;
    return `${hour-12}:${minutes} PM`;
  }
  
  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour-12} PM`;
  }
  
  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-success-100 text-success-800 border-success-200';
      case 'PENDING': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-danger-100 text-danger-800 border-danger-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}
