export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatGPTResponse {
    message: string;
    error?: string;
}

export interface TicketAnalysisResponse extends ChatGPTResponse {
    message: string;
    analysis?: string;
    steps?: string;
    links?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  object?: string;
  created?: number;
  owned_by?: string;
  contextWindow?: number;
  pricingPerToken?: number;
  capabilities: AIModelCapability[];
  available: boolean;
}

export type AIProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'google' 
  | 'github';

export type AIModelCapability = 
  | 'chat'
  | 'completion'
  | 'code'
  | 'analysis'
  | 'image'
  | 'vision'
  | 'embedding';

export interface AIMessages {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessages[];
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIResponse {
  message: string;
  error?: string;
  provider?: AIProvider;
  model?: string;
  status?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Legacy interfaces for backward compatibility
export interface GPTModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface GPTModelList {
  models: GPTModel[];
}


export interface DeepSeekResponse {
  data: {
    message: string;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  message: string;
  status: number;
}
