import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Download, ShieldCheck, Zap, Monitor, Smartphone, 
  Tv, Globe, Star, ArrowRight, Layers, Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CONFIGURAÇÃO TÉCNICA: Stack Elite 2026 (React + Tailwind + Motion)
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden selection:bg-[#9B2CBA]/30">
      
      {/* 1. ATMOSFERA AMBIENTAL (Nebulosas Obsidian do Mockup) */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_#9B2CBA15,_transparent_50%)]" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,_#01b4e410,_transparent_50%)]" />

      {/* 2. NAVBAR WEB PLATINUM */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-10 max-w-7xl mx-auto">
        {/* Logo com brilho neon roxo central */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Cineverse" className="h-9 md:h-11 w-auto drop-shadow-[0_0_15px_rgba(155,44,186,0.5)]" />
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/login')} className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#9B2CBA] transition-colors hidden md:block">Login VIP</button>
          <button 
            onClick={() => navigate('/cadastro')}
            className="px-8 py-3.5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Assinar Agora
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION: O IMPACTO PLATINUM */}
      <section className="relative z-10 pt-24 pb-40 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="space-y-8"
        >
          {/* Tag Protocolo Ativo */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-lg">
            <Zap size={14} className="text-[#9B2CBA]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Obsidian Protocol v3.0 Ativo</span>
          </div>
          
          {/* Headline Monumental com efeito de brilho neon roxo */}
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] italic uppercase">
            A Próxima Era do <br /> 
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#9B2CBA] via-white to-[#01b4e4]">
              Streaming.
              {/* Efeito de brilho que vaza pelas bordas */}
              <span className="absolute inset-0 bg-[#9B2CBA] blur-[40px] opacity-20 -z-10"></span>
            </span>
          </h1>
          
          <p className="text-sm md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Qualidade 4K nativa masterizada, áudio imersivo 8D e uma biblioteca Platinum curada para quem não aceita menos que a perfeição.
          </p>
          
          {/* CTA Principal focado na Experiência Imediata */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5 pt-10">
            <button 
              onClick={() => navigate('/home')}
              className="w-full md:w-auto px-12 py-6 rounded-2xl bg-[#9B2CBA] text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_40px_rgba(155,44,186,0.4)] hover:shadow-[0_0_60px_rgba(155,44,186,0.6)] transition-all flex items-center justify-center gap-3 group"
            >
              <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Entrar no Cineverse 8D
            </button>
            <a 
              href="/apps/cineverse.apk" 
              className="w-full md:w-auto px-12 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
            >
              <Download size={20} /> Baixar APK Platinum
            </a>
          </div>
        </motion.div>
      </section>

      {/* 4. A DISTINÇÃO OBSIDIAN (Grade de Recursos do Mockup) */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
          <FeatureCard 
            icon={<Monitor className="text-[#01b4e4]" />} 
            title="ULTRA HD Masterizado em 4K" 
            desc="Protocolo de imagem Obsidian que garante fidelidade absoluta de cor e contraste."
          />
          <FeatureCard 
            icon={<Activity className="text-[#9B2CBA]" />} 
            title="ÁUDIO IMERSIVO Protocolo 8D" 
            desc="A sensação do cinema Platinum que sincroniza o som diretamente no seu ritmo cardíaco."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-green-500" />} 
            title="SEGURANÇA PLATINUM Criptografia" 
            desc="Seus dados de visualização e histórico são protegidos localmente com Obsidian Encryption."
          />
        </div>
      </section>

      {/* 5. SHOWCASE DO APP (Simulação do Mockup HTML) */}
      <section className="relative z-10 py-40 px-6 max-w-7xl mx-auto text-center">
        <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-20 drop-shadow-md">A Interface Obsidian</h3>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="relative max-w-5xl mx-auto aspect-video rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(155,44,186,0.2)] bg-[#0A0A0F] p-4 group"
        >
          {/* Brilho neon roxo vazando pelas bordas */}
          <div className="absolute inset-0 bg-[#9B2CBA] blur-[120px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <img 
            src="/banner-mockup.png" // IMAGEM DO SEU APP INTERNO
            className="w-full h-full object-cover rounded-2xl relative z-10" 
            alt="Cineverse Mockup" 
          />
        </motion.div>
      </section>

      {/* 6. ECOSSISTEMA E FOOTER */}
      <section className="relative z-10 py-32 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
        <h3 className="text-3xl font-black italic tracking-tighter mb-20 uppercase">Ecossistema Sincronizado</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 hover:opacity-100 transition-opacity duration-700 cursor-default">
          <Device icon={<Tv size={48} />} name="Smart TV" />
          <Device icon={<Smartphone size={48} />} name="Mobile App" />
          <Device icon={<Monitor size={48} />} name="Desktop" />
          <Device icon={<Globe size={48} />} name="Web Browser" />
        </div>
      </section>

      <footer className="relative z-10 py-20 border-t border-white/5 bg-[#010103]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div>
            <img src="/logo.png" alt="Logo" className="h-6 mb-4 opacity-50 mx-auto md:mx-0" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">© 2026 playcineverse.com.br • Obsidian Protocol v3.0</p>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-white transition-colors">Suporte VIP</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES PLATINUM

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="space-y-6 group cursor-default p-8 rounded-3xl hover:bg-white/[0.01] transition-colors border border-transparent hover:border-white/5">
      <div className="w-14 h-14 rounded-2xl bg-[#9B2CBA]/10 border border-[#9B2CBA]/20 flex items-center justify-center text-[#9B2CBA] group-hover:bg-[#9B2CBA] group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_#9B2CBA]">
        {icon}
      </div>
      <h4 className="text-xl font-black italic tracking-tighter uppercase">{title}</h4>
      <p className="text-sm text-white/30 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function Device({ icon, name }: any) {
  return (
    <div className="flex flex-col items-center gap-4 hover:text-white hover:opacity-100 transition-all duration-500">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{name}</span>
    </div>
  );
}