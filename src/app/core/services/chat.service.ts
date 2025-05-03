import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Chat, Message } from '../models/chat.model';
import { SockJS } from '../models/mock-sockjs';
import { Client as StompClient } from '../models/mock-stomp';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chats`;
  private stompClient: any;
  private messageSubject = new Subject<Message>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  public messages$ = this.messageSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  constructor(private http: HttpClient) {}

  // Connect to WebSocket
  connect(userId: number): void {
    const socket = new SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = new StompClient();
    
    this.stompClient.onConnect = () => {
      this.connectionStatusSubject.next(true);
      
      // Subscribe to personal channel
      this.stompClient.subscribe(`/user/${userId}/queue/messages`, (message: any) => {
        const newMessage = JSON.parse(message.body) as Message;
        this.messageSubject.next(newMessage);
      });
    };
    
    this.stompClient.onWebSocketClose = () => {
      this.connectionStatusSubject.next(false);
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        this.connect(userId);
      }, 5000);
    };
    
    this.stompClient.activate();
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connectionStatusSubject.next(false);
    }
  }

  // Send a message
  sendMessage(chatId: number, text: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${chatId}/messages`, { text });
  }

  // Get chat list
  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.apiUrl);
  }

  // Get or create chat with a user
  getChatWithUser(userId: number): Observable<Chat> {
    return this.http.post<Chat>(`${this.apiUrl}/with-user/${userId}`, {});
  }

  // Get messages for a chat
  getMessages(chatId: number, page: number = 0, size: number = 20): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${chatId}/messages`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Mark messages as read
  markAsRead(chatId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${chatId}/read`, {});
  }
}
