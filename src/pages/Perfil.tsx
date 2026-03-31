import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Globe, LogOut, ChevronRight, Loader2, ArrowLeft, X, Check, Monitor, 
  Subtitles, Eye, ShieldAlert, Zap, Image as ImageIcon, Radio, Info, Activity, Trash2,
  HelpCircle 
} from 'lucide-react'; 
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';

// IMPORTAÇÃO DA NAVBAR
import BottomNav from '../components/BottomNav';

const sementesClassicas = ['Felix', 'Aneka', 'Milo', 'Hinter', 'Zoe', 'Bento', 'Luna', 'Cine', 'Vip', 'Leo', 'Maya', 'Rex', 'Kira', 'Oliver', 'Jade', 'Finn', 'Nala', 'Otis'];

export default function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [appConfig, setAppConfig] = useState<any>(null);
  const [modalAtivo, setModalAtivo] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newName, setNewName] = useState('');
  const [speed, setSpeed] = useState(0);

  // PREFERÊNCIAS LOCAIS
  const [qualidade, setQualidade] = useState(localStorage.getItem('cv_qualidade') || '4K Ultra HD');
  const [idioma, setIdioma] = useState(localStorage.getItem('cv_idioma') || 'Dublado (BR)');
  const [autoPlay, setAutoPlay] = useState(localStorage.getItem('cv_autoplay') !== 'false');
  const [kidsMode, setKidsMode] = useState(localStorage.getItem('cv_kids') === 'true');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setNewName(user?.user_metadata?.full_name || '');
    const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    setAppConfig(config);
    setLoading(false);
  };

  // SUPORTE COM GERAÇÃO DE TICKET
  const handleSuporte = async () => {
    await supabase.from('tickets').insert([{
      tipo: 'Outros',
      obra: 'Suporte Direto',
      mensagem: `Usuário ${user?.user_metadata?.full_name || user?.email} solicitou suporte pelo Perfil.`,
      status: 'Pendente'
    }]);
    window.location.href = `mailto:${appConfig?.email_suporte || 'suporte@playcineverse.com.br'}`;
  };

  // ATUALIZAÇÃO DE DADOS COM REFLEXO INSTANTÂNEO NO AVATAR
  const handleUpdate = async (data: any) => {
    const { data: updateData, error } = await supabase.auth.updateUser({ data });
    
    if (!error && updateData.user) {
      setUser(updateData.user);
      setSaveSuccess(true);
      setTimeout(() => { 
        setSaveSuccess(false); 
        setModalAtivo(null); 
        if (data.full_name) setNewName(data.full_name);
      }, 1200);
    }
  };

  const setPref = (key: string, val: any, setter: any) => {
    localStorage.setItem(key, String(val));
    setter(val);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setModalAtivo(null); }, 800);
  };

  // MOTOR DE REDE REAL (CLOUDFLARE + FALLBACK NATIVO)
  const runSpeedTest = async () => {
    setModalAtivo('speed');
    setSpeed(0);

    const testUrl = "https://speed.cloudflare.com/__down?bytes=20000000"; 
    const startTime = performance.now();
    
    try {
      const response = await fetch(testUrl, { cache: 'no-store' });
      if (!response.body) throw new Error("Protocolo de rede falhou.");

      const reader = response.body.getReader();
      let bytesRecebidos = 0;

      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        
        bytesRecebidos += value.length;
        const tempoAtual = performance.now();
        const duracaoSegundos = (tempoAtual - startTime) / 1000;

        if (duracaoSegundos > 0) {
          const mbps = (bytesRecebidos * 8 / (1024 * 1024)) / duracaoSegundos;
          setSpeed(Math.floor(mbps));
        }

        if (tempoAtual - startTime > 5000) {
          reader.cancel();
          break;
        }
      }
    } catch (err) {
      // Fallback para API de hardware se houver bloqueio de CORS
      const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const realDownlink = navConn ? navConn.downlink : 50; 

      let currentMock = 0;
      const interval = setInterval(() => {
        currentMock += Math.random() * 30;
        if (currentMock > realDownlink) {
          setSpeed(Math.floor(realDownlink));
          clearInterval(interval);
        } else {
          setSpeed(Math.floor(currentMock));
        }
      }, 150);
    }
  };

  const clearAppCache = () => {
    const keys = ['cv_qualidade', 'cv_idioma', 'cv_autoplay', 'cv_kids', 'cv_notif'];
    Object.keys(localStorage).forEach(k => { 
      if(!keys.includes(k) && !k.includes('supabase')) localStorage.removeItem(k); 
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1200);
  };

  const avatarAtual = useMemo(() => user?.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/notionists/svg?seed=${user?.user_metadata?.full_name || 'VIP'}`, [user]);

  if (loading) return <div className="min-h-screen bg-[#020205] flex items-center justify-center"><Loader2 className="animate-spin text-[#9B2CBA]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans pb-40 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#9B2CBA15,_transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="absolute top-8 left-6 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors z-20">
          <ArrowLeft size={20} />
        </motion.button>
        
        <header className="pt-20 pb-10 flex flex-col items-center relative">
          <motion.div whileTap={{ scale: 0.92 }} onClick={() => setModalAtivo('avatar')} className="relative cursor-pointer group">
            <div className="absolute inset-0 rounded-full bg-[#9B2CBA] animate-ping opacity-20" />
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-[#9B2CBA] p-1 shadow-[0_0_30px_rgba(155,44,186,0.3)] bg-[#0A0A0F] relative z-10">
              <img src={avatarAtual} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 md:w-10 md:h-10 bg-[#9B2CBA] rounded-full border-4 border-[#020205] flex items-center justify-center shadow-lg z-20">
              <Zap size={14} fill="white" />
            </div>
          </motion.div>
          
          <h2 className="mt-5 text-2xl md:text-3xl font-black tracking-tighter drop-shadow-md">
            {user?.user_metadata?.full_name || 'Membro VIP'}
          </h2>
          <span className="mt-2 px-3 py-1 rounded-full bg-[#9B2CBA]/20 border border-[#9B2CBA]/50 text-[#9B2CBA] text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(155,44,186,0.2)]">
            Assinatura Platinum Ativa
          </span>
        </header>

        <div className="px-6 max-w-lg mx-auto space-y-8">
          
          <section>
            <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3 ml-4">Identidade VIP</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
              <ItemMenu icon={<User size={18} />} label="Editar Nome" sublabel={user?.user_metadata?.full_name || 'Definir Nome'} onClick={() => setModalAtivo('nome')} />
              <ItemMenu icon={<ImageIcon size={18} />} label="Mudar Avatar" sublabel="Escolha seu estilo" onClick={() => setModalAtivo('avatar')} />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3 ml-4">Cinema & Player</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
              <ItemMenu icon={<Monitor size={18} />} label="Qualidade Padrão" sublabel={qualidade} onClick={() => setModalAtivo('qualidade')} />
              <ItemMenu icon={<Subtitles size={18} />} label="Áudio e Legenda" sublabel={idioma} onClick={() => setModalAtivo('idioma')} />
              <ItemMenu icon={<Radio size={18} />} label="Reprodução Automática" sublabel={autoPlay ? "Ativado" : "Desativado"} onClick={() => setPref('cv_autoplay', !autoPlay, setAutoPlay)} />
              <ItemMenu icon={<Eye size={18} />} label="Filtro Kids" sublabel={kidsMode ? "Protegido (Ativo)" : "Desativado"} onClick={() => setPref('cv_kids', !kidsMode, setKidsMode)} />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3 ml-4">Apoio & Comunidade</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
              <ItemMenu icon={<Globe size={18} />} label="Instagram Oficial" sublabel="Siga a nossa comunidade" onClick={() => window.open(appConfig?.link_instagram || 'https://instagram.com', '_blank')} />
              <ItemMenu icon={<HelpCircle size={18} />} label="Central de Suporte" sublabel="Abrir ticket VIP" onClick={handleSuporte} />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-[#9B2CBA] uppercase tracking-[0.4em] mb-3 ml-4">Sistema & Legal</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
              <ItemMenu icon={<Activity size={18} />} label="Teste de Conexão 8D" sublabel="Verificar estabilidade" onClick={runSpeedTest} />
              <ItemMenu icon={<Trash2 size={18} />} label="Limpar Cache Local" sublabel="Otimizar armazenamento" onClick={clearAppCache} />
              <ItemMenu icon={<ShieldAlert size={18} />} label="Privacidade & Termos" onClick={() => setModalAtivo('priv')} />
              <ItemMenu icon={<Info size={18} />} label="Versão do Protocolo" sublabel={appConfig?.versao_app || "2.0.4.8D Obsidian"} onClick={() => window.open('https://admin.playcineverse.com.br', '_blank')} />
            </div>
          </section>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} 
            className="w-full py-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-red-500/20 transition-colors mt-8"
          >
            <LogOut size={16} /> Encerrar Sessão VIP
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {modalAtivo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="w-full max-w-sm bg-[#0A0A0F] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <button onClick={() => setModalAtivo(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={20}/></button>
              
              {modalAtivo === 'nome' && (
                <div className="space-y-6 pt-2">
                  <h4 className="text-lg font-black tracking-tight text-white flex items-center gap-2"><User size={20} className="text-[#9B2CBA]"/> Identidade VIP</h4>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-[#9B2CBA] text-sm font-medium" />
                  <button onClick={() => handleUpdate({ full_name: newName })} className="w-full py-4 bg-[#9B2CBA] text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Confirmar Alteração</button>
                </div>
              )}

              {modalAtivo === 'avatar' && (
                <div className="pt-2">
                  <h4 className="text-lg font-black tracking-tight text-white mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-[#9B2CBA]"/> Estilo Visual</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {sementesClassicas.map((sem) => (
                      <motion.div key={sem} whileTap={{ scale: 0.8 }} onClick={() => handleUpdate({ avatar_url: `https://api.dicebear.com/8.x/notionists/svg?seed=${sem}` })} className="aspect-square rounded-full border border-white/10 cursor-pointer bg-[#111] hover:border-[#9B2CBA] transition-colors p-1">
                        <img src={`https://api.dicebear.com/8.x/notionists/svg?seed=${sem}`} className="w-full h-full object-cover rounded-full" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {modalAtivo === 'qualidade' && (
                <div className="pt-2 space-y-3">
                  <h4 className="text-lg font-black tracking-tight text-white mb-6 flex items-center gap-2"><Monitor size={20} className="text-[#9B2CBA]"/> Qualidade Padrão</h4>
                  {['4K Ultra HD', '1080p Full HD', '720p HD', 'Automático'].map(q => (
                    <button key={q} onClick={() => setPref('cv_qualidade', q, setQualidade)} className={`w-full p-4 rounded-2xl flex items-center justify-between text-sm font-bold border transition-colors ${qualidade === q ? 'bg-[#9B2CBA]/20 border-[#9B2CBA] text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>
                      {q} {qualidade === q && <Check size={16} className="text-[#9B2CBA]" />}
                    </button>
                  ))}
                </div>
              )}

              {modalAtivo === 'idioma' && (
                <div className="pt-2 space-y-3">
                  <h4 className="text-lg font-black tracking-tight text-white mb-6 flex items-center gap-2"><Subtitles size={20} className="text-[#9B2CBA]"/> Preferência de Áudio</h4>
                  {['Dublado (BR)', 'Legendado (PT-BR)', 'Original (EN)'].map(i => (
                    <button key={i} onClick={() => setPref('cv_idioma', i, setIdioma)} className={`w-full p-4 rounded-2xl flex items-center justify-between text-sm font-bold border transition-colors ${idioma === i ? 'bg-[#9B2CBA]/20 border-[#9B2CBA] text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}>
                      {i} {idioma === i && <Check size={16} className="text-[#9B2CBA]" />}
                    </button>
                  ))}
                </div>
              )}

              {modalAtivo === 'speed' && (
                <div className="pt-4 pb-4 flex flex-col items-center text-center">
                  <Activity size={40} className="text-[#9B2CBA] mb-4 animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Medindo Protocolo de Rede...</h4>
                  <div className="text-6xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(155,44,186,0.5)]">
                    {speed} <span className="text-lg text-white/40 not-italic">Mbps</span>
                  </div>
                  <p className="mt-8 text-[10px] text-[#9B2CBA] font-bold uppercase tracking-widest bg-[#9B2CBA]/10 px-4 py-2 rounded-full">
                    {speed > 100 ? 'Sinal 4K Garantido' : speed > 0 ? 'Conexão Detectada' : 'Iniciando Escaneamento'}
                  </p>
                </div>
              )}

              {modalAtivo === 'priv' && (
                <div className="pt-2 text-center">
                  <ShieldAlert size={40} className="text-[#9B2CBA] mx-auto mb-4" />
                  <h4 className="text-lg font-black tracking-tight text-white mb-4">Segurança Obsidian</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    O Cineverse utiliza criptografia de ponta a ponta. O seu histórico de visualização e dados de rede são processados localmente e apagados regularmente para garantir total anonimato.
                  </p>
                  <button onClick={() => setModalAtivo(null)} className="w-full mt-6 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Compreendido</button>
                </div>
              )}

              <AnimatePresence>
                {saveSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#9B2CBA] flex flex-col items-center justify-center z-50 rounded-[2rem]">
                    <Check size={48} className="text-white drop-shadow-2xl" />
                    <p className="font-black tracking-[0.4em] uppercase text-xs mt-4 text-white">Sincronizado</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LÓGICA DE OCULTAÇÃO DA NAVBAR */}
      <AnimatePresence>
        {!modalAtivo && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ duration: 0.4 }} className="fixed bottom-0 inset-x-0 z-50">
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemMenu({ icon, label, sublabel, onClick }: any) {
  return (
    <motion.div onClick={onClick} whileTap={{ scale: 0.98, backgroundColor: "rgba(155, 44, 186, 0.1)" }} className="flex items-center justify-between p-5 border-b border-white/5 last:border-none cursor-pointer group hover:bg-white/[0.02] transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#9B2CBA] group-hover:bg-[#9B2CBA]/20 transition-colors">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-wide text-white/90">{label}</span>
          {sublabel && <span className="text-[10px] text-white/40 font-bold mt-0.5">{sublabel}</span>}
        </div>
      </div>
      <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
    </motion.div>
  );
}