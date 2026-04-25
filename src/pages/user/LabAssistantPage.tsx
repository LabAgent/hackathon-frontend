import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Send, FlaskConical, Package, Database, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui';
import { useAgentChat } from '@/hooks/useAgentChat';
import { chatApi } from '@/api';
import type { AgentConversation, ProgressEvent } from '@/types';

const AGENT_ICONS: Record<string, any> = {
  planner: Bot,
  research: FlaskConical,
  inventory: Package,
  database: Database,
};

const AGENT_COLORS: Record<string, string> = {
  planner: 'bg-ocean-100 text-ocean-600',
  research: 'bg-purple-100 text-purple-600',
  inventory: 'bg-sandy-100 text-sandy-600',
  database: 'bg-kelp-100 text-kelp-600',
};

function AgentBadge({ agent }: { agent: string }) {
  const Icon = AGENT_ICONS[agent] || Bot;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${AGENT_COLORS[agent] || 'bg-gray-100 text-gray-600'}`}>
      <Icon className="h-3 w-3" />
      {agent}
    </span>
  );
}

function ThinkingBlock({ events, reasoning }: { events: ProgressEvent[]; reasoning: string }) {
  const [expanded, setExpanded] = useState(true);
  if (!reasoning && events.length === 0) return null;

  return (
    <div className="mb-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm text-purple-500 hover:text-purple-600 mb-2">
        <Sparkles className="h-4 w-4" />
        <span>Agent Reasoning</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
          {reasoning && <p className="text-purple-700 text-xs italic">{reasoning}<span className="animate-pulse">|</span></p>}
          {events.filter(e => e.type === 'tool_call' || e.type === 'tool_result' || e.type === 'route').map((e, i) => (
            <div key={i} className="text-xs">
              {e.type === 'route' && (
                <p className="text-ocean-600">Routing to <strong>{(e as any).to}</strong>: {(e as any).task}</p>
              )}
              {e.type === 'tool_call' && (
                <p className="text-blue-600">Calling: {(e as any).tool}({JSON.stringify((e as any).args || {}).substring(0, 80)})</p>
              )}
              {e.type === 'tool_result' && (
                <p className="text-kelp-600">Done: {(e as any).tool}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LabAssistantPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string; agent?: string }[]>([]);
  const [convId, setConvId] = useState<string | undefined>();
  const { events, reasoning, content, isStreaming, activeAgent, error, sendMessage, reset, returnedConversationId } = useAgentChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef(false);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content, messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    wasStreamingRef.current = true;
    await sendMessage(msg, convId);
    refetchConversations();
  };

  useEffect(() => {
    if (returnedConversationId && !convId) {
      setConvId(returnedConversationId);
    }
  }, [returnedConversationId]);

  useEffect(() => {
    if (wasStreamingRef.current && !isStreaming && content) {
      wasStreamingRef.current = false;
      setMessages(prev => [...prev, { role: 'assistant', content, agent: activeAgent || 'planner' }]);
    }
  }, [isStreaming, content, activeAgent]);

  const handleSelectConversation = async (id: string) => {
    setConvId(id);
    reset();
    setMessages([]);
    try {
      const res = await chatApi.getConversation(id);
      const conv = res?.data ?? res;
      if (conv?.messages && conv.messages.length > 0) {
        setMessages(
          conv.messages.map((m: any) => ({
            role: m.role,
            content: m.content || '',
            agent: m.agentName || 'planner',
          }))
        );
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to load conversation:', e);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <div className="w-64 shrink-0 space-y-2 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">Conversations</h3>
        <button
          onClick={() => { setConvId(undefined); setMessages([]); reset(); }}
          className="w-full text-left px-3 py-2 rounded-lg bg-ocean-50 text-ocean-600 text-sm font-medium hover:bg-ocean-100 transition-colors"
        >
          + New Chat
        </button>
        {(conversations ?? []).map((c: AgentConversation) => (
          <button
            key={c.id}
            onClick={() => handleSelectConversation(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${convId === c.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {c.title || 'Untitled'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Bot className="h-5 w-5 text-ocean-500" />
            <h2 className="font-semibold text-gray-900">Sandy's AI Lab Assistant</h2>
            {activeAgent && <AgentBadge agent={activeAgent} />}
            {isStreaming && <Loader2 className="h-4 w-4 animate-spin text-ocean-500 ml-auto" />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-ocean-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700">How can I help you today?</h3>
                <p className="text-gray-400 text-sm mt-1">I can search the web, manage inventory, run experiments, and more.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['Search for kelp growth studies', 'Check low stock items', 'Show all research projects'].map(s => (
                    <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 rounded-full bg-ocean-50 text-ocean-600 hover:bg-ocean-100 transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role !== 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${AGENT_COLORS[msg.agent || 'planner'] || 'bg-ocean-100 text-ocean-600'}`}>
                    {(() => { const Ic = AGENT_ICONS[msg.agent || 'planner'] || Bot; return <Ic className="h-4 w-4" />; })()}
                  </div>
                )}
                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-ocean-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeAgent ? AGENT_COLORS[activeAgent] : 'bg-ocean-100 text-ocean-600'}`}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="max-w-[70%]">
                  <ThinkingBlock events={events} reasoning={reasoning} />
                  {content && (
                    <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-800">
                      <p className="whitespace-pre-wrap">{content}<span className="animate-pulse">|</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-coral-50 text-coral-600 rounded-lg px-4 py-2 text-sm">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                placeholder="Ask Sandy's Lab Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
