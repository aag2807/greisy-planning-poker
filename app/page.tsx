'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BackgroundEffects from '@/components/BackgroundEffects';

export default function Home() {
  const router = useRouter();

  // Create form
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join form
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !hostName.trim()) return;

    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName.trim(),
          hostName: hostName.trim(),
          password: showPassword ? password : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setCreateError(data.error);
        setCreating(false);
        return;
      }

      // Store participant ID for this room
      localStorage.setItem(`pp-${data.roomId}`, data.participantId);
      router.push(`/room/${data.roomId}`);
    } catch {
      setCreateError('Failed to create room');
      setCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    router.push(`/room/${code}`);
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative">
      <BackgroundEffects />

      {/* ===== HERO ===== */}
      <motion.div
        className="text-center mb-8 sm:mb-14 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Suit symbols */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-5 text-2xl sm:text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            className="text-red-400/60"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            &#9824;
          </motion.span>
          <motion.span
            className="text-pink-400/60"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            &#9829;
          </motion.span>
          <motion.span
            className="text-cyan-400/60"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            &#9827;
          </motion.span>
          <motion.span
            className="text-amber-400/60"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          >
            &#9830;
          </motion.span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
          <span className="gradient-text">
            Greisy&apos;s
            <br />
            Planning Poker
          </span>
        </h1>

        <p className="text-white/40 text-base sm:text-lg max-w-md mx-auto">
          Estimate together. Ship faster.
        </p>
      </motion.div>

      {/* ===== ACTION CARDS ===== */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-2xl relative z-10">
        {/* Create Session */}
        <motion.div
          className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">&#10024;</span>
            <h2 className="text-lg font-bold">Create Session</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-[11px] text-white/40 mb-1 ml-1">
                Session Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Sprint 42 Planning"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm transition-colors"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1 ml-1">
                Your Name
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm transition-colors"
                maxLength={30}
              />
            </div>

            {/* Password toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? '🔓' : '🔒'}{' '}
                {showPassword ? 'Remove password' : 'Add password (optional)'}
              </button>

              {showPassword && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2"
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Room password"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm transition-colors"
                  />
                </motion.div>
              )}
            </div>

            {createError && (
              <p className="text-red-400 text-xs text-center">{createError}</p>
            )}

            <button
              type="submit"
              disabled={!roomName.trim() || !hostName.trim() || creating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-violet-500/20"
            >
              {creating ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        </motion.div>

        {/* Join Session */}
        <motion.div
          className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">&#128279;</span>
            <h2 className="text-lg font-bold">Join Session</h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] text-white/40 mb-1 ml-1">
                Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ABCDEF"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm font-mono tracking-widest text-center uppercase transition-colors"
                maxLength={6}
              />
            </div>

            <p className="text-[11px] text-white/20 text-center">
              Enter the 6-character code shared by your host
            </p>

            <button
              type="submit"
              disabled={joinCode.trim().length < 4}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Join Room
            </button>
          </form>
        </motion.div>
      </div>

      {/* ===== FOOTER ===== */}
      <motion.p
        className="text-white/15 text-xs mt-12 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Made for Greisy &#128156;
      </motion.p>
    </main>
  );
}
