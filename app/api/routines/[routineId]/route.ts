import { NextResponse } from 'next/server';
import { backendApiCall } from '@/lib/backendService';
import { Routine } from '@/types';

export async function GET(
  req: Request,
  context: { params: Promise<{ routineId: string }> }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { routineId } = await context.params;

    const data = await backendApiCall<Routine>(`/routines/${routineId}`, {
      method: 'GET',
    }, token);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get routine error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ routineId: string }> }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { routineId } = await context.params;
    const body = await req.json();

    const data = await backendApiCall<Routine>(`/routines/${routineId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, token);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Update routine error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    const statusCode = errorMessage.includes('422') ? 422 : 500;

    return NextResponse.json({ detail: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ routineId: string }> }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { routineId } = await context.params;

    await backendApiCall(`/routines/${routineId}`, {
      method: 'DELETE',
    }, token);

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Delete routine error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error connecting to backend';

    return NextResponse.json({ detail: errorMessage }, { status: 500 });
  }
}
