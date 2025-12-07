import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { MuscleGroup } from '@/types';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    const data = await backendApiCall<MuscleGroup[]>('/muscle-groups/', {
      method: 'GET',
    }, token);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get muscle groups error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await req.json();

    const data = await backendApiCall<MuscleGroup>('/muscle-groups/', {
      method: 'POST',
      body: JSON.stringify(body),
    }, token);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create muscle group error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    const statusCode = errorMessage.includes('422') ? 422 : 500;

    return NextResponse.json({ detail: errorMessage }, { status: statusCode });
  }
}
