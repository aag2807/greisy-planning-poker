import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await store.roomExists(id))) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({
    room: await store.getRoom(id),
    hasPassword: await store.roomHasPassword(id),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, ...data } = body;

  switch (action) {
    case 'join': {
      const result = store.joinRoom(id, data.name, data.password, data.spectator);
      if ('error' in result) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }
    case 'vote': {
      store.vote(id, data.participantId, data.value);
      return NextResponse.json({ ok: true });
    }
    case 'reveal': {
      store.reveal(id, data.participantId);
      return NextResponse.json({ ok: true });
    }
    case 'reset': {
      store.reset(id, data.participantId, data.topic);
      return NextResponse.json({ ok: true });
    }
    case 'nudge': {
      store.nudge(id, data.fromId, data.toId);
      return NextResponse.json({ ok: true });
    }
    case 'throw': {
      store.throwItem(id, data.fromId, data.toId, data.item);
      return NextResponse.json({ ok: true });
    }
    case 'react': {
      store.react(id, data.participantId, data.emoji);
      return NextResponse.json({ ok: true });
    }
    case 'kick': {
      store.kick(id, data.participantId, data.targetId);
      return NextResponse.json({ ok: true });
    }
    case 'leave': {
      store.leave(id, data.participantId);
      return NextResponse.json({ ok: true });
    }
    case 'topic': {
      store.setTopic(id, data.participantId, data.topic);
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
