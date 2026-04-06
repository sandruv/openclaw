import { AIModel } from '@/types/ai';

export const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  google: "Google",
  github: "GitHub"
} as const;

export const PROVIDER_AVAILABILITY = {
    openai: true,
    anthropic: false,
    deepseek: true,
    google: false,
    github: false
} as const;

export const PROVIDER_DESCRIPTIONS = {
  openai: "Advanced language models by OpenAI, offering strong performance across various tasks.",
  anthropic: "Constitutional AI models focused on safety and reliability.",
  deepseek: "Specialized models for code understanding and generation.",
  google: "Google's latest language models with strong reasoning capabilities.",
  github: "GitHub's AI pair programmer with deep code understanding."
} as const;

export const PROVIDER_COLORS = {
  openai: "bg-emerald-600 hover:bg-emerald-700",
  anthropic: "bg-purple-600 hover:bg-purple-700",
  deepseek: "bg-blue-600 hover:bg-blue-700",
  google: "bg-sky-500 hover:bg-sky-600",
  github: "bg-gray-800 hover:bg-gray-900"
} as const;

export type Provider = keyof typeof PROVIDER_NAMES;

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    contextWindow: 8192,
    capabilities: ['chat', 'code', 'analysis'],
    available: false
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5',
    provider: 'openai',
    contextWindow: 81923,
    capabilities: ['chat', 'analysis'],
    available: false
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    contextWindow: 8192,
    capabilities: ['chat', 'analysis'],
    available: false
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    provider: 'anthropic',
    contextWindow: 100000,
    capabilities: ['chat', 'analysis'],
    available: false
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    contextWindow: 32768,
    capabilities: ['chat', 'analysis'],
    available: false
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    provider: 'github',
    capabilities: ['code', 'chat'],
    available: false
  },
];