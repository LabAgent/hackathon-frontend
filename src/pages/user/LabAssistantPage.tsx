import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, Sparkles, ChevronDown, Menu, X, MessageSquare, Plus } from 'lucide-react';
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
        <div className="bg-bb-purple-light/15 border-2 border-bb-purple-light/30 rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto">
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
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 md:relative md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, rgba(74,90,104,0.95) 0%, rgba(61,77,90,0.97) 50%, rgba(53,69,80,0.95) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-sponge-300 uppercase tracking-wider flex items-center gap-2 font-[var(--font-display)]">
            <MessageSquare className="h-4 w-4" />
            Conversations
          </h3>
          <button className="md:hidden text-ocean-300 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={() => { setConvId(undefined); setMessages([]); reset(); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
              !convId
                ? 'bg-bb-pineapple/20 text-bb-pineapple-light border border-bb-pineapple/30'
                : 'bg-white/5 text-ocean-200 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-50">🪼</div>
              <p className="text-ocean-400 text-xs">No conversations yet</p>
              <p className="text-ocean-500 text-xs mt-1">Start a new chat with Karen!</p>
            </div>
          )}
          {conversations.map((c: AgentConversation) => {
            const isActive = convId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { handleSelectConversation(c.id); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all font-medium group ${
                  isActive
                    ? 'bg-sponge-400/15 text-sponge-200 border border-sponge-400/25'
                    : 'text-ocean-300 hover:bg-white/8 border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{isActive ? '💬' : '💭'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate leading-tight">{c.title || 'Untitled Chat'}</p>
                    <p className="text-[10px] text-ocean-500 mt-0.5">
                      {c.id?.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-ocean-500">
            <span>🪼</span> {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-bb-sand/40 flex items-center gap-2">
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
                    <button key={s} onClick={() => setInput(s.replace(/^[^\s]+ /, ''))} className="text-xs px-3 py-1.5 rounded-full bg-bb-sand/40 text-bb-brown-light hover:bg-bb-pineapple/15 hover:text-bb-pineapple transition-all font-bold">{s}</button>
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
                    ? 'bg-gradient-to-r from-bb-pineapple to-bb-pineapple-light text-white font-medium'
                    : 'bg-bb-sand-light/60 text-ocean-800'
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
              <div className="bg-bb-danger-light text-bb-coral rounded-xl px-4 py-2.5 text-sm font-medium">🚨 {error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t-2 border-ocean-100">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border-2 border-bb-sand-dark/40 px-4 py-2.5 text-sm focus:outline-none focus:border-bb-pineapple bg-bb-sand-light/92 transition-all"
                placeholder="Ask Karen's Lab Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-bb-pineapple to-bb-pineapple-light text-white rounded-xl hover:from-bb-pineapple-light hover:to-bb-yellow disabled:opacity-50 transition-all font-bold shadow-warm-lg"
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
