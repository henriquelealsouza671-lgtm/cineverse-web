import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, Loader2, Sparkles, } from 'lucide-react';
import { supabase } from '../supabase';
import BottomNav from '../components/BottomNav';

export default function Notificacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  useEffect(() => {
    buscarNotificacoes();
  }, []);

  const buscarNotificacoes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotificacoes(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden pb-40 relative">
      
      {/* BACKGROUND GLOW PREMIUM */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_#9B2CBA10,_transparent_50%)] pointer-events-none" />

      {/* HEADER FIXO */}
      <div className="sticky top-0 inset-x-0 z-40 bg-[#020205]/80 backdrop-blur-2xl border-b border-white/5 pt-12 pb-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={() => navigate(-1)} 
              className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Alertas VIP</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#9B2CBA]/10 flex items-center justify-center border border-[#9B2CBA]/20">
            <Bell size={20} className="text-[#9B2CBA]" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="px-6 mt-8 relative z-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sincronizando Mensagens...</p>
          </div>
        ) : notificacoes.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {notificacoes.map((notif, index) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-sm relative overflow-hidden group active:bg-white/[0.05] transition-all"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#9B2CBA] opacity-50" />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9B2CBA]">
                      {notif.titulo}
                    </span>
                    <span className="text-[8px] font-bold text-white/20 uppercase">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white/90 leading-relaxed">
                    {notif.mensagem}
                  </h3>

                  <div className="mt-4 flex items-center gap-2 opacity-30">
                    <Sparkles size={12} className="text-[#9B2CBA]" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Cineverse Security Protocol</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <BellOff size={40} className="text-white/20" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter text-white mb-2">Silêncio no Set</h2>
            <p className="text-xs text-white/40 leading-relaxed max-w-[250px]">
              Nenhuma nova diretriz ou alerta foi emitido para sua conta Platinum até o momento.
            </p>
          </div>
        )}

      </div>

      {/* REUTILIZA SUA NAVBAR LEVITANTE */}
      <BottomNav />
    </div>
  );
}