import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, ArrowLeft, SkipBack, SkipForward, 
  Volume2, VolumeX, Settings, Loader2, RotateCcw, AlertCircle,
  Lock, Unlock, Gauge, PictureInPicture, Maximize
} from 'lucide-react';
import { supabase } from '../supabase';

export default function Player() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const tipo = searchParams.get('tipo'); 

  const [conteudo, setConteudo] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false); // NOVO: Estado de travamento de rede
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedFeedback, setShowSpeedFeedback] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState<'forward' | 'backward' | null>(null);

  const qualidade = localStorage.getItem('cv_qualidade') || '4K Ultra HD';
  
  let controlsTimeout: any;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const reportarErroAoDiretor = async (msg: string, obra: string) => {
    await supabase.from('tickets').insert([{
      tipo: 'Erro de Link', obra: obra, mensagem: `Falha no Player (${tipo || 'filme'}): ${msg}`, status: 'Pendente'
    }]);
  };

  useEffect(() => {
    const carregarConteudo = async () => {
      setLoading(true);
      setErro('');
      try {
        const tabela = tipo === 'serie' ? 'episodios' : 'filmes';
        const { data, error } = await supabase.from(tabela).select('*').eq('id', id).single();

        if (error || !data) throw new Error("Obra não encontrada no servidor.");
        if (!data.video_url) throw new Error("Link de transmissão VIP indisponível no momento.");
        
        setConteudo(data);
      } catch (err: any) {
        setErro(err.message);
        reportarErroAoDiretor(err.message, `ID: ${id}`);
      }
    };
    carregarConteudo();
  }, [id, tipo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const salvarProgresso = async () => {
    if (!userId || !videoRef.current || !conteudo) return;
    const atual = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    if (atual > 5 && total > 0 && atual < total - 5) {
      await supabase.from('historico').upsert({
        user_id: userId,
        conteudo_id: id,
        tipo: tipo || 'filme',
        tempo_atual: atual,
        tempo_total: total,
        updated_at: new Date()
      }, { onConflict: 'user_id, conteudo_id' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) salvarProgresso();
    }, 15000);
    return () => clearInterval(interval);
  }, [isPlaying, userId, conteudo]);

  const handleUserActivity = () => {
    if (isLocked) return; 
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 4000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearTimeout(controlsTimeout);
    };
  }, [isPlaying, isLocked]);

  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => {
      window.removeEventListener('resize', checkOrientation);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (window.screen.orientation && window.screen.orientation.unlock) window.screen.orientation.unlock();
    };
  }, []);

  const forceLandscape = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      if (window.screen.orientation && window.screen.orientation.lock) await window.screen.orientation.lock('landscape');
    } catch (error) {
      console.log("O dispositivo bloqueou a rotação automática");
    }
  };

  const startPlayingFirstTime = () => {
    forceLandscape();
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedData = async () => {
    setLoading(false);
    setIsBuffering(false);
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
      
      if (userId) {
        const { data } = await supabase.from('historico').select('tempo_atual').eq('user_id', userId).eq('conteudo_id', id).single();
        if (data && data.tempo_atual > 5) videoRef.current.currentTime = data.tempo_atual;
      }

      if (isLandscape && localStorage.getItem('cv_autoplay') !== 'false') {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const togglePlay = () => {
    if (isLocked) return;
    forceLandscape();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        salvarProgresso();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (isLocked) return;
    forceLandscape();
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setSkipFeedback(seconds > 0 ? 'forward' : 'backward');
      setTimeout(() => setSkipFeedback(null), 500);
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    
    setShowSpeedFeedback(true);
    setTimeout(() => setShowSpeedFeedback(false), 1000);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    forceLandscape();
    const seekTo = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = (seekTo / 100) * videoRef.current.duration;
      setProgress(seekTo);
    }
  };

  // NOVO: Função de Picture in Picture Premium
  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current && document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const sairDoPlayer = async () => {
    salvarProgresso();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    if (window.screen.orientation && window.screen.orientation.unlock) window.screen.orientation.unlock();
    navigate(-1);
  };

  if (erro) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] bg-black flex flex-col items-center justify-center text-center px-6 z-[9999]">
        <AlertCircle size={50} className="text-red-500 mb-6" />
        <h2 className="text-xl font-black italic tracking-tighter text-white mb-2">Transmissão Falhou</h2>
        <p className="text-xs text-white/50 mb-8 max-w-xs">{erro}</p>
        <button onClick={sairDoPlayer} className="px-8 py-4 rounded-full bg-white/10 text-white font-black uppercase text-[10px] hover:bg-white/20">Voltar ao Catálogo</button>
      </div>
    );
  }

  if (!conteudo) return <div className="fixed inset-0 w-full h-[100dvh] bg-black flex items-center justify-center z-[9999]"><Loader2 className="animate-spin text-[#9B2CBA]" size={50} /></div>;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black flex items-center justify-center font-sans z-[9999] overflow-hidden">
      
      {!isLandscape && !loading && !isPlaying && (
        <div 
          onClick={startPlayingFirstTime} 
          className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center cursor-pointer"
        >
          <RotateCcw size={50} className="text-[#9B2CBA] mb-6 animate-pulse" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Tocar para Iniciar</h2>
          <p className="text-xs text-white/50 mb-8 max-w-[250px]">
            O Cineverse 8D irá automaticamente otimizar a sua tela.
          </p>
        </div>
      )}

      {/* ÁREAS INVISÍVEIS PARA DUPLO CLIQUE */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-30" onDoubleClick={() => skip(-10)} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-30" onDoubleClick={() => skip(10)} />
      <div className="absolute inset-y-0 left-1/3 right-1/3 z-30" onClick={togglePlay} />

      {/* FEEDBACK VISUAL DE DUPLO CLIQUE */}
      <AnimatePresence>
        {skipFeedback === 'backward' && (
          <motion.div initial={{ opacity: 0, scale: 0.8, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute left-1/4 top-1/2 -translate-y-1/2 z-40 bg-black/40 p-4 rounded-full backdrop-blur-sm pointer-events-none text-white flex flex-col items-center">
             <SkipBack size={32} />
             <span className="font-black text-xs mt-1">-10s</span>
          </motion.div>
        )}
        {skipFeedback === 'forward' && (
          <motion.div initial={{ opacity: 0, scale: 0.8, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute right-1/4 top-1/2 -translate-y-1/2 z-40 bg-black/40 p-4 rounded-full backdrop-blur-sm pointer-events-none text-white flex flex-col items-center">
             <SkipForward size={32} />
             <span className="font-black text-xs mt-1">+10s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK DE VELOCIDADE */}
      <AnimatePresence>
        {showSpeedFeedback && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-24 right-1/2 translate-x-1/2 z-40 bg-[#9B2CBA]/80 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] backdrop-blur-md pointer-events-none shadow-[0_0_20px_#9B2CBA]">
             Velocidade: {playbackSpeed}x
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        src={conteudo.video_url}
        poster={conteudo.banner_url || conteudo.poster_url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onPause={() => { setIsPlaying(false); salvarProgresso(); }}
        onPlay={() => setIsPlaying(true)}
        onWaiting={() => setIsBuffering(true)}   // NOVO: Mostra loading se a net falhar
        onPlaying={() => setIsBuffering(false)}  // NOVO: Esconde loading quando voltar
        playsInline
      />

      {/* LOADER CENTRAL (Carregamento inicial ou Buffering de rede) */}
      {(loading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 pointer-events-none">
          <Loader2 className="animate-spin text-[#9B2CBA] shadow-[0_0_30px_#9B2CBA] rounded-full" size={50} />
        </div>
      )}

      {/* BOTÃO DE DESBLOQUEIO */}
      <AnimatePresence>
        {isLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60]">
            <button onClick={() => setIsLocked(false)} className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Lock size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Desbloquear Ecrã</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTROLOS PRINCIPAIS */}
      <AnimatePresence>
        {showControls && !isLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-50 flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/95 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none" />

            {/* HEADER - AGORA COM O TÍTULO PARA POUPAR ESPAÇO EM BAIXO */}
            <header className="relative flex items-start md:items-center justify-between p-4 md:p-8">
              <div className="flex items-center gap-4 pointer-events-auto">
                <button onClick={sairDoPlayer} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-2xl">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col text-left drop-shadow-md">
                   <span className="text-sm md:text-lg font-black italic tracking-tighter line-clamp-1 text-white">{conteudo.titulo || `Episódio ${conteudo.numero}`}</span>
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#9B2CBA] mt-0.5">Cineverse 8D</span>
                </div>
              </div>

              <div className="flex gap-2 md:gap-3 pointer-events-auto mt-1 md:mt-0">
                <button onClick={() => { setIsLocked(true); setShowControls(false); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                  <Unlock size={14} />
                </button>
                <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/80 hidden sm:flex">
                  <Settings size={12} className="text-[#9B2CBA]" /> {qualidade}
                </div>
              </div>
            </header>

            {/* BARRA INFERIOR - AGORA COM MAIS ESPAÇO */}
            <div className="relative p-4 md:p-8 pb-6 md:pb-8 w-full max-w-5xl mx-auto space-y-3 md:space-y-4 pointer-events-auto">
              
              {/* Barra de Progresso */}
              <div className="flex items-center gap-3 md:gap-4 group">
                <span className="text-[10px] md:text-xs font-bold tracking-widest w-10 md:w-12 text-center text-white drop-shadow-md">{currentTime}</span>
                <div className="relative flex-1 h-1.5 md:h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer group-hover:h-3 transition-all">
                  <div className="absolute top-0 left-0 h-full bg-[#9B2CBA] shadow-[0_0_15px_#9B2CBA]" style={{ width: `${progress}%` }} />
                  <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <span className="text-[10px] md:text-xs font-bold tracking-widest w-10 md:w-12 text-center text-white/60 drop-shadow-md">{duration}</span>
              </div>

              {/* Botões - Distribuídos em toda a largura */}
              <div className="flex items-center justify-between pt-1">
                
                {/* Controlos de Reprodução */}
                <div className="flex items-center gap-4 md:gap-8">
                  <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors p-2">
                    <SkipBack size={20} className="md:size-6" />
                  </button>
                  
                  <button onClick={togglePlay} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                    {isPlaying ? <Pause size={18} fill="currentColor" className="md:size-6" /> : <Play size={18} fill="currentColor" className="ml-1 md:size-6 md:ml-1" />}
                  </button>
                  
                  <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors p-2">
                    <SkipForward size={20} className="md:size-6" />
                  </button>
                  
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white transition-colors ml-2 md:ml-4 p-2 hidden sm:block">
                    {isMuted ? <VolumeX size={20} className="md:size-6" /> : <Volume2 size={20} className="md:size-6" />}
                  </button>
                </div>

                {/* Utilidades à Direita (Speed, PiP, Fullscreen) */}
                <div className="flex items-center gap-3 md:gap-6">
                  <button onClick={changeSpeed} className="text-white/80 hover:text-white transition-colors p-2 flex items-center gap-1 group">
                    <Gauge size={18} className="group-hover:text-[#9B2CBA] transition-colors md:size-5" />
                    <span className="text-[10px] md:text-xs font-black hidden sm:inline">{playbackSpeed}x</span>
                  </button>
                  
                  {/* NOVO: Botão de Picture in Picture */}
                  <button onClick={togglePiP} className="text-white/80 hover:text-[#9B2CBA] transition-colors p-2 hidden sm:block" title="Mini Player">
                    <PictureInPicture size={18} className="md:size-5" />
                  </button>
                  
                  {/* NOVO: Botão Maximizar Nativo */}
                  <button onClick={toggleFullscreen} className="text-white/80 hover:text-[#9B2CBA] transition-colors p-2">
                    <Maximize size={18} className="md:size-5" />
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}