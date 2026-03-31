import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Heart, Share2, Download, ArrowLeft, 
  Star, Clock, Calendar, Loader2, Cast, Film, X 
} from 'lucide-react';
import { supabase } from '../supabase';

export default function Filme() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ESTADOS DO FILME
  const [loading, setLoading] = useState(true);
  const [isFavorito, setIsFavorito] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [filme, setFilme] = useState<any>(null);

  // NOVOS ESTADOS PREMIUM
  const [filmesSemelhantes, setFilmesSemelhantes] = useState<any[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    // Rola para o topo sempre que o ID mudar (útil ao clicar num filme semelhante)
    window.scrollTo(0, 0);
    carregarDadosDoFilme();
  }, [id]);

  const carregarDadosDoFilme = async () => {
    setLoading(true);
    
    // 1. Verificar se o sistema está em manutenção (Integração Admin)
    const { data: config } = await supabase.from('configuracoes').select('modo_manutencao').eq('id', 1).single();
    if (config?.modo_manutencao) {
      navigate('/'); 
      return;
    }

    // 2. Busca os detalhes do filme no Supabase
    const { data, error } = await supabase.from('filmes').select('*').eq('id', id).single();

    if (error || !data) {
      await supabase.from('tickets').insert([{
        tipo: 'Erro de Link',
        obra: `ID: ${id}`,
        mensagem: `Tentativa de acesso a obra não encontrada ou erro de busca: ${error?.message}`,
        status: 'Pendente'
      }]);
      alert("Sinal perdido. Filme não encontrado ou fora do ar.");
      navigate('/home');
      return;
    }
    setFilme(data);

    // 3. Busca Filmes Semelhantes (Exclui o atual)
    // Dica Pro: Aqui poderia filtrar pelo mesmo 'genero', mas para já traz os últimos adicionados
    const { data: semelhantesData } = await supabase.from('filmes').select('*').neq('id', id).limit(6);
    if (semelhantesData) setFilmesSemelhantes(semelhantesData);

    verificarFavorito();
    setLoading(false);
  };

  const verificarFavorito = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('favoritos').select('id').eq('user_id', user.id).eq('filme_id', id).single();
    if (data) setIsFavorito(true);
  };

  const toggleFavorito = async () => {
    setIsFavoriting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Faça login para adicionar aos favoritos!");
      setIsFavoriting(false);
      return;
    }

    if (isFavorito) {
      await supabase.from('favoritos').delete().eq('user_id', user.id).eq('filme_id', id);
      setIsFavorito(false);
    } else {
      try {
        await supabase.from('favoritos').insert({ user_id: user.id, filme_id: id });
        setIsFavorito(true);
      } catch (error) {
        setIsFavorito(true); 
      }
    }
    setIsFavoriting(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: filme.titulo,
        text: `Venha assistir ${filme.titulo} no Cineverse Platinum!`,
        url: window.location.href
      });
    } catch (e) {
      alert("Link do filme copiado!");
    }
  };

  if (loading || !filme) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden pb-32">
      
      {/* MODAL DE TRAILER PREMIUM */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <button onClick={() => setShowTrailer(false)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <X size={24} />
            </button>
            <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(155,44,186,0.2)]">
              {filme.trailer_url ? (
                <iframe src={filme.trailer_url.replace("watch?v=", "embed/") + "?autoplay=1"} className="w-full h-full" allowFullScreen allow="autoplay" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                  <Film size={60} className="mb-4 text-[#9B2CBA]/50" />
                  <p className="text-sm font-black uppercase tracking-widest">Sinal de Trailer Indisponível</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR FLUTUANTE */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center pointer-events-auto transition-colors hover:bg-black/60 shadow-xl">
          <ArrowLeft size={20} />
        </motion.button>
        <Cast size={20} className="text-white/40 pointer-events-auto" />
      </nav>

      {/* HERO BANNER (CAPA DO FILME) */}
      <div className="relative h-[65vh] w-full">
        <img src={filme.banner_url || filme.poster_url} alt="Capa" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#020205]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 inset-x-0 px-6 pb-6 flex flex-col justify-end z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            
            {/* TAGS (4K, VIP, etc) */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-[#9B2CBA]/20 border border-[#9B2CBA]/50 text-[#9B2CBA] text-[9px] font-black uppercase tracking-widest inline-block">Filme VIP</span>
              {(filme.tags || []).map((tag: string, i: number) => (
                <span key={i} className={`px-2 py-0.5 rounded bg-white/5 border text-[9px] font-black uppercase tracking-widest ${tag.includes('4K') || tag.includes('8D') ? 'border-[#9B2CBA]/50 text-[#9B2CBA]' : 'border-white/10 text-white/50'}`}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl max-w-3xl">
              {filme.titulo}
            </h1>
            
            <div className="flex items-center gap-4 mt-3 text-[11px] font-black uppercase tracking-widest text-white/60">
              <span className="flex items-center gap-1.5 text-green-400 drop-shadow-md"><Star size={14} fill="currentColor" /> {filme.nota || '9.0'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {filme.ano || '2025'}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {filme.duracao || '120 min'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AÇÕES (PLAY, TRAILER, FAVORITO) - Agora sincronizado com Serie.tsx */}
      <div className="px-6 mt-4 flex gap-3 md:max-w-xl relative z-20">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/player/${id}`)} 
          className="flex-1 py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-transform"
        >
          <Play size={16} fill="currentColor" /> Assistir
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTrailer(true)}
          className="flex-1 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-colors"
        >
          <Film size={16} /> Trailer
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleFavorito}
          disabled={isFavoriting}
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isFavorito ? 'bg-[#9B2CBA]/20 border-[#9B2CBA] text-[#9B2CBA] shadow-[0_0_15px_rgba(155,44,186,0.3)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
        >
          {isFavoriting ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} fill={isFavorito ? "currentColor" : "none"} />}
        </motion.button>
      </div>

      {/* AÇÕES SECUNDÁRIAS (DOWNLOAD E SHARE) */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4 md:max-w-xl">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => alert("Baixando em segundo plano...")} className="py-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors">
          <Download size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Baixar Localmente</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare} className="py-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors">
          <Share2 size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Partilhar Link</span>
        </motion.button>
      </div>

      {/* SINOPSE E DETALHES */}
      <div className="px-6 mt-10 space-y-6 md:max-w-3xl">
        <div>
          <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3 border-l-2 border-[#9B2CBA] pl-3">Sinopse da Obra</h3>
          <p className="text-sm text-white/70 leading-relaxed font-medium md:text-base">
            {filme.sinopse}
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/5">
          <p className="text-xs">
            <span className="text-white/40 font-bold tracking-wider mr-2">DIREÇÃO:</span> <span className="font-medium">{filme.diretor || 'Indisponível'}</span>
          </p>
          <p className="text-xs">
            <span className="text-white/40 font-bold tracking-wider mr-2">ELENCO VIP:</span> <span className="font-medium">{filme.elenco || 'Indisponível'}</span>
          </p>
        </div>
      </div>

      {/* CARROSSEL DE FILMES SEMELHANTES */}
      {filmesSemelhantes.length > 0 && (
        <div className="mt-16 space-y-4">
          <div className="px-6">
            <h3 className="text-[13px] font-black uppercase tracking-widest border-l-2 border-[#9B2CBA] pl-3">
              Títulos Semelhantes
            </h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto px-6 pb-8 custom-scrollbar snap-x snap-mandatory">
            {filmesSemelhantes.map((item: any) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/filme/${item.id}`)}
                className="relative min-w-[130px] md:min-w-[160px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group snap-center border border-white/5 shadow-xl bg-[#111]"
              >
                <img src={item.poster_url} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <Play size={24} className="text-[#9B2CBA] mb-2 drop-shadow-[0_0_10px_rgba(155,44,186,0.8)]" fill="currentColor" />
                  <span className="text-[10px] font-bold uppercase tracking-widest truncate">{item.titulo}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}