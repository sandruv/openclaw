import { ApiResponse } from "@/types/api";
import { GPTModel, AIRequest, AIResponse } from '@/types/ai';
import { apiRequest } from './api/clientConfig';

export class GPTService {
  private static readonly BASE_URL = '/chatgpt';

  static async checkGpt(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiRequest<ApiResponse<{ message: string }>>(
      GPTService.BASE_URL,
      { method: 'GET' }
    );
    return response;
  }

  static async getModels(): Promise<ApiResponse<GPTModel[]>> {
    const response = await apiRequest<ApiResponse<GPTModel[]>>(GPTService.BASE_URL + '/models');
    return response;
  }

  static async generateResponse(request: AIRequest): Promise<ApiResponse<{ message: string }>> {
    const { messages, model = 'gpt-3.5-turbo', temperature = 1.3, max_tokens = 10000 } = request;

    const response = await apiRequest<ApiResponse<{ message: string }>>(
      GPTService.BASE_URL, 
      {
        method: 'POST',
        data: { messages, model, temperature, max_tokens }
      }
    );
    
    return response;
  }
}

// Export individual methods for easier imports
export const {
  checkGpt,
  getModels,
  generateResponse,
} = GPTService;
