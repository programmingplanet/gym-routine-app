import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { Exercise } from '@/types';

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { userId } = await context.params;

    const data = await backendApiCall<Exercise[]>(`/exercises/user/${userId}`, {
      method: 'GET',
    }, token);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get user exercises error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}
