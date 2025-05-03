import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Chat } from '../../../core/models/chat.model';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FeatherDirective } from '../../../shared/directives/feather.directive';
import { ChatConversationComponent } from '../chat-conversation/chat-conversation.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  standalone: true,
  imports: [CommonModule, FeatherDirective, ChatConversationComponent, ButtonComponent, AvatarComponent, RouterModule]
})
export class ChatListComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  currentUser: User | null = null;
  selectedChat: Chat | null = null;
  
  isLoading = true;
  error = '';
  
  private messageSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;
  
  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to websocket messages
    if (this.currentUser) {
      this.chatService.connect(this.currentUser.id);
      
      this.messageSubscription = this.chatService.messages$.subscribe(message => {
        // When a new message arrives, reload chats to update the last message and unread count
        this.loadChats();
      });
      
      this.connectionSubscription = this.chatService.connectionStatus$.subscribe(isConnected => {
        console.log('WebSocket connection status:', isConnected);
      });
    }
    
    // Check for chat id in query params
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.openChat(parseInt(params['id']));
      }
    });
    
    this.loadChats();
  }
  
  ngOnDestroy() {
    // Unsubscribe from WebSocket subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    
    // Disconnect from WebSocket
    this.chatService.disconnect();
  }
  
  loadChats() {
    this.isLoading = true;
    
    this.chatService.getChats().subscribe({
      next: (chats) => {
        this.chats = chats;
        
        // If there's a selected chat, update it with the latest data
        if (this.selectedChat) {
          const updatedChat = chats.find(c => c.id === this.selectedChat?.id);
          if (updatedChat) {
            this.selectedChat = updatedChat;
          }
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading chats', err);
        this.error = 'Failed to load conversations. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  openChat(chatId: number) {
    // Find the chat in the existing list
    const chat = this.chats.find(c => c.id === chatId);
    
    if (chat) {
      this.selectedChat = chat;
      
      // Mark messages as read
      if (chat.unreadCount > 0) {
        this.chatService.markAsRead(chatId).subscribe(() => {
          chat.unreadCount = 0;
        });
      }
    } else {
      // If the chat isn't in the list, fetch it
      this.chatService.getChatWithUser(chatId).subscribe({
        next: (chat) => {
          this.selectedChat = chat;
          this.loadChats(); // Reload the chat list to include this chat
        },
        error: (err) => {
          console.error('Error loading chat', err);
          this.error = 'Failed to load conversation. Please try again.';
        }
      });
    }
  }
  
  closeChat() {
    this.selectedChat = null;
  }
  
  getChatParticipant(chat: Chat): any {
    // In a 1:1 chat, get the other participant (not the current user)
    if (!this.currentUser) return null;
    
    return chat.participants.find(p => p.id !== this.currentUser?.id) || null;
  }
  
  getLastMessageTime(chat: Chat): string {
    if (!chat.lastMessage) return '';
    
    const messageDate = new Date(chat.lastMessage.createdAt);
    const today = new Date();
    
    // If the message is from today, show the time
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from this week, show the day name
    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show the date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  trackByFn(index: number, item: Chat) {
    return item.id;
  }
}
