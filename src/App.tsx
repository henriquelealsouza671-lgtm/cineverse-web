import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// IMPORTAÇÃO DAS PÁGINAS DO CINEVERSE
import Splash from './pages/Splash'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Busca from './pages/Busca';
import Filme from './pages/Filme';
import Serie from './pages/Serie'; 
import Player from './pages/Player';
import Perfil from './pages/Perfil';
import Favoritos from './pages/Favoritos';
import Notificacoes from './pages/Notificacoes'; 
import Manutencao from './pages/Manutencao';
import LandingPage from './pages/LandingPage'; // INTEGRADO: Sua nova vitrine Platinum

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 1. VERIFICAR SESSÃO ATIVA (LOGIN)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      verificarSistema();
    });

    // OUVIR MUDANÇAS DE LOGIN/LOGOUT
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. VERIFICAR STATUS DO SISTEMA (MODO MANUTENÇÃO)
  const verificarSistema = async () => {
    const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    if (data) setConfig(data);
    setLoading(false);
  };

  // 3. TEMPORIZADOR DO SPLASH SCREEN (Sincronizado com intro.mp4)
  useEffect(() => {
    const tempoDoVideo = 6000; // 6 segundos de imersão total
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, tempoDoVideo);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* O SPLASH SCREEN SOBREPÕE TUDO E SAI COM ANIMAÇÃO SUAVE */}
      <AnimatePresence>
        {showSplash && <Splash key="splash" />}
      </AnimatePresence>

      {!showSplash && (
        loading ? (
          <div className="min-h-screen bg-[#020205] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#9B2CBA]" size={40} />
          </div>
        ) : config?.modo_manutencao ? (
          <Manutencao mensagem={config.mensagem_manutencao} />
        ) : (
          <Router>
            <Routes>
              {/* PORTA DE ENTRADA: Landing Page para todos os visitantes */}
              <Route path="/" element={<LandingPage />} />

              {/* ROTA DE ACESSO: Se não estiver logado, vai para Login. Se estiver, vai para Home */}
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/home" />} />

              {/* ROTAS PROTEGIDAS (SÓ ACESSA SE TIVER SESSÃO VIP) */}
              <Route path="/home" element={session ? <Home /> : <Navigate to="/login" />} />
              <Route path="/busca" element={session ? <Busca /> : <Navigate to="/login" />} />
              <Route path="/notificacoes" element={session ? <Notificacoes /> : <Navigate to="/login" />} />
              <Route path="/perfil" element={session ? <Perfil /> : <Navigate to="/login" />} />
              <Route path="/favoritos" element={session ? <Favoritos /> : <Navigate to="/login" />} />
              
              {/* DETALHES E PLAYER */}
              <Route path="/filme/:id" element={session ? <Filme /> : <Navigate to="/login" />} />
              <Route path="/serie/:id" element={session ? <Serie /> : <Navigate to="/login" />} />
              <Route path="/player/:id" element={session ? <Player /> : <Navigate to="/login" />} />

              {/* REDIRECIONAMENTO PADRÃO: Retorna para a Landing Page */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        )
      )}
    </>
  );
}