export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  nodes: Array<{
    type: string;
    data: Record<string, any>;
  }>;
  sessionId: string;
  timestamp: string;
} 