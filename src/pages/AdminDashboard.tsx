import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  QrCode, 
  Settings,
  Users
} from 'lucide-react';
import { supabase, type VoteRecord } from '../lib/supabase';
import { GlassCard } from '../components/GlassCard';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedGender, setRevealedGender] = useState<'boy' | 'girl' | null>(null);

  useEffect(() => {
    fetchVotes();

    const subscription = supabase
      .channel('admin_votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, fetchVotes)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchVotes = async () => {
    const { data } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
    if (data) setVotes(data);
    setLoading(false);
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete all votes? This cannot be undone.')) return;
    
    setLoading(true);
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    fetchVotes();
  };

  const handleReveal = (gender: 'boy' | 'girl') => {
    setIsRevealing(true);
    setRevealedGender(gender);
    
    const color = gender === 'boy' ? '#3b82f6' : '#ec4899';
    
    // Initial explosion
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.5 },
      colors: [color, '#ffffff', '#ffd700']
    });

    // Fireworks effect
    const end = Date.now() + 10 * 1000;
    const interval: any = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [color]
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [color]
      });
    }, 250);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Vote', 'Device ID', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...votes.map(v => `${v.name},${v.vote},${v.device_id},${v.created_at}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-shower-votes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredVotes = votes.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.vote.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-premium pb-20">
      {/* Admin Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-luxury-gold p-2 rounded-xl">
              <Settings className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Event <span className="text-luxury-gold">Control Center</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              <Trash2 size={18} />
              Reset
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-luxury-gold">
            <div className="p-3 bg-luxury-gold/10 rounded-2xl text-luxury-gold">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Votes</p>
              <h3 className="text-3xl font-black text-slate-800">{votes.length}</h3>
            </div>
          </GlassCard>
          
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <span className="text-2xl">👦</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Boy Votes</p>
              <h3 className="text-3xl font-black text-slate-800">{votes.filter(v => v.vote === 'boy').length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 border-l-4 border-l-pink-500">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
              <span className="text-2xl">👧</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Girl Votes</p>
              <h3 className="text-3xl font-black text-slate-800">{votes.filter(v => v.vote === 'girl').length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <QrCode size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">QR Scans</p>
              <h3 className="text-3xl font-black text-slate-800">{votes.length + 5}</h3> {/* Mock scan count */}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Vote Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Live Vote Feed</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search guests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-luxury-gold transition-all"
                />
              </div>
            </div>

            <GlassCard className="p-0 overflow-hidden border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Guest Name</th>
                    <th className="px-6 py-4">Prediction</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVotes.map((vote) => (
                    <tr key={vote.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{vote.name}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase",
                          vote.vote === 'boy' ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
                        )}>
                          {vote.vote} {vote.vote === 'boy' ? '👦' : '👧'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(vote.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {filteredVotes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-medium">
                        {loading ? "Loading votes..." : "No votes found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            {/* Reveal Control */}
            <GlassCard className="bg-slate-900 border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Eye className="text-luxury-gold" />
                Grand Reveal
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleReveal('boy')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20"
                >
                  It's a BOY!
                </button>
                <button
                  onClick={() => handleReveal('girl')}
                  className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pink-900/20"
                >
                  It's a GIRL!
                </button>
              </div>
              <p className="mt-4 text-slate-400 text-sm text-center">
                Clicking reveal triggers celebration on all screens!
              </p>
            </GlassCard>

            {/* Event QR */}
            <GlassCard className="flex flex-col items-center text-center space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Event QR Code</h3>
              <div className="bg-white p-4 rounded-3xl shadow-inner border border-slate-100">
                <QRCodeSVG value={window.location.origin} size={180} level="H" />
              </div>
              <p className="text-slate-500 text-sm font-medium px-4">
                Guests scan this code at the venue to start predicting!
              </p>
              <button className="text-luxury-gold font-bold hover:underline">
                Print QR Flyer
              </button>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Reveal Overlay */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col items-center justify-center p-10",
              revealedGender === 'boy' ? "bg-blue-600" : "bg-pink-600"
            )}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center space-y-8"
            >
              <h2 className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-2xl">
                It's a {revealedGender}!
              </h2>
              <div className="text-[12rem] md:text-[18rem] drop-shadow-2xl">
                {revealedGender === 'boy' ? '👦' : '👧'}
              </div>
              <button 
                onClick={() => {
                  setIsRevealing(false);
                  setRevealedGender(null);
                }}
                className="bg-white text-slate-900 px-10 py-4 rounded-full font-black text-xl hover:scale-110 transition-transform shadow-2xl"
              >
                CLOSE CELEBRATION
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
