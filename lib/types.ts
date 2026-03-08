export interface Room {
  id: string;
  name: string;
  hasPassword: boolean;
  createdAt: string;
  hostId: string;
  participants: Participant[];
  currentRound: {
    topic: string;
    startedAt: string;
  };
  revealed: boolean;
  history: HistoryRound[];
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  isSpectator: boolean;
  hasVoted: boolean;
  vote: string | null;
  voteChanged: boolean;
  isOnline: boolean;
}

export interface HistoryRound {
  topic: string;
  votes: { name: string; value: string }[];
  average: number | null;
  startedAt: string;
  revealedAt: string;
}

export const CARD_VALUES = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '☕'];

export const EMOJI_OPTIONS = [
  '🎉', '🔥', '💯', '🤔', '😅', '🎯', '⚡', '🌟',
  '💪', '🙈', '🦄', '🚀', '💎', '👀', '🤯', '🎪',
];

export const REACTION_EMOJIS = [
  '👍', '👎', '😂', '🎉', '❤️', '🤔', '👏', '🙌',
];

export const PARTICIPANT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
  '#F0B27A', '#A9CCE3', '#D7BDE2', '#A3E4D7', '#FAD7A0',
];
