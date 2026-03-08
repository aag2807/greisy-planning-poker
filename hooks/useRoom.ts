'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Room } from '@/lib/types';

interface NudgeData {
  from: string;
  fromId: string;
  to: string;
}

interface ThrowData {
  from: string;
  fromId: string;
  to: string;
  toName: string;
  item: string;
}

export function useRoom(roomId: string, participantId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [nudge, setNudge] = useState<NudgeData | null>(null);
  const [throwEvent, setThrowEvent] = useState<ThrowData | null>(null);
  const [kicked, setKicked] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!participantId || kicked) return;

    let cancelled = false;

    function connect() {
      if (cancelled) return;

      const es = new EventSource(
        `/api/rooms/${roomId}/events?participantId=${participantId}`
      );
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!cancelled) setConnected(true);
      };

      es.onmessage = (event) => {
        if (cancelled) return;
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'state') {
            setRoom(message.data);
          } else if (message.type === 'nudge') {
            if (message.data.to === participantId) {
              setNudge(message.data);
              setTimeout(() => setNudge(null), 3000);
            }
          } else if (message.type === 'throw') {
            setThrowEvent(message.data);
            setTimeout(() => setThrowEvent(null), 2000);
          } else if (message.type === 'kicked') {
            if (message.data.participantId === participantId) {
              setKicked(true);
              es.close();
            }
          }
        } catch {
          /* parse error */
        }
      };

      es.onerror = () => {
        if (cancelled) return;
        setConnected(false);
        es.close();
        reconnectTimeout.current = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      eventSourceRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      setConnected(false);
    };
  }, [roomId, participantId, kicked]);

  const doAction = useCallback(
    async (action: string, data: Record<string, unknown> = {}) => {
      await fetch(`/api/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, participantId, ...data }),
      });
    },
    [roomId, participantId]
  );

  const vote = useCallback(
    (value: string) => doAction('vote', { value }),
    [doAction]
  );
  const reveal = useCallback(() => doAction('reveal'), [doAction]);
  const reset = useCallback(
    (topic?: string) => doAction('reset', { topic }),
    [doAction]
  );
  const nudgeParticipant = useCallback(
    (toId: string) => doAction('nudge', { fromId: participantId, toId }),
    [doAction, participantId]
  );
  const throwItem = useCallback(
    (toId: string, item: string) =>
      doAction('throw', { fromId: participantId, toId, item }),
    [doAction, participantId]
  );
  const kickParticipant = useCallback(
    (targetId: string) => doAction('kick', { targetId }),
    [doAction]
  );
  const setTopic = useCallback(
    (topic: string) => doAction('topic', { topic }),
    [doAction]
  );
  const leave = useCallback(() => doAction('leave'), [doAction]);

  return {
    room,
    connected,
    nudge,
    throwEvent,
    kicked,
    vote,
    reveal,
    reset,
    nudgeParticipant,
    throwItem,
    kickParticipant,
    setTopic,
    leave,
  };
}
