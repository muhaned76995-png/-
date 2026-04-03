export interface ChatMessage {
  id?: string;
  senderName: string;
  text: string;
  timestamp: any;
  isAdmin: boolean;
  uid: string;
}

export interface Comment {
  id?: string;
  userName: string;
  text: string;
  timestamp: any;
}

export interface AdminStatus {
  lastSeen: any;
  isOnline: boolean;
}

export interface SiteStats {
  visitorCount: number;
  commentCount: number;
  projectCount: number;
}

export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light';
