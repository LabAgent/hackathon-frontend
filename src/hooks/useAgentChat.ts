import { useState, useCallback } from 'react';
import { chatApi } from '@/api/chat.api';
import type { ProgressEvent } from '@/types';

interface UseAgentChatReturn {
  events: ProgressEvent[];
  reasoning: string;
  content: string;
  isStreaming: boolean;
  activeAgent: string | null;
  error: string | null;
  returnedConversationId: string | null;
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  reset: () => void;
}

export function useAgentChat(): UseAgentChatReturn {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnedConversationId, setReturnedConversationId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setEvents([]);
    setReasoning('');
    setContent('');
    setIsStreaming(false);
    setActiveAgent(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    reset();
    setIsStreaming(true);
    setReturnedConversationId(null);

    try {
      const response = await chatApi.createAndStream(message, conversationId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const event: ProgressEvent = JSON.parse(data);

              if (event.type === 'conversation_id') {
                setReturnedConversationId((event as any).conversationId);
                console.log('Received conversation_id:', (event as any).conversationId);
                continue;
              }

              setEvents(prev => [...prev, event]);

              if (event.type === 'reasoning') {
                setReasoning(prev => prev + (event as any).chunk);
                setActiveAgent((event as any).agent);
              }
              if (event.type === 'content') {
                setContent(prev => prev + (event as any).chunk);
                setActiveAgent((event as any).agent);
              }
              if (event.type === 'agent_start' || event.type === 'route') {
                setActiveAgent((event as any).agent || (event as any).to);
              }
              if (event.type === 'complete' || event.type === 'error') {
                setIsStreaming(false);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, [reset]);

  return { events, reasoning, content, isStreaming, activeAgent, error, returnedConversationId, sendMessage, reset };
}
