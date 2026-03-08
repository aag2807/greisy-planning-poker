import { store } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const participantId = url.searchParams.get('participantId');

  if (!participantId) {
    return new Response('Missing participantId', { status: 400 });
  }

  if (!store.roomExists(id)) {
    return new Response('Room not found', { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      store.connect(id, participantId);

      const send = (type: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
          );
        } catch {
          cleanup();
        }
      };

      // Send initial state
      const room = store.getRoom(id);
      if (room) send('state', room);

      // Subscribe to state updates
      const unsubState = store.subscribeState(id, (room) => {
        send('state', room);
      });

      // Subscribe to events (nudges, etc.)
      const unsubEvents = store.subscribeEvents(id, (event) => {
        send(event.type as string, event);
      });

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          cleanup();
        }
      }, 15000);

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        unsubState();
        unsubEvents();
        clearInterval(heartbeat);
        store.disconnect(id, participantId);
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
