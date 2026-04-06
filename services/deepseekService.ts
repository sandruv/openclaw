import { AIRequest, AIResponse } from '@/types/ai';
import { ApiResponse } from '../types/api';
import { apiRequest } from './api/clientConfig';
import { getErrorMessage } from '@/lib/utils';

export class DeepSeekService {
  private static readonly BASE_URL = '/deepseek';

  static async checkDeepseek(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      DeepSeekService.BASE_URL,
      { method: 'GET' }
    );
    return response;
  }

  static async generateResponse(request: AIRequest): Promise<ApiResponse<{ message: string }>> {
    const { messages, model, temperature = 1.3, max_tokens = 8000 } = request;
    
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      DeepSeekService.BASE_URL,
      {
        method: 'POST',
        data: {
          messages,
          model: model || 'deepseek-chat',
          temperature,
          max_tokens,
        }
      }
    );

    return response
  }
}

export const {
  checkDeepseek,
  generateResponse,
} = DeepSeekService;