import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function Splash() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Garante que o vídeo tente reproduzir assim que o componente montar
    if (videoRef.current) {
      videoRef.current.play().catch(_error => { // CORREÇÃO: Variável não utilizada alterada para _error
        console.log("Autoplay bloqueado pelo navegador, aguardando interação ou permissão.");
      });
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* VÍDEO DE INTRODUÇÃO */}
      <video
        ref={videoRef}
        src="/intro.mp4" 
        muted
        playsInline
        className="w-full h-full object-contain"
      />

      {/* OVERLAY DE PROTOCOLO */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-0 right-0 text-center z-10"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">
          Cineverse Obsidian Protocol
        </p>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
    </motion.div>
  );
}