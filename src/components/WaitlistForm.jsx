import { useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Formulário da lista VIP (Ascen landing).
 * Use em páginas React; na landing estática (index.html) o submit usa fetch direto.
 */
export default function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState('loading');

    try {
      const { error } = await supabase.from('waitlist').insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          source: 'landing_page',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        if (error.code === '23505') setState('duplicate');
        else {
          console.error('Supabase error:', error);
          setState('error');
        }
      } else {
        setState('success');
        setName('');
        setEmail('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-bold text-green-400 text-lg mb-1">Você está na lista VIP!</p>
        <p className="text-white/60 text-sm">
          Fique de olho no seu e-mail — vamos te contatar{' '}
          <strong className="text-white">antes de todo mundo</strong> quando o Ascen abrir.
        </p>
      </div>
    );
  }

  if (state === 'duplicate') {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-bold text-cyan-400 text-lg mb-1">Você já está na lista!</p>
        <p className="text-white/60 text-sm">Esse e-mail já foi cadastrado. Em breve você vai receber novidades.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
          disabled={state === 'loading'}
          className="flex-1 min-w-[180px] bg-white/5 border border-[#00F5FF]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none transition-all focus:border-[#00F5FF]/60 focus:bg-[#00F5FF]/5 focus:ring-2 focus:ring-[#00F5FF]/10 disabled:opacity-50"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          required
          disabled={state === 'loading'}
          className="flex-1 min-w-[200px] bg-white/5 border border-[#00F5FF]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none transition-all focus:border-[#00F5FF]/60 focus:bg-[#00F5FF]/5 focus:ring-2 focus:ring-[#00F5FF]/10 disabled:opacity-50"
        />
      </div>

      {state === 'error' && (
        <p className="text-red-400 text-sm text-center">
          Ops! Algo deu errado. Tente novamente ou entre em contato:{' '}
          <a href="mailto:contato@valtun.com.br" className="underline">
            contato@valtun.com.br
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || !name.trim() || !email.trim()}
        className="w-full bg-[#00F5FF] text-[#0A2540] font-bold text-base rounded-xl py-4 px-6 transition-all duration-200 shadow-[0_0_28px_rgba(0,245,255,0.35)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? 'Entrando na lista...' : '⚡ Entrar na Lista VIP Agora — É Grátis'}
      </button>

      <p className="text-center text-white/40 text-xs">
        🔒 Sem spam. Seus dados estão protegidos. Você pode sair quando quiser.
      </p>
    </form>
  );
}
