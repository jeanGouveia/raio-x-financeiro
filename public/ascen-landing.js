  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ─── MOBILE NAV ─── */
  function toggleNav() {
    navbar.classList.toggle('open');
  }

  /* ─── REVEAL ON SCROLL ─── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ─── FAQ ─── */
  function toggleFAQ(btn) {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }

  /* ─── WAITLIST FORM (Supabase) ─── */
  async function submitWaitlist(e) {
    e.preventDefault();

    const name = document.getElementById('wl-name').value.trim();
    const email = document.getElementById('wl-email').value.trim();
    const btn = document.getElementById('submit-btn');

    if (!name || !email) return;

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = window.VALTUN_SUPABASE || {};
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase não configurado');

      const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name,
          email,
          created_at: new Date().toISOString(),
          source: 'landing_page'
        })
      });

      if (response.ok || response.status === 201) {
        document.getElementById('waitlist-form').style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
      } else {
        const err = await response.json();
        // Email duplicado
        if (err?.code === '23505') {
          btn.textContent = '✅ Você já está na lista!';
          btn.style.background = 'var(--green)';
        } else {
          throw new Error('Erro ao salvar');
        }
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      btn.disabled = false;
      btn.textContent = '⚡ Tentar Novamente';
      btn.style.background = 'var(--red)';
      setTimeout(() => {
        btn.style.background = 'var(--cyan)';
        btn.textContent = '⚡ Entrar na Lista VIP Agora — É Grátis';
      }, 3000);
    }
  }

  /* ─── SMOOTH ANCHOR ─── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navbar.classList.remove('open');
      }
    });
  });

  /* ─── BAR ANIMATION ─── */
  const bars = document.querySelectorAll('.phone-bar');
  setInterval(() => {
    bars.forEach(bar => {
      const h = Math.floor(Math.random() * 60 + 30);
      bar.style.height = h + '%';
    });
  }, 2000);
