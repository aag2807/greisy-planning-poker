import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, hostName, password } = body;

  if (!name || !hostName) {
    return NextResponse.json(
      { error: 'Room name and your name are required' },
      { status: 400 }
    );
  }

  const result = await store.createRoom(name, hostName, password || undefined);
  return NextResponse.json(result);
}
