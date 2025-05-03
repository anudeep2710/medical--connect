import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoCallService, CallParticipant } from '../../../core/services/video-call.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { User } from '../../../core/models/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, FeatherDirective, ButtonComponent]
})
export class VideoCallComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  
  currentUser: User | null = null;
  appointmentId: number | null = null;
  appointment: Appointment | null = null;
  
  participants: CallParticipant[] = [];
  
  // Call controls
  isAudioEnabled = true;
  isVideoEnabled = true;
  isScreenSharing = false;
  
  // Recording
  isRecording = false;
  recordingId = '';
  recordingUrl = '';
  
  // Call state
  callState: 'connecting' | 'connected' | 'ended' | 'failed' = 'connecting';
  callDuration = 0;
  callTimer: any = null;
  
  // Notes
  notesForm: FormGroup;
  showPostCallNotes = false;
  isSubmittingNotes = false;
  notesSaved = false;
  
  // UI state
  isLoading = true;
  error = '';
  
  private participantsSubscription: Subscription | null = null;
  
  constructor(
    private videoCallService: VideoCallService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.notesForm = this.formBuilder.group({
      notes: ['']
    });
  }
  
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Get appointment ID from query params
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        this.appointmentId = parseInt(params['appointmentId']);
        this.loadAppointmentDetails();
      } else {
        this.error = 'No appointment selected. Please book an appointment for a video call.';
        this.callState = 'failed';
      }
    });
    
    // Subscribe to participants changes
    this.participantsSubscription = this.videoCallService.participants$.subscribe(participants => {
      this.participants = participants;
      
      // If we have remote participants, the call is connected
      if (participants.length > 1 && this.callState === 'connecting') {
        this.callState = 'connected';
        this.startCallTimer();
      }
    });
  }
  
  ngAfterViewInit() {
    // Initialize WebRTC after view initialization
    if (this.appointmentId) {
      this.initializeCall();
    }
  }
  
  ngOnDestroy() {
    this.endCall();
    
    if (this.participantsSubscription) {
      this.participantsSubscription.unsubscribe();
    }
    
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
  }
  
  loadAppointmentDetails() {
    if (!this.appointmentId) return;
    
    this.videoCallService.getAppointmentForCall(this.appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointment details', err);
        this.error = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
        this.callState = 'failed';
      }
    });
  }
  
  async initializeCall() {
    try {
      // Connect to WebSocket signaling server
      if (this.currentUser) {
        this.videoCallService.connect(this.currentUser.id);
      }
      
      // Start local stream
      await this.videoCallService.startLocalStream(true, true);
      
      // If we're a patient, call the doctor
      if (this.currentUser?.role === 'PATIENT' && this.appointment?.doctor) {
        this.videoCallService.callUser(this.appointment.doctor.id);
      }
      
      // If we're a doctor, call the patient
      if (this.currentUser?.role === 'DOCTOR' && this.appointment?.patient) {
        this.videoCallService.callUser(this.appointment.patient.id);
      }
    } catch (err) {
      console.error('Error initializing call', err);
      this.error = 'Failed to initialize call. Please check your camera and microphone permissions.';
      this.callState = 'failed';
    }
  }
  
  toggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.videoCallService.toggleAudio(this.isAudioEnabled);
  }
  
  toggleVideo() {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.videoCallService.toggleVideo(this.isVideoEnabled);
  }
  
  async toggleScreenSharing() {
    try {
      if (!this.isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Get the local participant
        const localParticipant = this.participants.find(p => p.id === this.currentUser?.id);
        
        if (localParticipant && localParticipant.stream) {
          // Replace the video track with screen sharing track
          const videoTrack = localParticipant.stream.getVideoTracks()[0];
          if (videoTrack) {
            const screenTrack = screenStream.getVideoTracks()[0];
            
            // When screen sharing stops
            screenTrack.onended = () => {
              this.isScreenSharing = false;
              this.toggleScreenSharing();
            };
            
            // Replace the track in all peer connections
            for (const participant of this.participants) {
              if (participant.id !== this.currentUser?.id) {
                this.videoCallService.replaceTrack(participant.id, videoTrack, screenTrack);
              }
            }
            
            this.isScreenSharing = true;
          }
        }
      } else {
        // Stop screen sharing and restart video
        this.videoCallService.stopScreenSharing();
        this.isScreenSharing = false;
      }
    } catch (err) {
      console.error('Error toggling screen sharing', err);
    }
  }
  
  startRecording() {
    if (!this.appointmentId) return;
    
    this.videoCallService.startRecording(this.appointmentId).subscribe({
      next: (response) => {
        this.isRecording = true;
        this.recordingId = response.recordingId;
      },
      error: (err) => {
        console.error('Error starting recording', err);
      }
    });
  }
  
  stopRecording() {
    if (!this.appointmentId || !this.recordingId) return;
    
    this.videoCallService.stopRecording(this.appointmentId, this.recordingId).subscribe({
      next: (response) => {
        this.isRecording = false;
        this.recordingUrl = response.recordingUrl;
      },
      error: (err) => {
        console.error('Error stopping recording', err);
        this.isRecording = false;
      }
    });
  }
  
  endCall() {
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording();
    }
    
    // End WebRTC call
    this.videoCallService.leaveCall();
    
    // Stop call timer
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
    
    // Update call state
    this.callState = 'ended';
    
    // Show post-call notes form if the call was connected
    if (this.callDuration > 0) {
      this.showPostCallNotes = true;
    } else {
      this.navigateBack();
    }
  }
  
  submitNotes() {
    if (!this.appointmentId) return;
    
    const notes = this.notesForm.get('notes')?.value;
    if (!notes) {
      this.navigateBack();
      return;
    }
    
    this.isSubmittingNotes = true;
    
    this.appointmentService.updateAppointment(this.appointmentId, {
      notes: notes,
      status: 'COMPLETED'
    }).subscribe({
      next: () => {
        this.notesSaved = true;
        this.isSubmittingNotes = false;
        
        // Navigate back after brief delay
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving notes', err);
        this.isSubmittingNotes = false;
        
        // Navigate back despite error
        this.navigateBack();
      }
    });
  }
  
  navigateBack() {
    const isDoctorView = this.currentUser?.role === 'DOCTOR';
    
    if (isDoctorView) {
      this.router.navigate(['/doctor/dashboard']);
    } else {
      this.router.navigate(['/appointments']);
    }
  }
  
  private startCallTimer() {
    this.callTimer = setInterval(() => {
      this.callDuration++;
    }, 1000);
  }
  
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  getOtherParticipant(): CallParticipant | null {
    if (!this.currentUser) return null;
    
    return this.participants.find(p => p.id !== this.currentUser?.id) || null;
  }
  
  getLocalParticipant(): CallParticipant | null {
    if (!this.currentUser) return null;
    
    return this.participants.find(p => p.id === this.currentUser?.id) || null;
  }
}
