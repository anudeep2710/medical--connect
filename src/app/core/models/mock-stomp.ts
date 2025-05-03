// Mock implementation for StompJS
import { SockJS } from './mock-sockjs';

export interface Frame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

export interface StompConfig {
  connectHeaders?: Record<string, string>;
  disconnectHeaders?: Record<string, string>;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  reconnectDelay?: number;
  webSocketFactory?: () => WebSocket;
}

export interface StompSubscription {
  id: string;
  unsubscribe: () => void;
}

export class Client {
  private connected = false;
  private subscriptions: Record<string, ((message: Frame) => void)> = {};
  private subscriptionId = 0;
  private sockInstance: SockJS | null = null;
  
  brokerURL?: string;
  stompVersions = ['1.2'];
  webSocketFactory?: () => WebSocket;
  
  onConnect?: (frame: Frame) => void;
  onDisconnect?: (frame: Frame) => void;
  onStompError?: (frame: Frame) => void;
  onWebSocketClose?: () => void;
  onWebSocketError?: (error: Event) => void;

  configure(config: any) {}

  activate() {}

  disconnect() {}

  send(destination: string, headers: any, body: string) {}

  subscribe(destination: string, callback: any) {}

  publish(parameters: { destination: string, body: string, headers?: Record<string, string> }) {
    console.log('Mock STOMP publish:', parameters);
    
    // In a real implementation, this would send data to the server
    // Here we're just echoing back the message for testing purposes
    setTimeout(() => {
      // Find subscriptions for this destination and call their callbacks
      Object.entries(this.subscriptions).forEach(([id, callback]) => {
        callback({
          command: 'MESSAGE',
          headers: { 
            destination: parameters.destination,
            'message-id': `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            subscription: id
          },
          body: parameters.body
        });
      });
    }, 100);
  }
}