import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, PlayCircle, Loader2, Film, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';

// IMPORTAÇÃO DA SUA NAVBAR LEVITANTE
import BottomNav from '../components/BottomNav';

export default function Favoritos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<any[]>([]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const carregarFavoritos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Busca os IDs que este usuário específico favoritou
      const { data: favs, error } = await supabase
        .from('favoritos')
        .select('filme_id')
        .eq('user_id', user.id);

      if (!error && favs && favs.length > 0) {
        const ids = favs.map((fav: any) => fav.filme_id);
        
        // 2. Busca os detalhes reais desses filmes
        const { data: filmesData } = await supabase
          .from('filmes')
          .select('*')
          .in('id', ids);

        if (filmesData) {
          const filmesFormatados = filmesData.map(f => ({
            id: f.id,
            titulo: f.titulo,
            poster: f.poster_url,
            genero: f.genero
          }));
          
          setFavoritos(filmesFormatados);
        }
      } else {
        setFavoritos([]);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden pb-40 relative">
      
      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_#9B2CBA10,_transparent_50%)] pointer-events-none" />

      {/* HEADER FIXO GLASSMORPHISM */}
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
            <h1 className="text-xl font-black italic tracking-tighter text-white">Minha Lista</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#9B2CBA]/10 flex items-center justify-center border border-[#9B2CBA]/20">
            <Heart size={20} className="text-[#9B2CBA]" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="px-6 mt-8 relative z-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sincronizando cofre VIP...</p>
          </div>
        ) : favoritos.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {favoritos.map((filme) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.8 }} 
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  key={filme.id}
                  onClick={() => navigate(`/filme/${filme.id}`)}
                  className="relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer group border border-white/5 shadow-2xl bg-[#0A0A0F]"
                >
                  <img src={filme.poster} alt={filme.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    <Heart size={14} className="text-[#9B2CBA]" fill="currentColor" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#9B2CBA]/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_#9B2CBA]">
                      <PlayCircle size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 inset-x-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#9B2CBA] mb-1 block">{filme.genero}</span>
                    <h3 className="text-xs font-bold leading-tight line-clamp-2">{filme.titulo}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col items-center justify-center text-center py-20 px-4"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#9B2CBA] blur-[50px] opacity-20 rounded-full" />
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl relative z-10 shadow-2xl">
                <Film size={40} className="text-[#9B2CBA] opacity-80" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles size={24} className="text-[#9B2CBA]" />
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-black italic tracking-tighter text-white mb-2">Seu Cofre está Vazio</h2>
            <p className="text-xs text-white/50 leading-relaxed mb-8 max-w-[280px]">
              Nenhum título favoritado ainda. Explore nosso catálogo e adicione suas obras favoritas aqui.
            </p>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/busca')}
              className="w-full max-w-[250px] py-4 rounded-2xl bg-[#9B2CBA] text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(155,44,186,0.3)]"
            >
              Explorar Catálogo
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* CHAMADA DA SUA NAVBAR OFICIAL */}
      <BottomNav />

    </div>
  );
}