'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '@/hooks/useRoom';
import { CARD_VALUES, EMOJI_OPTIONS, Participant } from '@/lib/types';

const THROWABLES = ['📄', '🍅', '❄️', '🧸', '💐', '🎾', '✈️', '🧁'];

// =================================================================
// POKER CARD
// =================================================================

function PokerCard({
  value,
  selected,
  disabled,
  onClick,
  index,
}: {
  value: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-[48px] h-[70px] sm:w-[58px] sm:h-[84px] rounded-xl font-bold text-lg
        transition-all duration-300 select-none shrink-0
        flex items-center justify-center
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${
          selected
            ? 'bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border-2 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.4)]'
            : 'glass hover:bg-white/10 hover:border-white/20'
        }
      `}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={disabled ? {} : { scale: 1.08, y: -8 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      style={{ scrollSnapAlign: 'center' }}
    >
      <span className="text-lg sm:text-xl">{value}</span>
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-violet-400/50"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

// =================================================================
// EMOJI SWITCHER CARD
// =================================================================

function EmojiSwitcherCard({
  selected,
  disabled,
  selectedEmoji,
  onSelect,
}: {
  selected: boolean;
  disabled: boolean;
  selectedEmoji: string | null;
  onSelect: (emoji: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentEmojiRef = useRef(EMOJI_OPTIONS[0]);

  useEffect(() => {
    if (showPicker || selected || disabled || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => {
        const next = (i + 1) % EMOJI_OPTIONS.length;
        currentEmojiRef.current = EMOJI_OPTIONS[next];
        return next;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [showPicker, selected, disabled, isPaused]);

  const handleQuickPick = () => {
    if (disabled) return;
    onSelect(currentEmojiRef.current);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!showPicker) setIsPaused(false);
      }}
    >
      <motion.button
        onClick={handleQuickPick}
        disabled={disabled}
        className={`
          relative w-[48px] h-[70px] sm:w-[58px] sm:h-[84px] rounded-xl font-bold
          transition-all duration-300 select-none shrink-0
          flex flex-col items-center justify-center overflow-hidden gap-0.5
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${
            selected
              ? 'bg-gradient-to-br from-pink-600/30 to-amber-600/30 border-2 border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.4)]'
              : 'glass hover:bg-white/10 border border-pink-500/20 hover:border-pink-500/40'
          }
        `}
        whileHover={disabled ? {} : { scale: 1.08, y: -8 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        style={{ scrollSnapAlign: 'center' }}
      >
        <motion.span
          key={selected ? selectedEmoji : currentIndex}
          className="text-xl sm:text-2xl"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {selected && selectedEmoji
            ? selectedEmoji
            : EMOJI_OPTIONS[currentIndex]}
        </motion.span>
        {!selected && !disabled && (
          <span className="text-[7px] text-pink-300/50 leading-none">
            {isPaused ? 'tap!' : ''}
          </span>
        )}
      </motion.button>

      {!disabled && !selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
            setIsPaused(true);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500/80 hover:bg-pink-400 text-[9px] flex items-center justify-center cursor-pointer transition-colors shadow-lg z-10"
          title="Browse all emojis"
        >
          &#9776;
        </button>
      )}

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPicker(false);
                setIsPaused(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-3 right-0 glass-strong rounded-2xl p-3.5 z-50 min-w-[210px]"
            >
              <p className="text-[11px] text-white/50 text-center mb-2.5 font-medium">
                Pick your emoji vote
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelect(emoji);
                      setShowPicker(false);
                      setIsPaused(false);
                    }}
                    className="w-11 h-11 rounded-xl hover:bg-white/10 flex items-center justify-center text-xl transition-all hover:scale-110 cursor-pointer active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================================================================
// VOTE CARD (participant's card on the table)
// =================================================================

function VoteCard({
  participant,
  revealed,
}: {
  participant: Participant;
  revealed: boolean;
}) {
  const showValue = revealed && participant.vote;

  return (
    <motion.div
      className={`
        w-12 h-[68px] sm:w-14 sm:h-20 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold
        transition-all duration-500
        ${
          !participant.hasVoted
            ? 'border-2 border-dashed border-white/10'
            : showValue
              ? 'bg-gradient-to-br from-violet-600/40 to-cyan-600/40 border border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
              : 'card-back-pattern border border-violet-500/30 bg-violet-950/50'
        }
      `}
      animate={showValue ? { rotateY: [90, 0], scale: [0.8, 1] } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {showValue ? (
        <span>{participant.vote}</span>
      ) : participant.hasVoted ? (
        <span className="text-violet-300/40 text-xs">&#10003;</span>
      ) : null}
    </motion.div>
  );
}

// =================================================================
// PARTICIPANT CARD
// =================================================================

function ParticipantCardUI({
  participant,
  revealed,
  isCurrentUser,
  isHost,
  onNudge,
  onThrow,
  onKick,
  isNudged,
}: {
  participant: Participant;
  revealed: boolean;
  isCurrentUser: boolean;
  isHost: boolean;
  onNudge: () => void;
  onThrow: () => void;
  onKick: () => void;
  isNudged: boolean;
}) {
  const initial = participant.name.charAt(0).toUpperCase();

  return (
    <motion.div
      className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-2xl transition-all relative ${
        isCurrentUser ? 'bg-white/[0.04] ring-1 ring-white/10' : ''
      } ${!participant.isOnline && !isCurrentUser ? 'opacity-50' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: participant.isOnline || isCurrentUser ? 1 : 0.5,
        scale: 1,
        x: isNudged ? [0, -6, 6, -4, 4, -2, 2, 0] : 0,
      }}
      transition={isNudged ? { duration: 0.5 } : { duration: 0.3 }}
    >
      {/* Kick button (host only, for others) */}
      {isHost && !isCurrentUser && (
        <button
          onClick={onKick}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/60 hover:bg-red-500 text-[9px] flex items-center justify-center cursor-pointer transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10 text-white/80"
          title={`Remove ${participant.name}`}
          style={{ opacity: undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
        >
          &#10005;
        </button>
      )}

      {/* Avatar */}
      <div className="relative">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${participant.color}, ${participant.color}88)`,
          }}
        >
          {initial}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border-2 border-[#13111C] transition-colors ${
            participant.isOnline ? 'bg-emerald-400' : 'bg-gray-500'
          }`}
        />
        {participant.isHost && (
          <div className="absolute -top-1.5 -right-1.5 text-[10px] sm:text-[11px]">
            &#128081;
          </div>
        )}
      </div>

      {/* Vote card */}
      <VoteCard participant={participant} revealed={revealed} />

      {/* Name */}
      <span className="text-[10px] sm:text-[11px] text-white/60 truncate max-w-[72px] sm:max-w-[80px] text-center leading-tight">
        {participant.name}
        {isCurrentUser && (
          <span className="text-white/25 block">(you)</span>
        )}
      </span>

      {/* Action buttons */}
      {!isCurrentUser && (
        <div className="flex items-center gap-1">
          {!participant.hasVoted && !revealed && (
            <motion.button
              onClick={onNudge}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 transition-all cursor-pointer"
              whileTap={{ scale: 0.9 }}
              title="Nudge"
            >
              &#128075;
            </motion.button>
          )}
          <motion.button
            onClick={onThrow}
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 transition-all cursor-pointer"
            whileTap={{ scale: 0.9 }}
            title="Throw something!"
          >
            &#127919;
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// =================================================================
// THROW ANIMATION
// =================================================================

function ThrowProjectile({
  item,
  onComplete,
}: {
  item: string;
  onComplete: () => void;
}) {
  const [positions] = useState(() => {
    if (typeof window === 'undefined')
      return { sx: 0, sy: 0, ex: 200, ey: 300 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const edge = Math.floor(Math.random() * 4);
    const rand = Math.random();
    let sx: number, sy: number;
    switch (edge) {
      case 0: sx = rand * w; sy = -60; break;
      case 1: sx = w + 60; sy = rand * h; break;
      case 2: sx = rand * w; sy = h + 60; break;
      default: sx = -60; sy = rand * h; break;
    }
    return {
      sx,
      sy,
      ex: w / 2 + (Math.random() - 0.5) * 100,
      ey: h / 2 + (Math.random() - 0.5) * 80,
    };
  });

  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed z-[60] text-4xl sm:text-5xl pointer-events-none select-none"
      style={{ left: 0, top: 0, willChange: 'transform' }}
      initial={{
        x: positions.sx,
        y: positions.sy,
        scale: 0.4,
        opacity: 0,
        rotate: 0,
      }}
      animate={{
        x: positions.ex,
        y: positions.ey,
        scale: [0.4, 1.3, 1.8, 0],
        opacity: [0, 1, 1, 0],
        rotate: 540,
      }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {item}
    </motion.div>
  );
}

// =================================================================
// VOTE STATISTICS
// =================================================================

function VoteStatistics({ participants }: { participants: Participant[] }) {
  const stats = useMemo(() => {
    const voted = participants.filter((p) => p.vote !== null);
    if (voted.length === 0) return null;

    const numericVotes = voted
      .map((p) => parseFloat(p.vote!))
      .filter((v) => !isNaN(v));

    const allVoteValues = voted.map((p) => p.vote!);
    const distribution = allVoteValues.reduce<Record<string, number>>(
      (acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      },
      {}
    );

    const sortedDist = Object.entries(distribution).sort(
      ([, a], [, b]) => b - a
    );
    const maxCount = Math.max(...Object.values(distribution));
    const modeCount = sortedDist[0]?.[1] || 0;
    const agreementPct = Math.round((modeCount / voted.length) * 100);

    let average: number | null = null;
    let median: number | null = null;

    if (numericVotes.length > 0) {
      const sorted = [...numericVotes].sort((a, b) => a - b);
      average =
        Math.round(
          (sorted.reduce((a, b) => a + b, 0) / sorted.length) * 10
        ) / 10;
      median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
    }

    let consensusEmoji = '\u{1F605}';
    let consensusText = 'Mixed opinions';
    if (agreementPct === 100) {
      consensusEmoji = '\u{1F3AF}';
      consensusText = 'Perfect consensus!';
    } else if (agreementPct >= 75) {
      consensusEmoji = '\u{1F4AA}';
      consensusText = 'Strong agreement';
    } else if (agreementPct >= 50) {
      consensusEmoji = '\u{1F914}';
      consensusText = 'Moderate agreement';
    }

    return {
      average,
      median,
      sortedDist,
      maxCount,
      consensusEmoji,
      consensusText,
      total: voted.length,
    };
  }, [participants]);

  if (!stats) return null;

  return (
    <motion.div
      className="glass rounded-2xl p-4 sm:p-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 sm:mb-5">
        {stats.average !== null && (
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold gradient-text">
              {stats.average}
            </div>
            <div className="text-[10px] sm:text-[11px] text-white/40">Average</div>
          </div>
        )}
        {stats.median !== null && (
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400">
              {stats.median}
            </div>
            <div className="text-[10px] sm:text-[11px] text-white/40">Median</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-xl sm:text-2xl">{stats.consensusEmoji}</div>
          <div className="text-[10px] sm:text-[11px] text-white/40">
            {stats.consensusText}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {stats.sortedDist.map(([value, count]) => (
          <div key={value} className="flex items-center gap-2 sm:gap-3">
            <span className="w-7 sm:w-8 text-right text-xs sm:text-sm font-mono text-white/70">
              {value}
            </span>
            <div className="flex-1 h-5 sm:h-6 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500/60 to-cyan-500/60"
                initial={{ width: 0 }}
                animate={{ width: `${(count / stats.maxCount) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="w-12 sm:w-14 text-[10px] sm:text-xs text-white/40">
              {count} vote{count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// =================================================================
// HISTORY PANEL
// =================================================================

function HistoryPanel({
  history,
  isOpen,
  onClose,
}: {
  history: {
    topic: string;
    votes: { name: string; value: string }[];
    average: number | null;
    revealedAt: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-strong z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">Voting History</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white/60"
                >
                  &#10005;
                </button>
              </div>

              {history.length === 0 ? (
                <p className="text-white/40 text-center py-12 text-sm">
                  No rounds completed yet.
                  <br />
                  <span className="text-white/20">
                    Completed rounds will appear here.
                  </span>
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {history.map((round, i) => (
                    <motion.div
                      key={`${round.revealedAt}-${i}`}
                      className="glass rounded-xl p-3 sm:p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h3 className="font-medium text-xs sm:text-sm truncate flex-1">
                          {round.topic}
                        </h3>
                        {round.average !== null && (
                          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 ml-2 shrink-0">
                            avg: {round.average}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {round.votes.map((v, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-white/5 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1"
                          >
                            <span className="text-white/40">{v.name}</span>
                            <span className="font-bold text-white/80">
                              {v.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-white/15 mt-1.5 sm:mt-2">
                        {new Date(round.revealedAt).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =================================================================
// NUDGE OVERLAY
// =================================================================

function NudgeOverlay({ from }: { from: string | null }) {
  return (
    <AnimatePresence>
      {from && (
        <motion.div
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shadow-2xl max-w-[90vw]"
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <motion.span
            className="text-xl sm:text-2xl"
            animate={{ rotate: [0, -20, 20, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            &#128075;
          </motion.span>
          <span className="text-xs sm:text-sm font-medium">
            <span className="text-violet-300">{from}</span>
            <span className="text-white/60"> nudged you!</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =================================================================
// TOAST
// =================================================================

function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-[140px] sm:bottom-[170px] left-1/2 -translate-x-1/2 z-50 glass-strong rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap max-w-[90vw] text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =================================================================
// JOIN SCREEN
// =================================================================

function JoinScreen({
  roomId,
  onJoin,
}: {
  roomId: string;
  onJoin: (participantId: string) => void;
}) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [roomInfo, setRoomInfo] = useState<{
    name: string;
    hasPassword: boolean;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setRoomInfo({ name: data.room.name, hasPassword: data.hasPassword });
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [roomId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', name: name.trim(), password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setJoining(false);
        return;
      }
      onJoin(data.participantId);
    } catch {
      setError('Failed to join room');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4">
        <motion.div
          className="glass rounded-3xl p-8 sm:p-10 text-center max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-4xl sm:text-5xl mb-4">&#128269;</div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">Room Not Found</h2>
          <p className="text-white/50 text-xs sm:text-sm mb-6">
            This room may have expired or the code is incorrect.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors font-medium text-sm"
          >
            Go Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <motion.div
        className="glass rounded-3xl p-6 sm:p-10 w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl mb-3">&#127183;</div>
          <h2 className="text-lg sm:text-xl font-bold mb-1">Join Session</h2>
          <p className="text-white/50 text-xs sm:text-sm">
            Joining{' '}
            <span className="text-violet-300 font-medium">
              {roomInfo?.name}
            </span>
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[11px] text-white/40 mb-1 sm:mb-1.5 ml-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm transition-colors"
              autoFocus
              maxLength={30}
            />
          </div>

          {roomInfo?.hasPassword && (
            <div>
              <label className="block text-[11px] text-white/40 mb-1 sm:mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm transition-colors"
              />
            </div>
          )}

          {error && (
            <motion.p
              className="text-red-400 text-xs text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || joining}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// =================================================================
// KICKED SCREEN
// =================================================================

function KickedScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 relative z-10">
      <motion.div
        className="glass rounded-3xl p-8 sm:p-10 text-center max-w-sm w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-4xl sm:text-5xl mb-4">&#128683;</div>
        <h2 className="text-lg sm:text-xl font-bold mb-2">
          You were removed
        </h2>
        <p className="text-white/50 text-xs sm:text-sm mb-6">
          The host has removed you from this session.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors font-medium text-sm"
        >
          Go Home
        </a>
      </motion.div>
    </div>
  );
}

// =================================================================
// MAIN ROOM CLIENT
// =================================================================

export default function RoomClient({ roomId }: { roomId: string }) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState('');
  const [initialCheck, setInitialCheck] = useState(true);
  const [throwAnimations, setThrowAnimations] = useState<
    Array<{ id: string; item: string }>
  >([]);
  const prevRoundRef = useRef<string | null>(null);

  const {
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
  } = useRoom(roomId, participantId);

  // Check localStorage for existing session
  useEffect(() => {
    const stored = localStorage.getItem(`pp-${roomId}`);
    if (stored) {
      fetch(`/api/rooms/${roomId}`)
        .then((r) => r.json())
        .then((data) => {
          if (
            data.room?.participants?.some(
              (p: Participant) => p.id === stored
            )
          ) {
            setParticipantId(stored);
          } else {
            localStorage.removeItem(`pp-${roomId}`);
          }
          setInitialCheck(false);
        })
        .catch(() => {
          localStorage.removeItem(`pp-${roomId}`);
          setInitialCheck(false);
        });
    } else {
      setInitialCheck(false);
    }
  }, [roomId]);

  // Reset selected card on new round
  useEffect(() => {
    if (!room) return;
    if (
      prevRoundRef.current !== null &&
      room.currentRound.startedAt !== prevRoundRef.current
    ) {
      setSelectedCard(null);
      setSelectedEmoji(null);
    }
    prevRoundRef.current = room.currentRound.startedAt;
  }, [room]);

  // Handle throw events - show animation
  useEffect(() => {
    if (!throwEvent || !participantId) return;

    const isTarget = throwEvent.to === participantId;
    const myName = room?.participants.find(
      (p) => p.id === participantId
    )?.name;

    if (isTarget) {
      // Show projectile animation
      const animId = `${Date.now()}-${Math.random()}`;
      setThrowAnimations((prev) => [
        ...prev,
        { id: animId, item: throwEvent.item },
      ]);
    } else {
      // Show toast for observers
      const targetName =
        throwEvent.to === participantId ? 'you' : throwEvent.toName;
      if (throwEvent.from !== myName) {
        showToast(
          `${throwEvent.from} threw ${throwEvent.item} at ${targetName}`
        );
      }
    }
  }, [throwEvent, participantId, room?.participants]);

  const removeThrowAnimation = useCallback((id: string) => {
    setThrowAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleVote = (value: string) => {
    setSelectedCard(value);
    setSelectedEmoji(null);
    vote(value);
  };

  const handleEmojiVote = (emoji: string) => {
    setSelectedCard('emoji');
    setSelectedEmoji(emoji);
    vote(emoji);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    showToast('Room code copied!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  const handleThrow = (toId: string, toName: string) => {
    const item = THROWABLES[Math.floor(Math.random() * THROWABLES.length)];
    throwItem(toId, item);
    showToast(`Threw ${item} at ${toName}!`);
  };

  const handleKick = (targetId: string, targetName: string) => {
    if (confirm(`Remove ${targetName} from the room?`)) {
      kickParticipant(targetId);
      showToast(`Removed ${targetName}`);
    }
  };

  // Kicked
  if (kicked) {
    return <KickedScreen />;
  }

  // Loading
  if (initialCheck) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative z-10">
        <motion.div
          className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Join
  if (!participantId) {
    return (
      <div className="relative z-10">
        <JoinScreen
          roomId={roomId}
          onJoin={(id) => {
            localStorage.setItem(`pp-${roomId}`, id);
            setParticipantId(id);
          }}
        />
      </div>
    );
  }

  // Connecting
  if (!room) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-white/40 text-sm">Connecting to room...</p>
        </div>
      </div>
    );
  }

  const me = room.participants.find((p) => p.id === participantId);
  const isHost = me?.isHost ?? false;
  const someVoted = room.participants.some((p) => p.hasVoted);
  const votedCount = room.participants.filter((p) => p.hasVoted).length;
  const canVote = !room.revealed;

  return (
    <div className="min-h-[100dvh] flex flex-col relative z-10">
      {/* ===== HEADER ===== */}
      <header className="glass border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="text-base sm:text-xl shrink-0">&#127183;</span>
            <h1 className="font-bold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-none">
              {room.name}
            </h1>
            <button
              onClick={handleCopyCode}
              className="px-1.5 sm:px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] sm:text-[11px] font-mono text-violet-300 transition-colors cursor-pointer shrink-0"
              title="Click to copy room code"
            >
              {room.id}
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mr-0.5 sm:mr-1">
              <div
                className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}
              />
              <span className="text-[10px] sm:text-[11px] text-white/30 hidden sm:inline">
                {connected ? 'Live' : 'Reconnecting...'}
              </span>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-white/5 text-[10px] sm:text-[11px] text-white/50">
              &#128101; {room.participants.length}
            </div>

            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] sm:text-[11px] text-white/50 hover:text-white/70 transition-colors cursor-pointer"
            >
              &#128203;
              <span className="hidden sm:inline">History</span>
              {room.history.length > 0 && (
                <span className="px-1 rounded-full bg-violet-500/30 text-violet-300 text-[9px]">
                  {room.history.length}
                </span>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] sm:text-[11px] text-white/50 hover:text-white/70 transition-colors cursor-pointer"
            >
              &#128279;
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== TOPIC ===== */}
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-4 py-2.5 sm:py-4">
        {isHost ? (
          <input
            type="text"
            value={room.currentRound.topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What are we estimating? (tap to set topic)"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/80 placeholder:text-white/20 text-xs sm:text-sm transition-colors"
          />
        ) : room.currentRound.topic ? (
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] sm:text-[11px] text-white/30 mr-1">
              Topic:
            </span>
            <span className="text-xs sm:text-sm text-white/70">
              {room.currentRound.topic}
            </span>
          </div>
        ) : null}
      </div>

      {/* ===== TABLE ===== */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 pb-[130px] sm:pb-[160px]">
        <div
          className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-8 mb-4 sm:mb-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(139,92,246,0.03), rgba(6,182,212,0.02))',
          }}
        >
          {/* Status + Controls */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs text-white/30">
                {room.revealed
                  ? 'Votes revealed'
                  : `${votedCount}/${room.participants.length} voted`}
              </span>
              {!room.revealed && someVoted && (
                <div className="flex -space-x-0.5">
                  {room.participants.map((p) => (
                    <div
                      key={p.id}
                      className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full border border-[#13111C] transition-colors ${
                        p.hasVoted ? 'bg-emerald-400' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {isHost && (
              <div className="flex items-center gap-2">
                {!room.revealed && someVoted && (
                  <motion.button
                    onClick={() => reveal()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-lg shadow-violet-500/20"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    &#128064; Reveal
                  </motion.button>
                )}
                {room.revealed && (
                  <motion.button
                    onClick={() => reset()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-lg shadow-pink-500/20"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    &#10227; New Round
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Participants Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 sm:gap-3 justify-items-center">
            <AnimatePresence>
              {room.participants.map((p) => (
                <ParticipantCardUI
                  key={p.id}
                  participant={p}
                  revealed={room.revealed}
                  isCurrentUser={p.id === participantId}
                  isHost={isHost}
                  isNudged={
                    !!nudge &&
                    nudge.to === participantId &&
                    p.id === participantId
                  }
                  onNudge={() => {
                    nudgeParticipant(p.id);
                    showToast(`Nudged ${p.name}!`);
                  }}
                  onThrow={() => handleThrow(p.id, p.name)}
                  onKick={() => handleKick(p.id, p.name)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Statistics */}
        <AnimatePresence>
          {room.revealed && (
            <VoteStatistics participants={room.participants} />
          )}
        </AnimatePresence>
      </div>

      {/* ===== CARD DECK ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-bottom">
        <div
          className="border-t border-white/5"
          style={{
            background:
              'linear-gradient(to top, rgba(13,11,20,0.97), rgba(13,11,20,0.85))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="max-w-4xl mx-auto px-2 py-2.5 sm:px-4 sm:py-4">
            <div
              className={`flex items-end justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar px-1 ${
                !canVote ? 'opacity-40 pointer-events-none' : ''
              }`}
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {CARD_VALUES.map((value, i) => (
                <PokerCard
                  key={value}
                  value={value}
                  selected={selectedCard === value}
                  disabled={!canVote}
                  onClick={() => handleVote(value)}
                  index={i}
                />
              ))}
              <EmojiSwitcherCard
                selected={selectedCard === 'emoji'}
                disabled={!canVote}
                selectedEmoji={selectedEmoji}
                onSelect={handleEmojiVote}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== OVERLAYS ===== */}
      <NudgeOverlay from={nudge ? nudge.from : null} />
      <Toast message={toast} show={!!toast} />
      <HistoryPanel
        history={room.history}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Throw animations */}
      <AnimatePresence>
        {throwAnimations.map((anim) => (
          <ThrowProjectile
            key={anim.id}
            item={anim.item}
            onComplete={() => removeThrowAnimation(anim.id)}
          />
        ))}
      </AnimatePresence>

      {/* Nudge screen flash */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-30 border-4 border-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Throw impact flash */}
      <AnimatePresence>
        {throwAnimations.length > 0 && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.15, 0],
              backgroundColor: ['rgba(255,200,0,0)', 'rgba(255,200,0,0.15)', 'rgba(255,200,0,0)'],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
