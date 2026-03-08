import { Room, Participant, HistoryRound, PARTICIPANT_COLORS } from './types';

// --- Internal Types ---

interface InternalRoom {
  id: string;
  name: string;
  password: string | null;
  createdAt: string;
  hostId: string;
  participants: InternalParticipant[];
  currentTopic: string;
  roundStartedAt: string;
  revealed: boolean;
  history: HistoryRound[];
}

interface InternalParticipant {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  vote: string | null;
  connections: number;
}

type StateCallback = (room: Room) => void;
type EventCallback = (event: Record<string, unknown>) => void;

// --- Global Storage (persists across hot reloads in dev) ---

const g = globalThis as unknown as {
  __ppRooms?: Map<string, InternalRoom>;
  __ppStateListeners?: Map<string, Set<StateCallback>>;
  __ppEventListeners?: Map<string, Set<EventCallback>>;
};

if (!g.__ppRooms) g.__ppRooms = new Map();
if (!g.__ppStateListeners) g.__ppStateListeners = new Map();
if (!g.__ppEventListeners) g.__ppEventListeners = new Map();

const rooms = g.__ppRooms;
const stateListeners = g.__ppStateListeners;
const eventListeners = g.__ppEventListeners;

// --- Helpers ---

function generateId(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function toPublicRoom(room: InternalRoom): Room {
  return {
    id: room.id,
    name: room.name,
    hasPassword: !!room.password,
    createdAt: room.createdAt,
    hostId: room.hostId,
    participants: room.participants.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      isHost: p.isHost,
      hasVoted: p.vote !== null,
      vote: room.revealed ? p.vote : null,
      isOnline: p.connections > 0,
    })),
    currentRound: {
      topic: room.currentTopic,
      startedAt: room.roundStartedAt,
    },
    revealed: room.revealed,
    history: room.history,
  };
}

function notifyState(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const publicRoom = toPublicRoom(room);
  const listeners = stateListeners.get(roomId);
  if (listeners) {
    for (const cb of listeners) {
      try {
        cb(publicRoom);
      } catch {
        /* listener errored */
      }
    }
  }
}

function emitEvent(roomId: string, event: Record<string, unknown>) {
  const listeners = eventListeners.get(roomId);
  if (listeners) {
    for (const cb of listeners) {
      try {
        cb(event);
      } catch {
        /* listener errored */
      }
    }
  }
}

// --- Store API ---

export const store = {
  createRoom(
    name: string,
    hostName: string,
    password?: string
  ): { roomId: string; participantId: string } {
    const roomId = generateId(6);
    const participantId = generateId(16);

    const room: InternalRoom = {
      id: roomId,
      name,
      password: password || null,
      createdAt: new Date().toISOString(),
      hostId: participantId,
      participants: [
        {
          id: participantId,
          name: hostName,
          color: PARTICIPANT_COLORS[0],
          isHost: true,
          vote: null,
          connections: 0,
        },
      ],
      currentTopic: '',
      roundStartedAt: new Date().toISOString(),
      revealed: false,
      history: [],
    };

    rooms.set(roomId, room);
    return { roomId, participantId };
  },

  getRoom(roomId: string): Room | null {
    const room = rooms.get(roomId);
    return room ? toPublicRoom(room) : null;
  },

  roomExists(roomId: string): boolean {
    return rooms.has(roomId);
  },

  roomHasPassword(roomId: string): boolean {
    const room = rooms.get(roomId);
    return room ? !!room.password : false;
  },

  joinRoom(
    roomId: string,
    name: string,
    password?: string
  ): { participantId: string } | { error: string } {
    const room = rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.password && room.password !== password)
      return { error: 'Incorrect password' };

    const participantId = generateId(16);
    const colorIndex = room.participants.length % PARTICIPANT_COLORS.length;

    room.participants.push({
      id: participantId,
      name,
      color: PARTICIPANT_COLORS[colorIndex],
      isHost: false,
      vote: null,
      connections: 0,
    });

    notifyState(roomId);
    return { participantId };
  },

  participantExists(roomId: string, participantId: string): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;
    return room.participants.some((p) => p.id === participantId);
  },

  vote(roomId: string, participantId: string, value: string) {
    const room = rooms.get(roomId);
    if (!room || room.revealed) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant) return;

    participant.vote = value;
    notifyState(roomId);
  },

  reveal(roomId: string, participantId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant?.isHost) return;

    room.revealed = true;
    notifyState(roomId);
  },

  reset(roomId: string, participantId: string, topic?: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant?.isHost) return;

    // Save current round to history if votes were revealed
    const votes = room.participants
      .filter((p) => p.vote !== null)
      .map((p) => ({ name: p.name, value: p.vote! }));

    if (votes.length > 0 && room.revealed) {
      const numericVotes = votes
        .map((v) => parseFloat(v.value))
        .filter((v) => !isNaN(v));

      room.history.unshift({
        topic: room.currentTopic || 'Untitled Round',
        votes,
        average:
          numericVotes.length > 0
            ? Math.round(
                (numericVotes.reduce((a, b) => a + b, 0) /
                  numericVotes.length) *
                  10
              ) / 10
            : null,
        startedAt: room.roundStartedAt,
        revealedAt: new Date().toISOString(),
      });
    }

    // Reset for new round
    for (const p of room.participants) {
      p.vote = null;
    }
    room.revealed = false;
    room.currentTopic = topic || '';
    room.roundStartedAt = new Date().toISOString();

    notifyState(roomId);
  },

  setTopic(roomId: string, participantId: string, topic: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant?.isHost) return;

    room.currentTopic = topic;
    notifyState(roomId);
  },

  nudge(roomId: string, fromId: string, toId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const from = room.participants.find((p) => p.id === fromId);
    if (!from) return;

    emitEvent(roomId, {
      type: 'nudge',
      from: from.name,
      fromId,
      to: toId,
    });
  },

  throwItem(roomId: string, fromId: string, toId: string, item: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const from = room.participants.find((p) => p.id === fromId);
    const to = room.participants.find((p) => p.id === toId);
    if (!from || !to) return;

    emitEvent(roomId, {
      type: 'throw',
      from: from.name,
      fromId,
      to: toId,
      toName: to.name,
      item,
    });
  },

  kick(roomId: string, hostId: string, targetId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const host = room.participants.find((p) => p.id === hostId);
    if (!host?.isHost) return;
    if (hostId === targetId) return;

    // Notify the kicked participant before removing them
    emitEvent(roomId, {
      type: 'kicked',
      participantId: targetId,
    });

    room.participants = room.participants.filter(
      (p) => p.id !== targetId
    );

    notifyState(roomId);
  },

  leave(roomId: string, participantId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(
      (p) => p.id !== participantId
    );

    // If the host left, assign a new host
    if (room.hostId === participantId && room.participants.length > 0) {
      room.participants[0].isHost = true;
      room.hostId = room.participants[0].id;
    }

    // If no participants left, delete the room
    if (room.participants.length === 0) {
      rooms.delete(roomId);
      stateListeners.delete(roomId);
      eventListeners.delete(roomId);
      return;
    }

    notifyState(roomId);
  },

  connect(roomId: string, participantId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (participant) {
      participant.connections++;
      notifyState(roomId);
    }
  },

  disconnect(roomId: string, participantId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (participant) {
      participant.connections = Math.max(0, participant.connections - 1);
      notifyState(roomId);
    }
  },

  subscribeState(roomId: string, callback: StateCallback): () => void {
    if (!stateListeners.has(roomId)) {
      stateListeners.set(roomId, new Set());
    }
    stateListeners.get(roomId)!.add(callback);

    return () => {
      const listeners = stateListeners.get(roomId);
      if (listeners) listeners.delete(callback);
    };
  },

  subscribeEvents(roomId: string, callback: EventCallback): () => void {
    if (!eventListeners.has(roomId)) {
      eventListeners.set(roomId, new Set());
    }
    eventListeners.get(roomId)!.add(callback);

    return () => {
      const listeners = eventListeners.get(roomId);
      if (listeners) listeners.delete(callback);
    };
  },
};
