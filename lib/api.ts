/**
 * API request utility for making fetch requests with proper error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during the request');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
