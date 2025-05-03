// Mock implementation for SockJS-client
export class SockJS {
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 0; // CONNECTING

  constructor(url: string) {
    this.url = url;
    // Simulate connection after short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen();
      }
    }, 100);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose();
    }
  }

  send(data: string) {
    console.log('Mock SockJS send:', data);
    // In a real implementation, this would send data to the server
  }
}

export const OPEN = 1;
export const CLOSED = 3;