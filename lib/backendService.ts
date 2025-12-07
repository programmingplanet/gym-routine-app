// Backend service for making calls to FastAPI
const BACKEND_API_URL = process.env.BACKEND_PRIVATE_URL || 'http://gym-routine-api:8000';

export interface ApiError {
  detail: string;
  status?: number;
}

export async function backendApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
