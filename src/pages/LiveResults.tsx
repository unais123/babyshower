import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { supabase, type VoteRecord } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

const LiveResults: React.FC = () => {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [lastVote, setLastVote] = useState<VoteRecord | null>(null);

  useEffect(() => {
    fetchVotes();

    const subscription = supabase
      .channel('votes_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
        const newVote = payload.new as VoteRecord;
        setVotes((prev) => [...prev, newVote]);
        setLastVote(newVote);
        
        // Trigger small confetti burst for each vote
        const color = newVote.vote === 'boy' ? '#3b82f6' : '#ec4899';
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.8 },
          colors: [color, '#ffffff']
        });

        // Hide notification after 5s
        setTimeout(() => setLastVote(null), 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchVotes = async () => {
    const { data } = await supabase.from('votes').select('*').order('created_at', { ascending: true });
    if (data) setVotes(data);
  };

  const boyVotes = votes.filter(v => v.vote === 'boy').length;
  const girlVotes = votes.filter(v => v.vote === 'girl').length;
  const total = votes.length;
  
  // Clamp percentages between 15% and 85% to keep both sides visible
  const rawBoyPercent = total > 0 ? (boyVotes / total) * 100 : 50;
  const displayBoyPercent = Math.min(Math.max(rawBoyPercent, 15), 85);
  const displayGirlPercent = 100 - displayBoyPercent;

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-900 font-premium">
      {/* Boy Side */}
      <motion.div 
        animate={{ width: `${displayBoyPercent}%` }}
        className="relative h-full bg-blue-600 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center border-r-8 border-white/30 z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400/40 via-transparent to-transparent opacity-60" />
        
        <motion.div
          key={boyVotes}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="text-8xl md:text-[14rem] font-black text-white text-glow-boy leading-none drop-shadow-2xl">
            {boyVotes}
          </span>
          <div className="mt-8 px-8 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em]">
              Team Boy 👦
            </span>
          </div>
        </motion.div>
        
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-2xl font-black uppercase tracking-widest">
          {Math.round(rawBoyPercent)}%
        </div>
      </motion.div>

      {/* Girl Side */}
      <motion.div 
        animate={{ width: `${displayGirlPercent}%` }}
        className="relative h-full bg-pink-600 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400/40 via-transparent to-transparent opacity-60" />
        
        <motion.div
          key={girlVotes}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="text-8xl md:text-[14rem] font-black text-white text-glow-girl leading-none drop-shadow-2xl">
            {girlVotes}
          </span>
          <div className="mt-8 px-8 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em]">
              Team Girl 👧
            </span>
          </div>
        </motion.div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-2xl font-black uppercase tracking-widest">
          {Math.round(100 - rawBoyPercent)}%
        </div>
      </motion.div>

      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="bg-white text-slate-900 w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black shadow-[0_0_80px_rgba(255,255,255,0.6)] border-[12px] border-slate-900"
        >
          VS
        </motion.div>
      </div>

      {/* Recent Vote Notification */}
      <AnimatePresence>
        {lastVote && (
          <motion.div
            initial={{ y: 150, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 150, opacity: 0, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-50 glass-dark px-10 py-6 rounded-3xl flex items-center gap-6 text-white border-white/20"
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg",
              lastVote.vote === 'boy' ? "bg-blue-500" : "bg-pink-500"
            )}>
              {lastVote.vote === 'boy' ? '👦' : '👧'}
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight">{lastVote.name}</span>
              <p className="text-lg opacity-80 font-medium">just voted for Team {lastVote.vote === 'boy' ? 'Boy' : 'Girl'}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Votes Count */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-16 py-4 rounded-full flex items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Users className="text-white w-8 h-8" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" 
              />
            </div>
            <span className="text-white font-black text-3xl tracking-tighter">{total} VOTES</span>
          </div>
        </div>
      </div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 2000, 
              y: 1200 
            }}
            animate={{ 
              y: -200,
              rotate: 360,
              x: (Math.random() - 0.5) * 500 + (Math.random() * 2000)
            }}
            transition={{
              duration: Math.random() * 25 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 20
            }}
            className="absolute text-white text-5xl"
          >
            {['🍼', '🧸', '👣', '👶', '✨'][i % 5]}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveResults;
