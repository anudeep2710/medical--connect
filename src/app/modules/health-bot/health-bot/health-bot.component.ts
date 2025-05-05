import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HealthBotService, ChatMessage, HealthRecommendation } from '../../../core/services/health-bot.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-health-bot',
  templateUrl: './health-bot.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, CardComponent, ModalComponent]
})
export class HealthBotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messageForm: FormGroup;
  messages: ChatMessage[] = [];

  isLoading = false;
  isSending = false;
  isAnalyzing = false;
  error = '';

  showShareModal = false;
  doctors: User[] = [];
  selectedDoctorId: number | null = null;
  isSharing = false;
  shareError = '';
  shareSuccess = '';

  healthRecommendation: HealthRecommendation | null = null;

  private scrollToBottom = true;

  constructor(
    private formBuilder: FormBuilder,
    private healthBotService: HealthBotService,
    private userService: UserService,
    private router: Router
  ) {
    this.messageForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    // Subscribe to conversation updates
    this.healthBotService.conversation$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom = true;
    });

    // Initialize conversation if empty
    if (this.messages.length === 0) {
      this.healthBotService.clearConversation();
    }

    // Load doctors for sharing
    this.loadDoctors();
  }

  ngAfterViewChecked() {
    if (this.scrollToBottom) {
      this.scrollToBottomOfChat();
      this.scrollToBottom = false;
    }
  }

  loadDoctors() {
    this.userService.getMyDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Error loading doctors', err);
      }
    });
  }

  sendMessage() {
    if (this.messageForm.invalid || this.isSending) {
      return;
    }

    const messageText = this.messageForm.get('message')?.value.trim();
    if (!messageText) return;

    this.isSending = true;
    this.error = '';

    this.healthBotService.sendMessage(messageText).subscribe({
      next: (response) => {
        this.healthBotService.addMessageToHistory(response);
        this.messageForm.reset();
        this.isSending = false;
        this.scrollToBottom = true;
      },
      error: (err) => {
        console.error('Error sending message', err);
        this.error = 'Failed to get a response. Please try again.';
        this.isSending = false;
      }
    });
  }

  clearConversation() {
    this.healthBotService.clearConversation();
    this.healthRecommendation = null;
  }

  analyzeSymptoms() {
    this.isAnalyzing = true;
    this.error = '';

    this.healthBotService.getHealthRecommendation().subscribe({
      next: (recommendation) => {
        this.healthRecommendation = recommendation;
        this.isAnalyzing = false;
        this.scrollToBottom = true;
      },
      error: (err) => {
        console.error('Error analyzing symptoms', err);
        this.error = 'Failed to analyze symptoms. Please try again.';
        this.isAnalyzing = false;
      }
    });
  }

  exportConversation() {
    const exportText = this.healthBotService.exportConversation();

    // Create a blob and download link
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthBot_Conversation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  openShareModal() {
    this.showShareModal = true;
    this.selectedDoctorId = null;
    this.shareError = '';
    this.shareSuccess = '';
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  shareWithDoctor() {
    if (!this.selectedDoctorId) {
      this.shareError = 'Please select a doctor';
      return;
    }

    this.isSharing = true;
    this.shareError = '';
    this.shareSuccess = '';

    this.healthBotService.shareWithDoctor(this.selectedDoctorId).subscribe({
      next: (result) => {
        if (result.success) {
          this.shareSuccess = 'Conversation shared successfully!';
          setTimeout(() => {
            this.closeShareModal();
          }, 2000);
        } else {
          this.shareError = 'Failed to share conversation.';
        }
        this.isSharing = false;
      },
      error: (err) => {
        console.error('Error sharing conversation', err);
        this.shareError = 'Failed to share conversation. Please try again.';
        this.isSharing = false;
      }
    });
  }

  bookAppointment() {
    this.router.navigate(['/appointments/book']);
  }

  private scrollToBottomOfChat(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'bg-danger-100 dark:bg-error-dark dark:bg-opacity-20 text-danger-800 dark:text-error-dark border-danger-200 dark:border-error-dark';
      case 'medium': return 'bg-warning-100 dark:bg-warning-dark dark:bg-opacity-20 text-warning-800 dark:text-warning-dark border-warning-200 dark:border-warning-dark';
      default: return 'bg-success-100 dark:bg-success-dark dark:bg-opacity-20 text-success-800 dark:text-success-dark border-success-200 dark:border-success-dark';
    }
  }

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'high': return 'High severity';
      case 'medium': return 'Medium severity';
      default: return 'Low severity';
    }
  }
}
