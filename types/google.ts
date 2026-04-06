import { ApiResponse } from "./api";

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    cse_image?: Array<{
      src: string;
    }>;
  };
  thumbnail?: string;
  image?: string;
}

export interface GoogleSearchInformation {
  searchTime: number;
  totalResults: string;
  formattedSearchTime: string;
  formattedTotalResults: string;
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation: GoogleSearchInformation;
  queries: {
    request: Array<{
      searchTerms: string;
      startIndex: number;
      count: number;
    }>;
  };
}

export interface GoogleSearchRequest {
  query: string;
}
