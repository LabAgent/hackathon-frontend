export interface AgentConversation {
  id: string;
  title: string | null;
  userId: string;
  messages: AgentMessage[];
  createdAt: string;
}

export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string | null;
  reasoning: string | null;
  toolCalls: Record<string, any>[] | null;
  agentName: string | null;
  toolCallId: string | null;
  createdAt: string;
}

export type ProgressEvent =
  | { type: 'agent_start'; agent: string; message: string }
  | { type: 'reasoning'; agent: string; chunk: string }
  | { type: 'content'; agent: string; chunk: string }
  | { type: 'tool_call'; agent: string; tool: string; args: Record<string, any> }
  | { type: 'tool_progress'; agent: string; message: string }
  | { type: 'tool_result'; agent: string; tool: string; result: string }
  | { type: 'tool_error'; agent: string; message: string }
  | { type: 'route'; from: string; to: string; task: string }
  | { type: 'complete'; data: { response: string; agentSteps: any[] } }
  | { type: 'error'; message: string };
