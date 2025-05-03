export interface ChatUser {
  id: number;
  fullName: string;
  avatar?: string;
  role: 'PATIENT' | 'DOCTOR';
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: number;
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
}