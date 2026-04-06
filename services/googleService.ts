import { ApiResponse } from "@/types/api";
import { apiRequest } from './api/clientConfig';
import { 
  GoogleSearchRequest, 
  GoogleSearchResponse, 
  GoogleSearchResult 
} from '@/types/google';

export class GoogleService {
  private static readonly BASE_URL = '/google';

  static async search(request: GoogleSearchRequest): Promise<ApiResponse<GoogleSearchResponse>> {
    const { query } = request;
    const response = await apiRequest<ApiResponse<GoogleSearchResponse>>(
      `${GoogleService.BASE_URL}?q=${encodeURIComponent(query)}`
    );
    return response;
  }
}

// Export individual methods for easier imports
export const {
  search,
} = GoogleService;
