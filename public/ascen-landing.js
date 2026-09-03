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

  /* ─── WHATSAPP MESSAGE DIFFERENTIATION ─── */
  const whatsappMessages = {
    'site-express': 'Olá! Vi o site profissional da Valtun e gostaria de saber mais.',
    'sistemas': 'Olá! Tenho um processo na minha empresa que gostaria de transformar em sistema.',
    'automacao': 'Olá! Gostaria de conversar sobre automação para minha empresa.',
    'explicar-problema': 'Olá! Tenho um problema específico no meu negócio e gostaria de entender se existe uma solução digital.',
    'horizongest': 'Olá! Vi o HorizonGest no site da Valtun e gostaria de saber mais sobre o projeto.',
    'ascen': 'Olá! Vi o Ascen no site da Valtun e gostaria de saber mais sobre o aplicativo.',
    'generic': 'Olá! Vi o site da Valtun e gostaria de conversar sobre uma solução digital para meu negócio.'
  };

  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    el.addEventListener('click', e => {
      const type = el.getAttribute('data-whatsapp');
      const message = whatsappMessages[type] || whatsappMessages['generic'];
      const whatsappNumber = '5573999773736';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  });
