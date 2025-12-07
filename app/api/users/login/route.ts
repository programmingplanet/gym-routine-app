import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { LoginResponse } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Username and password are required' },
        { status: 400 }
      );
    }

    const data = await backendApiCall<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error connecting to backend';

    const statusCode = errorMessage.includes('401') || errorMessage.includes('422') ? 401 : 500;

    return NextResponse.json({ detail: errorMessage }, { status: statusCode });
  }
}
