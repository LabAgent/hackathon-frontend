import apiClient from './client';
import type { AgentConversation } from '@/types';

export const chatApi = {
  getConversations: () => apiClient.get<AgentConversation[]>('/chat'),

  getConversation: (id: string) => apiClient.get<AgentConversation>(`/chat/${id}`),

  createAndStream: (content: string, conversationId?: string) => {
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.accessToken || '';
    const url = `${API_BASE_URL}/api/chat/stream`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, conversationId }),
    });
  },
};
