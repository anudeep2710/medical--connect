import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Doctor, TimeSlot, AppointmentType, AppointmentRequest } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, AvatarComponent]
})
export class BookAppointmentComponent implements OnInit {
  // Form and wizard state
  bookingForm: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  isReschedule = false;
  appointmentId?: number;
  
  // Data
  doctors: Doctor[] = [];
  availableTimeSlots: TimeSlot[] = [];
  selectedDoctor: Doctor | null = null;
  selectedDate: string = '';
  selectedTimeSlot: TimeSlot | null = null;
  currentUser: User | null = null;
  
  // UI state
  isLoading = false;
  isSubmitting = false;
  loadingTimeSlots = false;
  error: string | null = null;
  success: string | null = null;
  
  // Date selection
  today = new Date();
  maxDate = new Date(this.today.getFullYear(), this.today.getMonth() + 3, this.today.getDate());
  
  validationMessages = {
    doctorId: [
      { type: 'required', message: 'Please select a doctor' }
    ],
    date: [
      { type: 'required', message: 'Please select a date' },
      { type: 'min', message: 'Date cannot be in the past' },
      { type: 'max', message: 'Date cannot be more than 3 months in advance' }
    ],
    type: [
      { type: 'required', message: 'Please select an appointment type' }
    ],
    timeSlot: [
      { type: 'required', message: 'Please select a time slot' }
    ],
    reason: [
      { type: 'required', message: 'Please provide a reason for the appointment' },
      { type: 'minlength', message: 'Reason must be at least 10 characters long' }
    ]
  };
  
  constructor(
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookingForm = this.createForm();

    // Subscribe to form control changes for immediate validation
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control) {
        control.valueChanges.subscribe(() => {
          this.validateField(key);
        });
      }
    });
  }
  
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Check if this is a reschedule
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isReschedule = true;
        this.appointmentId = parseInt(params['id']);
        this.loadAppointmentToReschedule(this.appointmentId);
      } else if (params['date']) {
        this.selectedDate = params['date'];
        this.bookingForm.get('date')?.setValue(this.selectedDate);
      }
    });
    
    this.loadDoctors();
  }
  
  private createForm(): FormGroup {
    return this.formBuilder.group({
      doctorId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      timeSlot: ['', [Validators.required]],
      type: ['VIDEO_CALL', [Validators.required]],
      reasonForVisit: ['', [Validators.required, Validators.minLength(10)]],
      notes: ['', [Validators.maxLength(1000)]]
    });
  }
  
  loadAppointmentToReschedule(id: number) {
    this.isLoading = true;
    
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment) => {
        this.bookingForm.patchValue({
          doctorId: appointment.doctor.id,
          date: appointment.date,
          type: appointment.type,
          reasonForVisit: appointment.reasonForVisit || '',
          notes: appointment.notes || ''
        });
        
        this.selectedDoctor = appointment.doctor;
        this.selectedDate = appointment.date;
        
        this.loadTimeSlots();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointment', err);
        this.error = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  loadDoctors() {
    this.isLoading = true;
    
    this.appointmentService.getDoctors().pipe(
      catchError(error => {
        console.error('Error loading doctors', error);
        this.error = 'Failed to load doctors. Please try again.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(doctors => {
      this.doctors = doctors;
    });
  }
  
  loadTimeSlots() {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    const date = this.bookingForm.get('date')?.value;
    
    if (!doctorId || !date) {
      return;
    }
    
    this.loadingTimeSlots = true;
    this.bookingForm.get('timeSlot')?.setValue('');
    this.selectedTimeSlot = null;
    
    this.appointmentService.getAvailableTimeSlots(doctorId, date).pipe(
      catchError(error => {
        console.error('Error loading time slots', error);
        this.error = 'Failed to load available time slots. Please try again.';
        return of([]);
      }),
      finalize(() => {
        this.loadingTimeSlots = false;
      })
    ).subscribe(timeSlots => {
      this.availableTimeSlots = timeSlots;
    });
  }
  
  onDoctorChange() {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    this.selectedDoctor = this.doctors.find(d => d.id === parseInt(doctorId)) || null;
    
    if (this.selectedDate) {
      this.loadTimeSlots();
    }
  }
  
  onDateChange() {
    this.selectedDate = this.bookingForm.get('date')?.value;
    
    if (this.bookingForm.get('doctorId')?.value) {
      this.loadTimeSlots();
    }
  }
  
  selectTimeSlot(timeSlot: TimeSlot) {
    if (!timeSlot.isAvailable) {
      return;
    }
    
    this.selectedTimeSlot = timeSlot;
    this.bookingForm.get('timeSlot')?.setValue(`${timeSlot.startTime}-${timeSlot.endTime}`);
  }
  
  isTimeSlotSelected(timeSlot: TimeSlot): boolean {
    return this.selectedTimeSlot?.startTime === timeSlot.startTime && 
           this.selectedTimeSlot?.endTime === timeSlot.endTime;
  }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 1 && !this.validateStep1()) {
        return;
      }
      
      if (this.currentStep === 2 && !this.validateStep2()) {
        return;
      }
      
      this.currentStep++;
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  validateStep1(): boolean {
    return !!this.bookingForm.get('doctorId')?.valid;
  }
  
  validateStep2(): boolean {
    return !!this.bookingForm.get('date')?.valid && !!this.bookingForm.get('timeSlot')?.valid;
  }
  
  validateStep3(): boolean {
    return !!this.bookingForm.get('reasonForVisit')?.valid;
  }
  
  submitBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    this.success = null;
    
    const formValues = this.bookingForm.value;
    const [startTime, endTime] = formValues.timeSlot.split('-');
    
    const appointmentData: AppointmentRequest = {
      doctorId: parseInt(formValues.doctorId),
      date: formValues.date,
      startTime: startTime,
      endTime: endTime,
      type: formValues.type as AppointmentType,
      reasonForVisit: formValues.reasonForVisit,
      notes: formValues.notes
    };
    
    let appointmentOperation: Observable<any>;
    
    if (this.isReschedule && this.appointmentId) {
      appointmentOperation = this.appointmentService.updateAppointment(this.appointmentId, appointmentData);
    } else {
      appointmentOperation = this.appointmentService.createAppointment(appointmentData);
    }
    
    appointmentOperation.subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.success = this.isReschedule ? 
          'Your appointment has been successfully rescheduled!' : 
          'Your appointment has been successfully booked!';
          
        // Navigate to appointments list after a delay
        setTimeout(() => {
          this.router.navigate(['/appointments']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error booking appointment', err);
        this.error = this.isReschedule ? 
          'Failed to reschedule appointment. Please try again.' : 
          'Failed to book appointment. Please try again.';
      }
    });
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  formatTime(time: string): string {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }
  
  getAppointmentTypeLabel(type: string): string {
    return type === 'VIDEO_CALL' ? 'Video Call' : 'In Person';
  }
  
  cancel() {
    this.router.navigate(['/appointments']);
  }

  validateField(fieldName: string): boolean {
    const control = this.bookingForm.get(fieldName);
    if (!control) return false;

    if (control.invalid && (control.dirty || control.touched)) {
      return false;
    }
    return true;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bookingForm.get(fieldName);
    if (!control) return '';

    const messages = this.validationMessages[fieldName as keyof typeof this.validationMessages];
    if (!messages) return '';

    for (const message of messages) {
      if (control.hasError(message.type)) {
        return message.message;
      }
    }
    return '';
  }
}
