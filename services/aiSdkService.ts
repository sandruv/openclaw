import { ApiResponse } from "@/types/api";
import { AIRequest, AIResponse, Message } from '@/types/ai';

interface TicketAnalysis {
  analysis: string;
  steps: string;
  links: string;
}

export class AISdkService {
  private static readonly BASE_URL = '/api/aisdk';

  private static getToken(): string {
    const token = localStorage.getItem('ywp_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return token;
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = AISdkService.getToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
  }

  static async generateResponse(request: AIRequest): Promise<AIResponse> {
    const { 
      messages, 
      model = 'gpt-4-turbo', 
      temperature = 1.0, 
      max_tokens = 4096 
    } = request;

    const response = await AISdkService.fetchWithAuth(`${AISdkService.BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify({ 
        messages, 
        model, 
        temperature, 
        max_tokens 
      }),
    });

    const data = await response.json();
    return data;
  }

  static async *generateResponseStream(request: AIRequest): AsyncGenerator<string> {
    const { 
      messages, 
      model = 'gpt-4-turbo', 
      temperature = 1.0, 
      max_tokens = 4096 
    } = request;

    const response = await AISdkService.fetchWithAuth(`${AISdkService.BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify({ 
        messages, 
        model, 
        temperature, 
        max_tokens 
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        const err = new Error('TOKEN_LIMIT_REACHED') as any;
        err.code = 'TOKEN_LIMIT_REACHED';
        err.used = data.used;
        err.limit = data.limit;
        throw err;
      }
      throw new Error(`AI response failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const text = decoder.decode(value, { stream: true });
        buffer += text;
        chunkCount++;
        
        // Process the data stream to extract the text content
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // Handle the specific format with 0: prefix
          if (line.match(/^0:".*"$/)) {
            try {
              // Extract the content between quotes
              const match = line.match(/^0:"(.*)"$/);
              if (match && match[1]) {
                const content = match[1];
                yield content;
                continue;
              }
            } catch (e) {
              // Silent fail and continue to other parsing methods
            }
          }
          
          if (line.startsWith('data:')) {
            try {
              // Extract the JSON part after 'data: '
              const jsonStr = line.substring(5).trim();
              
              if (jsonStr === '[DONE]') {
                continue;
              }
              
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                
                if (data.text !== undefined) {
                  yield data.text;
                }
              }
            } catch (e) {
              // If we can't parse as JSON, try to extract any text content directly
              const match = line.match(/data:\s*(.+)/);
              if (match && match[1]) {
                try {
                  // Try to extract text from non-standard format
                  yield match[1];
                } catch (innerError) {
                  // Silent fail
                }
              }
            }
          } else {
            // Handle non-standard format or direct text
            if (line.trim()) {
              try {
                // Try to parse as JSON in case it's missing the data: prefix
                const data = JSON.parse(line);
                if (data.text !== undefined) {
                  yield data.text;
                }
              } catch (e) {
                // If not JSON, yield the line directly if it looks like content
                if (!line.includes('{') && !line.includes('}')) {
                  yield line;
                }
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  static async *analyzeTicket(taskId: number, mode: 'initial' | 'incremental' = 'initial'): AsyncGenerator<Partial<TicketAnalysis>> {
    const response = await AISdkService.fetchWithAuth(`${AISdkService.BASE_URL}/assistant`, {
      method: 'POST',
      body: JSON.stringify({ taskId, mode }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line);
              yield chunk;
            } catch (e) {
              console.warn('Failed to parse chunk:', line);
            }
          }
        }
      }

      // Handle any remaining data in the buffer
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer);
          yield chunk;
        } catch (e) {
          console.warn('Failed to parse final chunk:', buffer);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Validates content to ensure it is intelligible and understandable
   * @param content The content to validate (can include HTML from Tiptap editor with image tags)
   * @returns A validation result with valid status and optional error message
   */
  static async validateContent(content: string): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await AISdkService.fetchWithAuth(`${AISdkService.BASE_URL}/validate`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Content validation error:', error);
      return { 
        valid: false, 
        message: error instanceof Error ? error.message : 'Failed to validate content' 
      };
    }
  }
}

// Export the class instead of individual methods
export default AISdkService;
