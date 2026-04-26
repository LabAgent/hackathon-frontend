import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, Sparkles, ChevronDown, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui';
import { useAgentChat } from '@/hooks/useAgentChat';
import { chatApi } from '@/api';
import type { AgentConversation, ProgressEvent } from '@/types';

const AGENT_ICONS: Record<string, string> = {
  planner: '🧠',
  research: '🔬',
  inventory: '📦',
  database: '💾',
};

const AGENT_COLORS: Record<string, string> = {
  planner: 'bg-gary-100 text-gary-600',
  research: 'bg-gary-100 text-gary-600',
  inventory: 'bg-sponge-100 text-sponge-700',
  database: 'bg-kelp-100 text-kelp-600',
};

function AgentBadge({ agent }: { agent: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${AGENT_COLORS[agent] || 'bg-ocean-100 text-ocean-600'}`}>
      {AGENT_ICONS[agent] || '🤖'} {agent}
    </span>
  );
}

function AgentFlowVisualizer({ events, activeAgent }: { events: ProgressEvent[]; activeAgent: string | null }) {
  const routeEvents = events.filter(e => e.type === 'route');
  const toolEvents = events.filter(e => e.type === 'tool_call');
  if (!activeAgent && routeEvents.length === 0 && toolEvents.length === 0) return null;

  const flowSteps: { agent: string; action: string }[] = [];
  flowSteps.push({ agent: 'planner', action: 'Analyzing' });
  for (const e of routeEvents) {
    flowSteps.push({ agent: (e as any).from || 'planner', action: 'Routing' });
    flowSteps.push({ agent: (e as any).to, action: 'Working' });
  }
  for (const e of toolEvents) {
    const agent = (e as any).agent || activeAgent || 'planner';
    if (flowSteps.length > 0 && flowSteps[flowSteps.length - 1].agent === agent && flowSteps[flowSteps.length - 1].action === 'Working') {
      continue;
    }
    flowSteps.push({ agent, action: `Using ${(e as any).tool}` });
  }
  if (activeAgent) {
    const last = flowSteps[flowSteps.length - 1];
    if (last && last.agent === activeAgent) {
      last.action = 'Synthesizing';
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {flowSteps.map((step, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-sponge-400">→</span>}
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${AGENT_COLORS[step.agent] || 'bg-ocean-100 text-ocean-600'}`}>
            {AGENT_ICONS[step.agent] || '🤖'} {step.agent}
          </span>
        </span>
      ))}
    </div>
  );
}

function ThinkingBlock({ events, reasoning }: { events: ProgressEvent[]; reasoning: string }) {
  const [expanded, setExpanded] = useState(true);
  if (!reasoning && events.length === 0) return null;

  return (
    <div className="mb-4">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm text-gary-400 hover:text-gary-500 mb-2 font-bold">
        <Sparkles className="h-4 w-4" />
        <span>Plankton's Brain Activity</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="bg-gary-50/50 border-2 border-gary-100 rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto">
          {reasoning && <p className="text-gary-600 text-xs italic">{reasoning}<span className="animate-pulse">|</span></p>}
          {events.filter(e => e.type === 'tool_call' || e.type === 'tool_result' || e.type === 'route').map((e, i) => (
            <div key={i} className="text-xs">
              {e.type === 'route' && (
                <p className="text-ocean-600">🔀 Routing to <strong>{(e as any).to}</strong>: {(e as any).task}</p>
              )}
              {e.type === 'tool_call' && (
                <p className="text-gary-600">⚡ Calling: {(e as any).tool}({JSON.stringify((e as any).args || {}).substring(0, 80)})</p>
              )}
              {e.type === 'tool_result' && (
                <p className="text-kelp-600">✅ Done: {(e as any).tool}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LabAssistantPage() {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.prompt || '';
  const [input, setInput] = useState(initialPrompt);
  const [messages, setMessages] = useState<{ role: string; content: string; agent?: string }[]>([]);
  const [convId, setConvId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { events, reasoning, content, isStreaming, activeAgent, error, sendMessage, reset, returnedConversationId } = useAgentChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef(false);

  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await chatApi.getConversations();
      const data = (res as any)?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(res)) return res;
      return [];
    },
  });
  const conversations: AgentConversation[] = conversationsData ?? [];

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
      const data = (res as any)?.data;
      const conv = data && typeof data === 'object' ? data : res;
      const msgs = Array.isArray(conv?.messages) ? conv.messages : [];
      if (msgs.length > 0) {
        setMessages(
          msgs.map((m: any) => ({
            role: m.role,
            content: m.content || '',
            agent: m.agentName || 'planner',
          }))
        );
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform md:relative md:transform-none md:shadow-none md:bg-transparent md:backdrop-blur-none flex flex-col gap-2 p-4 pt-16 md:pt-0 overflow-y-auto rounded-2xl md:rounded-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <button className="absolute top-4 right-4 md:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5 text-ocean-400" />
        </button>
        <h3 className="text-sm font-bold text-ocean-500 uppercase tracking-wider px-2">💬 Conversations</h3>
        <button
          onClick={() => { setConvId(undefined); setMessages([]); reset(); setSidebarOpen(false); }}
          className="w-full text-left px-3 py-2.5 rounded-xl bg-sponge-50 text-sponge-700 text-sm font-bold hover:bg-sponge-100 transition-all"
        >
          ✨ New Chat
        </button>
        {conversations.map((c: AgentConversation) => (
          <button
            key={c.id}
            onClick={() => { handleSelectConversation(c.id); setSidebarOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm truncate transition-all font-medium ${convId === c.id ? 'bg-ocean-50 text-ocean-700' : 'text-ocean-500 hover:bg-ocean-50/50'}`}
          >
            {c.title || 'Untitled'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-ocean-100 flex items-center gap-2">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-ocean-50" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5 text-ocean-500" />
            </button>
            <span className="text-xl">🤖</span>
            <h2 className="font-bold text-ocean-800 font-[var(--font-display)]">Karen AI Lab Assistant</h2>
            {activeAgent && <AgentBadge agent={activeAgent} />}
            {isStreaming && <Loader2 className="h-4 w-4 animate-spin text-sponge-500 ml-auto" />}
          </div>
          {(isStreaming || (events.length > 0 && events.some(e => e.type === 'route'))) && (
            <div className="px-4 pb-2">
              <AgentFlowVisualizer events={events} activeAgent={activeAgent} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4" style={{ animation: 'jellyfish 3s ease-in-out infinite' }}>🪼</div>
                <h3 className="text-xl font-bold text-ocean-700 font-[var(--font-display)]">How can Karen help you today?</h3>
                <p className="text-ocean-400 text-sm mt-1">I can search the web, manage inventory, run experiments, and more!</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    '🔍 Search for kelp growth studies',
                    '📦 Check low stock items',
                    '💾 Show all research projects',
                    '🧪 Suggest hypotheses about underwater acoustics',
                    '🦀 What supplies need reordering?',
                    '🔬 Create a new Jellyfish Migration project',
                  ].map(s => (
                    <button key={s} onClick={() => setInput(s.replace(/^[^\s]+ /, ''))} className="text-xs px-3 py-1.5 rounded-full bg-ocean-50 text-ocean-600 hover:bg-sponge-50 hover:text-sponge-700 transition-all font-bold">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg bg-ocean-100">
                    {AGENT_ICONS[msg.agent || 'planner'] || '🤖'}
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-sponge-400 to-sponge-500 text-ocean-900 font-medium'
                    : 'bg-ocean-50 text-ocean-800'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg bg-ocean-100">
                  {activeAgent ? AGENT_ICONS[activeAgent] || '🤖' : '🧠'}
                </div>
                <div className="max-w-[70%]">
                  <ThinkingBlock events={events} reasoning={reasoning} />
                  {content && (
                    <div className="bg-ocean-50 rounded-2xl px-4 py-3 text-sm text-ocean-800">
                      <p className="whitespace-pre-wrap">{content}<span className="animate-pulse">|</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-krabs-50 text-krabs-500 rounded-xl px-4 py-2.5 text-sm font-medium">🚨 {error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t-2 border-ocean-100">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border-2 border-ocean-200 px-4 py-2.5 text-sm focus:outline-none focus:border-sponge-400 bg-white/90 transition-all"
                placeholder="Ask Karen's Lab Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-sponge-400 to-sponge-500 text-ocean-900 rounded-xl hover:from-sponge-300 hover:to-sponge-400 disabled:opacity-50 transition-all font-bold shadow-lg shadow-sponge-400/20"
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
