import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { Progress } from '@/types';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await req.json();

    const data = await backendApiCall<Progress>('/progress/', {
      method: 'POST',
      body: JSON.stringify(body),
    }, token);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create progress error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    const statusCode = errorMessage.includes('422') ? 422 : 500;

    return NextResponse.json({ detail: errorMessage }, { status: statusCode });
  }
}
