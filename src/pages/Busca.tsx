import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Compass, Loader2 } from 'lucide-react'; // Limpeza de imports não utilizados
import { supabase } from '../supabase';

// IMPORTAÇÃO DA SUA NAVBAR LEVITANTE
import BottomNav from '../components/BottomNav';

export default function Busca() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Tudo');
  
  const [catalogoReal, setCatalogoReal] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Tudo']); 
  const [loading, setLoading] = useState(true);
  const [consultandoOraculo, setConsultandoOraculo] = useState(false);

  useEffect(() => {
    const carregarDadosSincronizados = async () => {
      setLoading(true);
      
      // 1. PUXAR CATEGORIAS REAIS DO SEU PAINEL ADM
      const { data: config } = await supabase
        .from('configuracoes')
        .select('categorias_app')
        .eq('id', 1)
        .single();

      if (config?.categorias_app) {
        const lista = config.categorias_app.split(',').map((c: string) => c.trim());
        setCategorias(['Tudo', ...lista]);
      }

      // 2. BUSCAR FILMES E SÉRIES
      const { data: filmes } = await supabase.from('filmes').select('*');
      const { data: series } = await supabase.from('series').select('*');

      const unificado: any[] = [];
      
      if (filmes) {
        filmes.forEach((f: any) => unificado.push({
          id: f.id,
          titulo: f.titulo,
          poster: f.poster_url,
          genero: f.genero || 'Sem Categoria', 
          tipo: 'filme'
        }));
      }

      if (series) {
        series.forEach((s: any) => unificado.push({
          id: s.id,
          titulo: s.titulo,
          poster: s.poster_url,
          genero: s.genero || 'Sem Categoria',
          tipo: 'serie'
        }));
      }

      setCatalogoReal(unificado);
      setResultados(unificado);
      setLoading(false);
    };

    carregarDadosSincronizados();
  }, []);

  // 3. LÓGICA DE FILTRO
  useEffect(() => {
    const filtrados = catalogoReal.filter(item => {
      const nomeFilme = item.titulo.toLowerCase();
      const termoBusca = busca.toLowerCase();
      
      const bateCategoria = filtroCategoria === 'Tudo' || 
        item.genero.trim().toLowerCase() === filtroCategoria.trim().toLowerCase();

      return nomeFilme.includes(termoBusca) && bateCategoria;
    });
    setResultados(filtrados);
  }, [busca, filtroCategoria, catalogoReal]);

  const handleSurpreendaMe = () => {
    if (catalogoReal.length === 0) return;
    setConsultandoOraculo(true);
    const sorteado = catalogoReal[Math.floor(Math.random() * catalogoReal.length)];
    setTimeout(() => {
      setConsultandoOraculo(false);
      navigate(sorteado.tipo === 'filme' ? `/filme/${sorteado.id}` : `/serie/${sorteado.id}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden pb-40 relative">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,_#9B2CBA15,_transparent_40%)] pointer-events-none" />

      <div className="sticky top-0 inset-x-0 z-40 bg-[#020205]/90 backdrop-blur-xl border-b border-white/5 pt-12 pb-6 px-6 space-y-6">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><ArrowLeft size={20} /></motion.button>
          <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Explorar</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B2CBA]" size={22} />
          <input 
            type="text" 
            placeholder="Buscar no Cineverse..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-white outline-none focus:border-[#9B2CBA] shadow-xl" 
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {categorias.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filtroCategoria === cat ? 'bg-white text-black shadow-[0_0_15px_#fff]' : 'bg-white/5 border border-white/10 text-white/50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 relative z-10 space-y-8">
        <AnimatePresence>
          {!busca && filtroCategoria === 'Tudo' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full bg-[#0A0A0F] border border-white/5 rounded-[2rem] p-5 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-br from-[#9B2CBA] to-[#4B0082] flex items-center justify-center shadow-[0_0_15px_rgba(155,44,186,0.5)]"><Compass size={24} className="text-white" /></div>
                <div><h4 className="text-lg font-black italic text-white leading-none">Surpreenda-me</h4><p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">O Oráculo escolhe por você</p></div>
              </div>
              <button onClick={handleSurpreendaMe} className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px]">Explorar Agora</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#9B2CBA]" size={40} /></div> : (
          <div className="grid grid-cols-2 gap-4">
            {resultados.map((item) => (
              <motion.div layout key={`${item.tipo}-${item.id}`} onClick={() => navigate(item.tipo === 'filme' ? `/filme/${item.id}` : `/serie/${item.id}`)} className="relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer bg-[#0A0A0F] border border-white/5">
                <img src={item.poster} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4"><span className="px-2 py-0.5 rounded bg-black/60 text-[7px] font-black uppercase text-white/70">{item.tipo}</span></div>
                <div className="absolute bottom-4 inset-x-4"><span className="text-[8px] font-black uppercase text-[#9B2CBA] mb-1 block">{item.genero}</span><h3 className="text-xs font-bold line-clamp-2 leading-tight">{item.titulo}</h3></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {consultandoOraculo && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="animate-spin text-[#9B2CBA] mb-4" size={50} />
          <h4 className="text-xl font-black italic text-white uppercase">Consultando o Oráculo...</h4>
        </div>
      )}

      <BottomNav />
    </div>
  );
}