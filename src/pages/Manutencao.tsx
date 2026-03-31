import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Clock, Zap, RefreshCcw } from 'lucide-react';

interface ManutencaoProps {
  mensagem: string;
}

export default function Manutencao({ mensagem }: ManutencaoProps) {
  
  // Função para o usuário testar se a manutenção já acabou
  const verificarNovamente = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 overflow-hidden relative font-sans selection:bg-[#9B2CBA]/30">
      
      {/* 1. FUNDO LÍQUIDO (NEBULOSA EM MOVIMENTO) */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 45, -45, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[#9B2CBA]/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -60, 60, 0],
            y: [0, 40, -40, 0],
            scale: [1.2, 0.8, 1.1, 1.2],
            rotate: [0, -30, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#2B44FF]/15 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150"></div>
      </div>

      {/* 2. CONTEÚDO CENTRAL */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        
        {/* LOGO CINEVERSE COM ESTILO DO APP */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-col items-center"
        >
          <h1 className="text-3xl font-black italic tracking-tighter text-[#9B2CBA] drop-shadow-[0_0_15px_rgba(155,44,186,0.6)]">
            CINEVERSE
          </h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#9B2CBA] to-transparent mt-2 opacity-50" />
        </motion.div>

        {/* CARD COM EFEITO FLOAT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: [0, -10, 0],
          }}
          transition={{ 
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-full bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] rounded-[2.8rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] text-center relative overflow-hidden"
        >
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12"
          />

          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B2CBA]/40 to-transparent"></div>

          {/* ÍCONE DE SEGURANÇA 8D */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] bg-gradient-to-tr from-[#9B2CBA] via-transparent to-[#2B44FF] rounded-full blur-xl opacity-20"
              />
              <div className="w-20 h-20 rounded-[22px] bg-[#0A0A0F] border border-white/10 flex items-center justify-center relative z-10 shadow-inner">
                <motion.div
                  animate={{ 
                    rotateY: [0, 15, -15, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                   <ShieldCheck size={40} className="text-white/90" strokeWidth={1.2} />
                </motion.div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#9B2CBA] rounded-full border-4 border-[#08080c]"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight leading-tight">
            Aprimorando sua <br/> 
            <motion.span 
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#9B2CBA] to-white/40 bg-[length:200%_auto]"
            >
              Experiência VIP
            </motion.span>
          </h1>

          {/* MENSAGEM DINÂMICA VINDA DO PAINEL ADMIN */}
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-[280px] mx-auto font-medium">
            {mensagem || "Sincronizando nossos servidores para oferecer o melhor do cinema 8D."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: Clock, label: 'Previsão', val: 'Em breve', color: '#9B2CBA' },
              { icon: Zap, label: 'Status', val: 'Otimizando', color: '#2B44FF' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.2), duration: 0.6 }}
                className="bg-white/[0.02] border border-white/[0.05] rounded-[1.4rem] p-4 flex flex-col items-center gap-2 hover:bg-white/[0.05] transition-colors"
              >
                 <item.icon size={20} style={{ color: item.color }} className="opacity-80" />
                 <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">{item.label}</span>
                 <span className="text-xs text-white/80 font-bold">{item.val}</span>
              </motion.div>
            ))}
          </div>

          {/* BOTÃO DE REFRESH PARA O USUÁRIO TESTAR O ACESSO */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={verificarNovamente}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 transition-all active:bg-[#9B2CBA]/20"
          >
            <RefreshCcw size={16} className="text-[#9B2CBA]" />
            Tentar Acessar Agora
          </motion.button>
        </motion.div>

        {/* PROTOCOLO DE SEGURANÇA 8D */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md"
        >
          <motion.div 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#9B2CBA] shadow-[0_0_12px_#9B2CBA]"
          />
          <span className="text-[10px] font-bold text-white/30 tracking-[0.4em] uppercase">8D Cineverse Security Protocol</span>
          <Sparkles size={12} className="text-[#9B2CBA]/40" />
        </motion.div>

      </div>
    </div>
  );
}