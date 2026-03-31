import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, } from 'framer-motion';
import { Play, Info, Plus, Search, Bell, User, Loader2, Star } from 'lucide-react';
import { supabase } from '../supabase';
import BottomNav from '../components/BottomNav';

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [avatar, setAvatar] = useState('');
  
  const [destaque, setDestaque] = useState<any>(null);
  const [trilhos, setTrilhos] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [temNotificacao, setTemNotificacao] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const carregarCatalogo = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAvatar(user?.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/notionists/svg?seed=${user?.user_metadata?.full_name || 'VIP'}`);
      }

      const { data: destaqueDB } = await supabase.from('destaques').select('*').eq('ativo', true).order('created_at', { ascending: false }).limit(1).single();
      const { data: filmesData } = await supabase.from('filmes').select('*').order('created_at', { ascending: false });
      const { data: seriesData } = await supabase.from('series').select('*').order('created_at', { ascending: false });

      const { count } = await supabase.from('notificacoes').select('*', { count: 'exact', head: true });
      setTemNotificacao(count ? count > 0 : false);

      if (user && (filmesData || seriesData)) {
        const { data: histDB } = await supabase
          .from('historico')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (histDB && histDB.length > 0) {
          const listaContinuar = histDB.map(h => {
            const obra = h.tipo === 'filme' 
              ? filmesData?.find(f => f.id === h.conteudo_id)
              : seriesData?.find(s => s.id === h.conteudo_id);
            
            if (obra) {
              const progressoCalculado = (h.tempo_atual / h.tempo_total) * 100;
              return { ...obra, tipo: h.tipo, progresso: progressoCalculado };
            }
            return null;
          }).filter(Boolean);

          setHistorico(listaContinuar);
        }
      }

      if ((filmesData && filmesData.length > 0) || (seriesData && seriesData.length > 0)) {
        
        const principal = destaqueDB || (filmesData && filmesData[0]) || (seriesData && seriesData[0]);
        setDestaque({
          id: principal.id,
          titulo: principal.titulo,
          tags: principal.tags || ['VIP', '4K Ultra HD', principal.genero],
          sinopse: principal.sinopse || "Conteúdo exclusivo selecionado para sua experiência VIP.",
          banner_url: principal.banner_url || principal.poster_url,
          tipo: principal.video_url ? 'filme' : 'serie',
          nota: principal.nota || '9.5'
        });

        const catalogoCompleto = [
          ...(filmesData || []).map(f => ({ ...f, tipo: 'filme' })),
          ...(seriesData || []).map(s => ({ ...s, tipo: 'serie' }))
        ];

        const novosTrilhos = [];

        const recentes = [...catalogoCompleto].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);
        if (recentes.length > 0) {
          novosTrilhos.push({ titulo: 'Adicionados Recentemente', itens: recentes });
        }

        if (filmesData && filmesData.length > 0) {
          novosTrilhos.push({ titulo: 'Filmes em Destaque', itens: filmesData.map(f => ({ ...f, tipo: 'filme' })) });
        }

        if (seriesData && seriesData.length > 0) {
          novosTrilhos.push({ titulo: 'Séries Exclusivas', itens: seriesData.map(s => ({ ...s, tipo: 'serie' })) });
        }

        const generosUnicos = Array.from(new Set(catalogoCompleto.map(item => item.genero).filter(g => g && g.trim() !== '')));

        generosUnicos.forEach(genero => {
          const itensDesteGenero = catalogoCompleto.filter(item => item.genero === genero);
          if (itensDesteGenero.length >= 3) {
            novosTrilhos.push({ titulo: `Explorar: ${genero}`, itens: itensDesteGenero });
          }
        });

        setTrilhos(novosTrilhos);
      }
      setLoading(false);
    };

    carregarCatalogo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
      </div>
    );
  }

  if (!destaque) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center text-white">
        <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Catálogo em manutenção.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden pb-40">
      
      {/* NAVBAR FLUTUANTE - AGORA COM A LOGO OFICIAL */}
      <motion.nav 
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-[#020205]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}
      >
        {/* LOGO EM IMAGEM - MESMAS CLASSES DE DESIGN ANTERIORES */}
        <div className="flex items-center">
          <img 
            src="/logo.png" // O SEU FICHEIRO DE LOGO NA PASTA PUBLIC
            alt="Cineverse Logo" 
            className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(155,44,186,0.6)]" 
          />
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/busca')} className="text-white/80 hover:text-white transition-colors">
            <Search size={22} className="md:w-6 md:h-6" />
          </motion.button>
          
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/notificacoes')} className="text-white/80 hover:text-white relative transition-colors">
            <Bell size={22} className="md:w-6 md:h-6" />
            {temNotificacao && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#9B2CBA] rounded-full border-2 border-[#020205] animate-pulse shadow-[0_0_10px_#9B2CBA]" />
            )}
          </motion.button>

          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/perfil')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-[#9B2CBA] transition-colors shadow-lg"
          >
            {avatar ? <img src={avatar} alt="Perfil" className="w-full h-full object-cover" /> : <User size={20} className="m-1 text-white/50" />}
          </motion.div>
        </div>
      </motion.nav>

      {/* HERO BANNER - CINEMATOGRÁFICO */}
      <div className="relative h-[75vh] md:h-[85vh] w-full flex items-end justify-start pb-16 px-6 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }} 
          animate={{ scale: 1 }} 
          transition={{ duration: 15, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img src={destaque.banner_url} alt="Destaque" className="w-full h-full object-cover" />
        </motion.div>
        
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020205] via-[#020205]/50 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#020205]/90 via-[#020205]/30 to-transparent" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 max-w-lg md:max-w-2xl space-y-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#9B2CBA]/20 border border-[#9B2CBA]/50 text-[#9B2CBA] text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(155,44,186,0.3)]">
              Destaque VIP
            </span>
            <span className="flex items-center gap-1 text-green-400 text-[10px] font-black tracking-widest uppercase drop-shadow-md">
              <Star size={12} fill="currentColor" /> {destaque.nota} Relevância
            </span>
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none drop-shadow-2xl">
            {destaque.titulo}
          </h2>
          
          <p className="text-sm md:text-base text-white/70 line-clamp-3 leading-relaxed max-w-sm md:max-w-xl drop-shadow-md">
            {destaque.sinopse}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(destaque.tipo === 'filme' ? `/filme/${destaque.id}` : `/serie/${destaque.id}`)}
              className="flex-1 md:flex-none py-3.5 px-8 rounded-full bg-white text-black flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-200 transition-colors"
            >
              <Play size={18} fill="currentColor" /> Assistir
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(destaque.tipo === 'filme' ? `/filme/${destaque.id}` : `/serie/${destaque.id}`)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
              title="Informações"
            >
              <Info size={20} className="md:size-6" />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
              title="Minha Lista"
            >
              <Plus size={20} className="md:size-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="space-y-10 md:space-y-14 relative z-10 -mt-6">

        {/* CONTINUAR ASSISTINDO */}
        {historico.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <div className="px-6 md:px-10">
              <h3 className="text-[13px] md:text-[15px] font-black uppercase tracking-widest border-l-2 border-[#9B2CBA] pl-3 drop-shadow-md">
                Continuar Assistindo
              </h3>
            </div>

            <div className="flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-10 pb-6 custom-scrollbar snap-x snap-mandatory">
              {historico.map((item: any) => (
                <motion.div 
                  key={`hist-${item.id}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/player/${item.id}?tipo=${item.tipo}`)}
                  className="relative min-w-[200px] md:min-w-[280px] aspect-video rounded-2xl overflow-hidden cursor-pointer group snap-center border border-white/10 shadow-xl bg-[#111]"
                >
                  <img src={item.banner_url || item.poster_url} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 flex flex-col justify-end transition-colors group-hover:from-black/80">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-[#9B2CBA]/80 rounded-full flex items-center justify-center shadow-[0_0_20px_#9B2CBA] backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform">
                           <Play size={20} className="text-white ml-1" fill="currentColor" />
                        </div>
                    </div>
                    
                    <h4 className="text-[11px] md:text-sm font-bold text-white truncate mb-3 drop-shadow-md">{item.titulo}</h4>
                    
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#9B2CBA] shadow-[0_0_10px_#9B2CBA]" style={{ width: `${item.progresso}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* MÚLTIPLOS TRILHOS DINÂMICOS */}
        {trilhos.map((trilho, index) => (
          <motion.section 
            key={trilho.titulo}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.05 }}
            className="space-y-4"
          >
            <div className="px-6 md:px-10">
              <h3 className="text-[13px] md:text-[15px] font-black uppercase tracking-widest border-l-2 border-[#9B2CBA] pl-3 drop-shadow-md">
                {trilho.titulo}
              </h3>
            </div>

            <div className="flex gap-4 md:gap-5 overflow-x-auto px-6 md:px-10 pb-6 custom-scrollbar snap-x snap-mandatory">
              {trilho.itens.map((item: any) => (
                <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(item.tipo === 'filme' ? `/filme/${item.id}` : `/serie/${item.id}`)}
                    className="relative min-w-[130px] md:min-w-[180px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer group snap-center border border-white/5 hover:border-[#9B2CBA]/50 hover:shadow-[0_10px_30px_rgba(155,44,186,0.2)] bg-[#111] transition-all duration-300"
                >
                  <img src={item.poster_url} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  {trilho.titulo === 'Adicionados Recentemente' && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-[#9B2CBA] shadow-lg">
                      Novo
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 group-hover:h-full group-hover:from-black/95 group-hover:via-black/60">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <Play size={32} className="text-[#9B2CBA] drop-shadow-[0_0_15px_#9B2CBA] transform scale-50 group-hover:scale-100 transition-transform" fill="currentColor" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest truncate text-white drop-shadow-md relative z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform">{item.titulo}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}