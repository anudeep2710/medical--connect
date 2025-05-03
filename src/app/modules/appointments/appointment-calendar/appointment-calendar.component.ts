import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { DynamicFeatherDirective } from '../../../shared/directives/dynamic-feather.directive';
import { CardComponent } from '../../../shared/components/card/card.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonComponent, 
    FeatherDirective, 
    DynamicFeatherDirective,
    CardComponent, 
    AvatarComponent
  ]
})
export class AppointmentCalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth: number;
  currentYear: number;
  calendarDays: CalendarDay[] = [];
  
  appointments: Appointment[] = [];
  selectedDate: Date | null = null;
  dayAppointments: Appointment[] = [];
  
  isLoading = true;
  error = '';
  
  weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }
  
  ngOnInit() {
    this.loadAppointments();
  }
  
  loadAppointments() {
    this.isLoading = true;
    
    // Get the first and last day of the displayed month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Format dates for API
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];
    
    this.appointmentService.getAppointments(undefined, undefined, startDate, endDate)
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.generateCalendar();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading appointments', err);
          this.error = 'Failed to load appointments. Please try again.';
          this.isLoading = false;
          this.generateCalendar(); // Generate calendar even if appointments fail to load
        }
      });
  }
  
  generateCalendar() {
    this.calendarDays = [];
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(this.currentYear, this.currentMonth, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();
    
    // Add days from previous month to fill the calendar
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, daysInPrevMonth - i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        appointments: this.getAppointmentsForDate(date)
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        appointments: this.getAppointmentsForDate(date)
      });
    }
    
    // Add days from next month to complete the calendar grid (6 rows of 7 days)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        appointments: this.getAppointmentsForDate(date)
      });
    }
  }
  
  getAppointmentsForDate(date: Date): Appointment[] {
    const dateString = date.toISOString().split('T')[0];
    return this.appointments.filter(a => a.date === dateString);
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadAppointments();
  }
  
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadAppointments();
  }
  
  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.loadAppointments();
  }
  
  selectDate(day: CalendarDay) {
    this.selectedDate = day.date;
    this.dayAppointments = day.appointments;
  }
  
  viewAppointmentDetails(appointment: Appointment) {
    this.router.navigate(['/appointments'], { 
      queryParams: { id: appointment.id } 
    });
  }
  
  bookAppointment() {
    if (this.selectedDate) {
      const dateString = this.selectedDate.toISOString().split('T')[0];
      this.router.navigate(['/appointments/book'], { 
        queryParams: { date: dateString } 
      });
    } else {
      this.router.navigate(['/appointments/book']);
    }
  }
  
  navigateToList() {
    this.router.navigate(['/appointments']);
  }
  
  formatTime(time: string): string {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }
  
  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-success-500';
      case 'PENDING': return 'bg-warning-500';
      case 'COMPLETED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-danger-500';
      default: return 'bg-gray-500';
    }
  }
  
  getCardTitle(): string {
    if (this.selectedDate) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      return this.selectedDate.toLocaleDateString('en-US', options as Intl.DateTimeFormatOptions);
    }
    return 'Select a date';
  }
}
