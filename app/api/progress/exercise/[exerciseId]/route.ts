import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { Progress } from '@/types';

export async function GET(
  req: Request,
  context: { params: Promise<{ exerciseId: string }> }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { exerciseId } = await context.params;

    const data = await backendApiCall<Progress[]>(`/progress/exercise/${exerciseId}`, {
      method: 'GET',
    }, token);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get exercise progress error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}
