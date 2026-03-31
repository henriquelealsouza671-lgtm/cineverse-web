import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Oculta a barra nas telas onde ela não deve aparecer
  const rotasOcultas = ['/filme', '/player', '/login'];
  if (location.pathname === '/' || rotasOcultas.some(rota => location.pathname.startsWith(rota))) {
    return null;
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'Início' },
    { path: '/busca', icon: Search, label: 'Explorar' },
    { path: '/favoritos', icon: Heart, label: 'Cofre' },
    { path: '/perfil', icon: User, label: 'VIP' },
  ];

  return (
    // Wrapper invisível que dá espaço para o ícone pular para fora da barra
    <div className="fixed bottom-0 inset-x-0 z-[100] h-32 pointer-events-none flex items-end justify-center pb-6 px-4">
      
      {/* BARRA PRINCIPAL (OBSIDIAN GLASS) */}
      <div className="w-full max-w-sm h-16 bg-[#0A0A0F]/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto flex items-center justify-around px-2 relative">

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full outline-none bg-transparent group"
            >
              
              {/* O ÍCONE QUE LEVITA */}
              <motion.div
                animate={{ 
                  y: isActive ? -24 : 0, // Pula 24 pixels para cima se estiver ativo
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`absolute flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
                  isActive
                    ? 'bg-[#020205] border-[1.5px] border-[#9B2CBA] shadow-[0_0_20px_rgba(155,44,186,0.6)] text-white' // Anel de energia
                    : 'bg-transparent text-white/40 group-hover:text-white/70' // Discreto se inativo
                }`}
              >
                <Icon size={isActive ? 22 : 24} strokeWidth={isActive ? 2.5 : 1.5} />
              </motion.div>

              {/* O TEXTO QUE SURGE MAGICALMENTE EMBAIXO */}
              <motion.span
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  y: isActive ? 12 : 25 
                }}
                transition={{ duration: 0.2 }}
                className="absolute text-[9px] font-black uppercase tracking-widest text-[#9B2CBA]"
              >
                {item.label}
              </motion.span>

              {/* PONTO NEON (Detalhe de luxo) */}
              <motion.div
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  scale: isActive ? 1 : 0 
                }}
                className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]"
              />
            </button>
          );
        })}

      </div>
    </div>
  );
}