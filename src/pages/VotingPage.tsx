import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Baby, Heart, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { getDeviceId, hasVoted, setVoted } from '../lib/fingerprint';
import { cn } from '../lib/utils';

const VotingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [selection, setSelection] = useState<'boy' | 'girl' | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState({ boy: 0, girl: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasVoted()) {
      setAlreadyVoted(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from('votes').select('vote');
    if (data) {
      const boy = data.filter(v => v.vote === 'boy').length;
      const girl = data.filter(v => v.vote === 'girl').length;
      setStats({ boy, girl, total: data.length });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selection || loading) return;

    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      
      // Check for duplicate in DB just in case
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (existing) {
        setAlreadyVoted(true);
        setVoted();
        return;
      }

      const { error: insertError } = await supabase.from('votes').insert({
        name,
        vote: selection,
        device_id: deviceId
      });

      if (!insertError) {
        setVoted();
        setSubmitted(true);
        fetchStats();
      } else {
        setError(insertError.message);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted || alreadyVoted) {
    const boyPercent = stats.total > 0 ? Math.round((stats.boy / stats.total) * 100) : 50;
    const girlPercent = 100 - boyPercent;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <GlassCard className="max-w-md w-full text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <CheckCircle2 className="text-green-500 w-20 h-20" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-800">
            {alreadyVoted ? "Already Voted!" : "Thank You!"}
          </h2>
          <p className="text-slate-600">
            Your prediction has been recorded. Let's see what others think!
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex justify-between mb-2 font-bold">
              <span className="text-blue-600">Team Boy ({boyPercent}%)</span>
              <span className="text-pink-600">Team Girl ({girlPercent}%)</span>
            </div>
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${boyPercent}%` }}
                className="h-full bg-blue-500" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${girlPercent}%` }}
                className="h-full bg-pink-500" 
              />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 relative z-10">
      <div className="max-w-md mx-auto space-y-12">
        <header className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-3 rounded-full bg-white/50 backdrop-blur-sm border border-white/50 mb-4"
          >
            <Baby className="text-luxury-gold w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-800 tracking-tight"
          >
            Baby Shower <br />
            <span className="text-luxury-gold font-accent text-5xl">Predictions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium"
          >
            Predict the gender of our little one!
          </motion.p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold text-center"
            >
              {error === 'supabaseUrl is required.' ? 'Vercel Error: Supabase credentials missing in Dashboard.' : error}
            </motion.div>
          )}
          <GlassCard delay={0.1}>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider ml-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-slate-200 focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelection('boy')}
              className={cn(
                "relative group cursor-pointer",
                selection === 'boy' ? "z-20" : "z-10"
              )}
            >
              <div className={cn(
                "absolute -inset-1 bg-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
                selection === 'boy' && "opacity-75"
              )}></div>
              <GlassCard 
                className={cn(
                  "relative flex flex-col items-center justify-center h-48 border-2 transition-all duration-300",
                  selection === 'boy' ? "border-blue-500 bg-blue-50/50" : "border-transparent"
                )}
              >
                <div className="p-4 rounded-full bg-blue-100 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👦</span>
                </div>
                <span className="font-bold text-lg text-blue-700">Team Boy</span>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelection('girl')}
              className={cn(
                "relative group cursor-pointer",
                selection === 'girl' ? "z-20" : "z-10"
              )}
            >
              <div className={cn(
                "absolute -inset-1 bg-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
                selection === 'girl' && "opacity-75"
              )}></div>
              <GlassCard 
                className={cn(
                  "relative flex flex-col items-center justify-center h-48 border-2 transition-all duration-300",
                  selection === 'girl' ? "border-pink-500 bg-pink-50/50" : "border-transparent"
                )}
              >
                <div className="p-4 rounded-full bg-pink-100 text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👧</span>
                </div>
                <span className="font-bold text-lg text-pink-700">Team Girl</span>
              </GlassCard>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!name || !selection || loading}
            type="submit"
            className={cn(
              "w-full py-5 rounded-2xl font-bold text-xl text-white shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group",
              selection === 'boy' ? "bg-blue-600 shadow-blue-200" : 
              selection === 'girl' ? "bg-pink-600 shadow-pink-200" : 
              "bg-slate-800 shadow-slate-200"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Recording..." : "Cast Your Vote"}
              <Heart className="w-5 h-5 fill-current" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </form>

        <footer className="text-center text-slate-400 text-sm font-medium">
          <p>© 2024 Modern Baby Shower</p>
        </footer>
      </div>
    </div>
  );
};

export default VotingPage;
