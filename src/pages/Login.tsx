import { useState } from 'react';
import { Mail, Lock, Eye, Check, User, AlertCircle, Loader2, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';

// --- VARIANTES DE ANIMAÇÃO CORRIGIDAS ---
const pageVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as any } // Correção de tipagem TS2322
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as any } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } // Correção de tipagem TS2322
  }
};

export default function Login() {
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- O TRADUTOR DE MENSAGENS DO BANCO DE DADOS ---
  const traduzirErro = (mensagem: string) => {
    if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos. Tente novamente.';
    if (mensagem.includes('Email not confirmed')) return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada!';
    if (mensagem.includes('User already registered')) return 'Este e-mail já possui uma credencial VIP no Cineverse.';
    if (mensagem.includes('Password should be at least 6 characters')) return 'Sua senha de segurança precisa ter no mínimo 6 caracteres.';
    if (mensagem.includes('rate limit')) return 'Muitas tentativas seguidas. Respire um pouco e tente novamente em 1 minuto.';
    if (mensagem.includes('missing email')) return 'Por favor, preencha o campo de e-mail.';
    
    return 'Ocorreu um erro de conexão. Tente novamente mais tarde.';
  };

  const handleAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/home');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        
        setVerifyMessage(`Enviamos um link de ativação para o e-mail ${email}. Confirme para liberar seu acesso VIP.`);
        setMode('verify');
      }
    } catch (error: any) {
      setErrorMsg(traduzirErro(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/home',
      });
      if (error) throw error;

      setVerifyMessage(`Enviamos um link de redefinição de senha para ${email}. Verifique sua caixa de entrada.`);
      setMode('verify');
    } catch (error: any) {
      setErrorMsg(traduzirErro(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden font-sans bg-[#050508] pb-12 px-5"
    >
      
      {/* BACKGROUND */}
      <div 
        className="absolute top-0 inset-x-0 z-0 h-[60%] bg-cover bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/bg-fantasy.png')", backgroundPosition: "center 10%" }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050508]/10 via-[#050508]/80 to-[#050508] h-full"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-[350px] sm:w-[400px] mb-2 mt-24"
        >
          <img src="/logo-cineverse.png" alt="Cineverse Logo" className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(160,32,240,0.4)]" />
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'verify' ? (
            <motion.div 
              key="verify"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full text-center mt-6"
            >
              <motion.div variants={fadeUpItem} className="w-20 h-20 bg-[#9B2CBA]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#9B2CBA]/40 shadow-[0_0_30px_rgba(155,44,186,0.2)]">
                <Send className="text-[#9B2CBA] animate-bounce" size={32} />
              </motion.div>
              <motion.h2 variants={fadeUpItem} className="text-2xl font-bold text-white mb-4">Verifique seu E-mail</motion.h2>
              <motion.p variants={fadeUpItem} className="text-[#999] text-sm mb-8 leading-relaxed">{verifyMessage}</motion.p>
              <motion.button 
                variants={fadeUpItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('login')}
                className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Voltar para o Login
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key={mode} 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              
              <motion.div variants={fadeUpItem} className="w-full mb-6 text-center relative">
                {mode === 'forgot' && (
                  <button type="button" onClick={() => {setMode('login'); setErrorMsg('');}} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft size={24} />
                  </button>
                )}

                <h2 className="text-[26px] font-bold text-white mb-2 tracking-wide">
                  {mode === 'login' ? 'Entrar na sua conta' : mode === 'signup' ? 'Crie sua conta VIP' : 'Recuperar Senha'}
                </h2>
                <p className="text-[#999] text-[14px]">
                  {mode === 'login' ? 'Acesse milhares de filmes e séries exclusivos.' : mode === 'signup' ? 'Junte-se ao Cineverse e comece a maratona.' : 'Digite seu e-mail para receber o link.'}
                </p>
              </motion.div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full mb-4 overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <p>{errorMsg}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={mode === 'forgot' ? handleResetPassword : handleAcesso} className="w-full space-y-4">
                
                {mode === 'signup' && (
                  <motion.div variants={fadeUpItem} className="w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#2B44FF] via-[#A020F0] to-[#FF8C00]">
                    <div className="w-full bg-[#08080C] rounded-2xl flex items-center px-4 py-3.5">
                      <User className="text-white/40 mr-3" size={22} />
                      <div className="flex flex-col flex-1">
                        <span className="text-[11px] text-white/70 font-medium mb-0.5">Nome completo</span>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="bg-transparent text-white focus:outline-none text-[15px] w-full" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div variants={fadeUpItem} className="w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#2B44FF] via-[#A020F0] to-[#FF8C00]">
                  <div className="w-full bg-[#08080C] rounded-2xl flex items-center px-4 py-3.5">
                    <Mail className="text-white/40 mr-3" size={22} />
                    <div className="flex flex-col flex-1">
                      <span className="text-[11px] text-white/70 font-medium mb-0.5">E-mail</span>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-transparent text-white focus:outline-none text-[15px] w-full" />
                    </div>
                  </div>
                </motion.div>

                {mode !== 'forgot' && (
                  <motion.div variants={fadeUpItem} className="w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#2B44FF] via-[#A020F0] to-[#FF8C00]">
                    <div className="w-full bg-[#08080C] rounded-2xl flex items-center px-4 py-3.5">
                      <Lock className="text-white/40 mr-3" size={22} />
                      <div className="flex flex-col flex-1">
                        <span className="text-[11px] text-white/70 font-medium mb-0.5">Senha</span>
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={passwordValue => setPassword(passwordValue.target.value)} placeholder="••••••••••" className="bg-transparent text-white focus:outline-none text-[15px] w-full tracking-widest" />
                      </div>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#666] ml-2"><Eye size={20} /></button>
                    </div>
                  </motion.div>
                )}

                {mode === 'login' && (
                  <motion.div variants={fadeUpItem} className="flex justify-between items-center px-1 py-1">
                    <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#9B2CBA]' : 'bg-transparent border border-white/20'}`}>
                        {rememberMe && <Check size={14} className="text-white" />}
                      </div>
                      <span className="text-[14px] text-white/80">Lembrar de mim</span>
                    </label>
                    <button type="button" onClick={() => {setMode('forgot'); setErrorMsg('');}} className="text-[14px] text-[#D946EF] font-medium hover:text-white transition-colors cursor-pointer">Esqueceu a senha?</button>
                  </motion.div>
                )}

                <motion.button 
                  variants={fadeUpItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-[#0052D4] via-[#9B2CBA] to-[#FF7A59] text-white font-bold text-[17px] shadow-[0_0_20px_rgba(155,44,186,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    mode === 'login' ? 'Entrar no Cineverse' : 
                    mode === 'signup' ? 'Cadastrar agora' : 'Enviar link de recuperação'
                  )}
                </motion.button>
              </form>

              {mode !== 'forgot' && (
                <motion.div variants={fadeUpItem} className="mt-10 text-center text-[14px] text-[#777]">
                  {mode === 'login' ? 'Ainda não tem uma conta? ' : 'Já tem sua credencial? '}
                  <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }} className="text-[#9B2CBA] font-semibold hover:text-white transition-colors cursor-pointer">
                    {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                  </button>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}