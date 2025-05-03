import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment, AppointmentStatus, AppointmentType } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { DynamicFeatherDirective } from '../../../shared/directives/dynamic-feather.directive';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-appointments-list',
  templateUrl: './appointments-list.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonComponent, 
    AvatarComponent, 
    ModalComponent, 
    FeatherDirective, 
    DynamicFeatherDirective,
    CardComponent
  ]
})
export class AppointmentsListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  currentUser: User | null = null;
  
  isLoading = true;
  error = '';
  
  // Filters
  activeTab: 'upcoming' | 'past' | 'all' = 'upcoming';
  statusFilter: AppointmentStatus | 'ALL' = 'ALL';
  typeFilter: AppointmentType | 'ALL' = 'ALL';
  
  // Detail view
  selectedAppointment: Appointment | null = null;
  showDetailsModal = false;
  showCancelModal = false;
  
  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Check for appointment id in query params
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.loadAppointmentDetails(parseInt(params['id']));
      }
    });
    
    this.loadAppointments();
  }
  
  loadAppointments() {
    this.isLoading = true;
    
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments', err);
        this.error = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  loadAppointmentDetails(id: number) {
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment) => {
        this.selectedAppointment = appointment;
        this.showDetailsModal = true;
      },
      error: (err) => {
        console.error('Error loading appointment details', err);
        this.error = 'Failed to load appointment details. Please try again.';
      }
    });
  }
  
  setActiveTab(tab: 'upcoming' | 'past' | 'all') {
    this.activeTab = tab;
    this.applyFilters();
  }
  
  setStatusFilter(status: AppointmentStatus | 'ALL') {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  setTypeFilter(type: AppointmentType | 'ALL') {
    this.typeFilter = type;
    this.applyFilters();
  }
  
  applyFilters() {
    let filtered = [...this.appointments];
    
    // Apply tab filter
    if (this.activeTab === 'upcoming') {
      filtered = filtered.filter(a => 
        a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && 
        new Date(a.date + 'T' + a.endTime) >= new Date()
      );
    } else if (this.activeTab === 'past') {
      filtered = filtered.filter(a => 
        a.status === 'COMPLETED' || a.status === 'CANCELLED' || 
        new Date(a.date + 'T' + a.endTime) < new Date()
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }
    
    // Apply type filter
    if (this.typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.type === this.typeFilter);
    }
    
    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.startTime);
      const dateB = new Date(b.date + 'T' + b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
    
    this.filteredAppointments = filtered;
  }
  
  viewDetails(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
    
    // Remove id from URL if present
    if (this.route.snapshot.queryParams['id']) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: null },
        queryParamsHandling: 'merge'
      });
    }
  }
  
  bookAppointment() {
    this.router.navigate(['/appointments/book']);
  }
  
  navigateToCalendar() {
    this.router.navigate(['/appointments/calendar']);
  }
  
  rescheduleAppointment(appointment: Appointment) {
    this.router.navigate(['/appointments/reschedule'], { 
      queryParams: { id: appointment.id } 
    });
  }
  
  showCancelConfirmation(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showCancelModal = true;
  }
  
  closeCancelModal() {
    this.showCancelModal = false;
  }
  
  cancelAppointment() {
    if (!this.selectedAppointment) return;
    
    this.appointmentService.cancelAppointment(this.selectedAppointment.id).subscribe({
      next: () => {
        this.closeCancelModal();
        this.closeDetailsModal();
        this.loadAppointments(); // Refresh the list
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
  
  isPastAppointment(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.date + 'T' + appointment.endTime);
    return appointmentDate < new Date();
  }
  
  isUpcomingAppointment(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.date + 'T' + appointment.startTime);
    return appointmentDate > new Date();
  }
  
  isCurrentAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const startTime = new Date(appointment.date + 'T' + appointment.startTime);
    const endTime = new Date(appointment.date + 'T' + appointment.endTime);
    return now >= startTime && now <= endTime;
  }
  
  getAppointmentStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-success-100 text-success-800';
      case 'PENDING': return 'bg-warning-100 text-warning-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-danger-100 text-danger-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getAppointmentTypeClass(type: string): string {
    switch (type) {
      case 'VIDEO_CALL': return 'bg-primary-100 text-primary-800';
      case 'IN_PERSON': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getFormattedDateTime(date: string, time: string): string {
    const dt = new Date(date + 'T' + time);
    return dt.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  formatTime(time: string): string {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }
}
