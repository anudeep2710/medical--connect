import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { Chat, Message } from '../../../core/models/chat.model';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FeatherDirective, AvatarComponent]
})
export class ChatConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() chat!: Chat;
  @Input() currentUser: User | null = null;
  @Output() closeChatEvent = new EventEmitter<void>();
  
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
  messages: Message[] = [];
  messageForm: FormGroup;
  isLoading = true;
  isSending = false;
  error = '';
  page = 0;
  
  private messageSubscription: Subscription | null = null;
  private scrollToBottom = true;
  
  constructor(
    private chatService: ChatService,
    private formBuilder: FormBuilder
  ) {
    this.messageForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }
  
  ngOnInit() {
    // Load chat messages
    this.loadMessages();
    
    // Subscribe to new messages
    this.messageSubscription = this.chatService.messages$.subscribe(message => {
      if (message.chatId === this.chat.id) {
        this.messages.push(message);
        this.scrollToBottom = true;
      }
    });
  }
  
  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
  
  ngAfterViewChecked() {
    if (this.scrollToBottom) {
      this.scrollToBottomOfChat();
      this.scrollToBottom = false;
    }
  }
  
  loadMessages() {
    this.isLoading = true;
    
    this.chatService.getMessages(this.chat.id, this.page).subscribe({
      next: (messages) => {
        this.messages = messages.reverse(); // Reverse to show newest at the bottom
        this.isLoading = false;
        
        // Scroll to bottom on initial load
        this.scrollToBottom = true;
      },
      error: (err) => {
        console.error('Error loading messages', err);
        this.error = 'Failed to load messages. Please try again.';
        this.isLoading = false;
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
    
    this.chatService.sendMessage(this.chat.id, messageText).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageForm.reset();
        this.isSending = false;
        this.scrollToBottom = true;
      },
      error: (err) => {
        console.error('Error sending message', err);
        this.error = 'Failed to send message. Please try again.';
        this.isSending = false;
      }
    });
  }
  
  closeChat() {
    this.closeChatEvent.emit();
  }
  
  getChatParticipant(): any {
    // In a 1:1 chat, get the other participant (not the current user)
    if (!this.currentUser) return null;
    
    return this.chat.participants.find(p => p.id !== this.currentUser?.id) || null;
  }
  
  isCurrentUserMessage(message: Message): boolean {
    return message.senderId === this.currentUser?.id;
  }
  
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  formatMessageDate(timestamp: string): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }
  
  shouldShowMessageDate(index: number): boolean {
    if (index === 0) return true;
    
    const currentDate = new Date(this.messages[index].createdAt).toDateString();
    const previousDate = new Date(this.messages[index - 1].createdAt).toDateString();
    
    return currentDate !== previousDate;
  }
  
  private scrollToBottomOfChat(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }
}
