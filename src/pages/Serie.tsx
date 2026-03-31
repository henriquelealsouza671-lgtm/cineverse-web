import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Heart, ArrowLeft, Star, 
  Loader2, Cast, ChevronDown, ListVideo, Film, X
} from 'lucide-react';
import { supabase } from '../supabase';

export default function Serie() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ESTADOS DA SÉRIE E EPISÓDIOS
  const [loading, setLoading] = useState(true);
  const [isFavorito, setIsFavorito] = useState(false);
  const [serie, setSerie] = useState<any>(null);
  const [episodios, setEpisodios] = useState<any[]>([]);
  const [temporadaAtiva, setTemporadaAtiva] = useState(1);
  
  // NOVOS ESTADOS PREMIUM
  const [seriesSemelhantes, setSeriesSemelhantes] = useState<any[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    // Rola para o topo sempre que o ID da série mudar
    window.scrollTo(0, 0);
    carregarDadosDaSerie();
  }, [id]);

  const carregarDadosDaSerie = async () => {
    setLoading(true);
    
    // 1. Busca os detalhes da série principal
    const { data: serieData, error } = await supabase.from('series').select('*').eq('id', id).single();

    if (error || !serieData) {
      alert("Sinal perdido. Série não encontrada.");
      navigate('/home');
      return;
    }
    setSerie(serieData);

    // 2. Busca todos os episódios desta série
    const { data: episData } = await supabase.from('episodios').select('*').eq('serie_id', id).order('temporada', { ascending: true }).order('numero', { ascending: true });
    if (episData) {
      setEpisodios(episData);
      // Define a temporada ativa como a primeira temporada disponível
      if (episData.length > 0) setTemporadaAtiva(episData[0].temporada);
    }
    
    // 3. Busca Séries Semelhantes (Exclui a atual)
    const { data: semelhantesData } = await supabase.from('series').select('*').neq('id', id).limit(6);
    if (semelhantesData) setSeriesSemelhantes(semelhantesData);

    verificarFavorito();
    setLoading(false);
  };

  const verificarFavorito = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('favoritos').select('id').eq('user_id', user.id).eq('serie_id', id).single();
    if (data) setIsFavorito(true);
  };

  const alternarFavorito = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Precisa de iniciar sessão.");

    if (isFavorito) {
      await supabase.from('favoritos').delete().eq('user_id', user.id).eq('serie_id', id);
      setIsFavorito(false);
    } else {
      await supabase.from('favoritos').insert([{ user_id: user.id, serie_id: id }]);
      setIsFavorito(true);
    }
  };

  // FUNÇÃO INTELIGENTE: Assistir ao primeiro episódio disponível
  const assistirPrimeiroEpisodio = () => {
    if (episodios.length > 0) {
      navigate(`/player/${episodios[0].id}?tipo=serie`);
    } else {
      alert("Os episódios desta série ainda não foram injetados no sistema.");
    }
  };

  // Filtra os episódios e descobre as temporadas
  const episodiosFiltrados = episodios.filter(ep => ep.temporada === temporadaAtiva);
  const totalTemporadas = Array.from(new Set(episodios.map(ep => ep.temporada))).sort((a, b) => a - b);

  if (loading || !serie) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020205] text-white font-sans pb-32">
      
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
              {serie.trailer_url ? (
                <iframe src={serie.trailer_url.replace("watch?v=", "embed/") + "?autoplay=1"} className="w-full h-full" allowFullScreen allow="autoplay" />
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

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors shadow-xl">
          <ArrowLeft size={20} />
        </motion.button>
        <Cast size={20} className="text-white/40 pointer-events-auto" />
      </nav>

      {/* HERO BANNER CINEMATOGRÁFICO */}
      <div className="relative h-[65vh] w-full">
        <img src={serie.banner_url || serie.poster_url} alt={serie.titulo} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#020205]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/80 to-transparent" />
        
        <div className="absolute bottom-0 inset-x-0 px-6 pb-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-0.5 rounded bg-[#9B2CBA]/20 border border-[#9B2CBA]/50 text-[#9B2CBA] text-[9px] font-black uppercase tracking-widest inline-block">Série VIP</span>
              {serie.genero && <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/80 text-[9px] font-black uppercase tracking-widest inline-block">{serie.genero}</span>}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl max-w-2xl">{serie.titulo}</h1>
            
            <div className="flex items-center gap-4 mt-3 text-[11px] font-black uppercase tracking-widest text-white/60">
              <span className="flex items-center gap-1.5 text-green-400 drop-shadow-md"><Star size={14} fill="currentColor" /> {serie.nota || '9.5'}</span>
              <span>{serie.ano || '2025'}</span>
              <span>{totalTemporadas.length} Temporadas</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AÇÕES (PLAY, TRAILER, FAVORITO) */}
      <div className="px-6 mt-4 flex gap-3 md:max-w-xl">
        <button 
          onClick={assistirPrimeiroEpisodio}
          className="flex-1 py-4 rounded-2xl bg-white text-black flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-transform"
        >
          <Play size={16} fill="currentColor" /> Começar Assistir
        </button>
        <button 
          onClick={() => setShowTrailer(true)}
          className="flex-1 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-colors"
        >
          <Film size={16} /> Trailer
        </button>
        <button 
          onClick={alternarFavorito} 
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all ${isFavorito ? 'bg-[#9B2CBA]/20 border-[#9B2CBA] text-[#9B2CBA] shadow-[0_0_15px_rgba(155,44,186,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
        >
          <Heart size={20} fill={isFavorito ? "currentColor" : "none"} />
        </button>
      </div>

      {/* SINOPSE */}
      <div className="px-6 mt-10 md:max-w-3xl">
        <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3">Sinopse da Obra</h3>
        <p className="text-sm text-white/70 leading-relaxed md:text-base">{serie.sinopse}</p>
      </div>

      {/* SELETOR DE TEMPORADAS */}
      <div className="px-6 mt-12 md:max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic tracking-tighter">Episódios</h3>
          {totalTemporadas.length > 0 && (
            <div className="relative">
              <select 
                value={temporadaAtiva} 
                onChange={(e) => setTemporadaAtiva(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none appearance-none pr-10 cursor-pointer hover:border-white/20 focus:border-[#9B2CBA] transition-colors"
              >
                {totalTemporadas.map(t => (
                  <option key={t} value={t} className="bg-[#0A0A0F]">Temporada {t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9B2CBA]" />
            </div>
          )}
        </div>

        {/* LISTA DE EPISÓDIOS */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {episodiosFiltrados.length > 0 ? (
              episodiosFiltrados.map((ep, index) => (
                <motion.div 
                  key={ep.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/player/${ep.id}?tipo=serie`)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#9B2CBA]/40 active:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="relative w-32 md:w-40 aspect-video rounded-xl overflow-hidden bg-[#111] flex-shrink-0 shadow-lg">
                    {/* Usa o poster_url específico do episódio se existir, caso contrário puxa o banner da série */}
                    <img src={ep.poster_url || serie.banner_url || serie.poster_url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#9B2CBA]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                        <Play size={14} fill="white" className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-widest mb-1">E0{ep.numero}</p>
                    <h4 className="text-sm md:text-base font-bold truncate group-hover:text-[#9B2CBA] transition-colors">{ep.titulo || `Capítulo ${ep.numero}`}</h4>
                    <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-tighter">Cineverse 8D Protocol</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                <ListVideo size={40} className="mb-3 text-white/20" />
                <p className="text-xs font-black uppercase tracking-widest text-white/40">Sinal Perdido</p>
                <p className="text-[10px] text-white/30 mt-1">Nenhum episódio detetado nesta temporada.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CARROSSEL DE SÉRIES SEMELHANTES */}
      {seriesSemelhantes.length > 0 && (
        <div className="mt-16 space-y-4">
          <div className="px-6">
            <h3 className="text-[13px] font-black uppercase tracking-widest border-l-2 border-[#9B2CBA] pl-3">
              Títulos Semelhantes
            </h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto px-6 pb-8 custom-scrollbar snap-x snap-mandatory">
            {seriesSemelhantes.map((item: any) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/serie/${item.id}`)}
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