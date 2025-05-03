import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface HealthRecommendation {
  severity: 'low' | 'medium' | 'high';
  conditions: { name: string; confidence: number }[];
  advice: string;
  seekMedicalAttention: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HealthBotService {
  private apiUrl = `${environment.apiUrl}/api/health-bot`;
  private conversationHistory = new BehaviorSubject<ChatMessage[]>([]);
  
  public conversation$ = this.conversationHistory.asObservable();
  
  constructor(private http: HttpClient) {
    // Load conversation history from localStorage
    const savedHistory = localStorage.getItem('health-bot-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as ChatMessage[];
        this.conversationHistory.next(history);
      } catch (e) {
        localStorage.removeItem('health-bot-history');
      }
    }
  }

  // Send message to health bot
  sendMessage(message: string): Observable<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    this.addMessageToHistory(userMessage);
    
    // Get current conversation context
    const history = this.conversationHistory.value;
    
    // Send to backend
    return this.http.post<ChatMessage>(`${this.apiUrl}/message`, {
      message,
      history: history.slice(-10) // Send last 10 messages for context
    });
  }

  // Add message to conversation history
  addMessageToHistory(message: ChatMessage): void {
    const currentHistory = this.conversationHistory.value;
    const newHistory = [...currentHistory, message];
    
    this.conversationHistory.next(newHistory);
    localStorage.setItem('health-bot-history', JSON.stringify(newHistory));
  }

  // Clear conversation history
  clearConversation(): void {
    this.conversationHistory.next([]);
    localStorage.removeItem('health-bot-history');
    
    // Add initial system message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Hello, I\'m your HealthConnect Assistant. I can help you understand your symptoms, but please remember I\'m not a replacement for professional medical advice. How can I help you today?',
      timestamp: new Date()
    };
    
    this.addMessageToHistory(welcomeMessage);
  }

  // Get health recommendations based on analysis
  getHealthRecommendation(): Observable<HealthRecommendation> {
    return this.http.post<HealthRecommendation>(`${this.apiUrl}/analyze`, {
      conversation: this.conversationHistory.value
    });
  }

  // Export conversation history
  exportConversation(): string {
    const history = this.conversationHistory.value;
    let exportText = 'HealthConnect Bot Conversation\n\n';
    
    history.forEach(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? 'You' : 'HealthBot';
      exportText += `[${timestamp}] ${role}: ${msg.content}\n\n`;
    });
    
    return exportText;
  }

  // Share conversation with a doctor
  shareWithDoctor(doctorId: number): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.apiUrl}/share/${doctorId}`, {
      conversation: this.conversationHistory.value
    });
  }
}
