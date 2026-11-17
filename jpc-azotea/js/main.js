/* Azotea · Juntos por Colombia — interacciones de scrollytelling (sin dependencias) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Barra de progreso, cabecera y parallax ---------- */
  const barra = $('.progreso span');
  const top = $('.top');
  const heroImg = $('.hero__azotea');
  const cierre = $('#cierre');
  let ultimoY = 0, pendiente = false;
  const alScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    top.classList.toggle('solida', y > 40);
    top.classList.toggle('oculta', y > 500 && y > ultimoY && !$('.top__nav.abierta'));
    ultimoY = y;
    if (!reduce) {
      if (y < innerHeight * 1.2) heroImg.style.setProperty('--sube', (-y * 0.18).toFixed(1));
      const r = cierre.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) cierre.style.setProperty('--pc', (1 - r.top / innerHeight).toFixed(3));
    }
    pendiente = false;
  };
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }, { passive: true });
  alScroll();

  /* ---------- Menú móvil ---------- */
  const menu = $('.menu'), nav = $('.top__nav');
  menu.addEventListener('click', () => {
    const abierto = nav.classList.toggle('abierta');
    menu.setAttribute('aria-expanded', abierto);
    document.body.style.overflow = abierto ? 'hidden' : '';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('abierta'); menu.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  /* ---------- Sección activa en la navegación ---------- */
  const enlaces = new Map($$('a', nav).map(a => [a.hash.slice(1), a]));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { enlaces.forEach(a => a.classList.remove('activo')); enlaces.get(e.target.id)?.classList.add('activo'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  enlaces.forEach((_, id) => { const s = document.getElementById(id); s && navIO.observe(s); });

  /* ---------- Aparición al entrar en pantalla ---------- */
  const revIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('ve'); revIO.unobserve(e.target); }
  }), { threshold: 0.18 });
  $$('.revela, .barras, .sellos, .escalera, .mapa').forEach(el => revIO.observe(el));

  /* ---------- Contadores ---------- */
  const fmt = (n, miles) => miles ? Math.round(n).toLocaleString('es-CO') : String(Math.round(n));
  const contar = el => {
    const fin = +el.dataset.cuenta, miles = 'miles' in el.dataset;
    if (reduce) { el.textContent = fmt(fin, miles); return; }
    const dur = 1600 + Math.min(fin, 3000) / 3, t0 = performance.now();
    const paso = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(fin * e, miles);
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  const cntIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { contar(e.target); cntIO.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('[data-cuenta]').forEach(el => cntIO.observe(el));

  /* ---------- Motor de scrollytelling ---------- */
  const acciones = {
    cobertura(paso, sc) {
      const barras = $('.barras', sc), foco = (paso.dataset.foco || '').split(',');
      barras.classList.add('foco', 've');
      $$('.barra', barras).forEach(b => b.classList.toggle('on', foco.includes(b.dataset.k) || b.dataset.k === 'nac'));
    },
    modelo(paso, sc) {
      const ilu = $('.modelo-ilu', sc), modo = paso.dataset.modo;
      ilu.dataset.modo = modo;
      ilu.classList.toggle('lleno', modo !== 'azotea');
    },
    tramos(paso, sc) { $('.planta', sc).dataset.t = paso.dataset.t; }
  };
  $$('.calendario span').forEach((s, i) => s.style.setProperty('--i', i));
  $$('[data-scrolly]').forEach(sc => {
    const tipo = sc.dataset.scrolly, pasos = $$('.paso', sc);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      pasos.forEach(p => p.classList.toggle('activo', p === e.target));
      acciones[tipo]?.(e.target, sc);
    }), { rootMargin: '-48% 0px -48% 0px' });
    pasos.forEach(p => io.observe(p));
    acciones[tipo]?.(pasos[0], sc);
  });

  /* ---------- Video: carga diferida y versión según pantalla ---------- */
  const fig = $('.video'), vid = $('#vid'), src = $('source', vid), play = $('.video__play');
  const cargar = () => {
    if (src.src) return;
    const hd = matchMedia('(min-width: 900px) and (min-resolution: 1dppx)').matches && !(navigator.connection?.saveData);
    src.src = hd ? src.dataset.srcHd : src.dataset.srcSd;
    vid.load();
  };
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { cargar(); o.disconnect(); } }), { rootMargin: '400px' }).observe(fig);
  play.addEventListener('click', () => { cargar(); vid.play(); });
  vid.addEventListener('play', () => fig.classList.add('reproduciendo'));
  vid.addEventListener('pause', () => { if (!vid.seeking) fig.classList.remove('reproduciendo'); });
  vid.addEventListener('ended', () => fig.classList.remove('reproduciendo'));
  // Pausa al salir de pantalla
  new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && !vid.paused) vid.pause(); }), { threshold: 0.2 }).observe(fig);

  /* ---------- Acordeón ---------- */
  $$('.acordeon button').forEach(b => b.addEventListener('click', () => {
    const abierto = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', !abierto);
  }));

  /* ---------- Escenarios de inversión ---------- */
  const tabs = $$('.tabs button');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    const esc = t.dataset.esc;
    $$('.inv__n').forEach(n => {
      n.classList.add('cambia');
      setTimeout(() => { n.textContent = n.dataset[esc]; n.classList.remove('cambia'); }, 220);
    });
  }));
})();

/* =========================================================
   Interactivos: año, marea, edad, calculadora
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const num = (n, d = 0) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Un año: esporádico vs Azotea ---------- */
  const anio = $('.anio');
  if (anio) {
    const cont = $('.anio__meses', anio), MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    cont.innerHTML = MESES.map(m => `<span class="mes">${m}</span>`).join('');
    const meses = $$('.mes', cont);
    const textos = {
      esporadico: [3, 'Un taller en marzo, una brigada en julio, una jornada en noviembre. Entre una lancha y la siguiente, el proceso se enfría.', [2, 6, 10]],
      azotea: [12, 'Todos los meses, en el mismo lugar y con el mismo equipo. Las niñas, niños y jóvenes saben dónde encontrarlo y a quién.', [...Array(12).keys()]]
    };
    const poner = modo => {
      const [n, txt, on] = textos[modo];
      anio.dataset.modo = modo;
      meses.forEach((m, i) => { m.classList.remove('on'); });
      on.forEach((i, k) => setTimeout(() => meses[i].classList.add('on'), 70 * k));
      $('.anio__n', anio).textContent = n;
      $('.anio__desc', anio).textContent = txt;
    };
    const botones = $$('#anio .conmuta button');
    botones.forEach(b => b.addEventListener('click', () => {
      botones.forEach(x => x.setAttribute('aria-selected', x === b));
      poner(b.dataset.modo);
    }));
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { poner('esporadico'); o.disconnect(); } }), { threshold: .4 }).observe(anio);
  }

  /* ---------- Sube la marea ---------- */
  const nivel = $('#nivel');
  if (nivel) {
    const agua = $('.agua'), borde = $('.agua__borde'), msg = $('#marea-msg'), brotes = $$('.suelo image');
    const pinta = () => {
      const v = +nivel.value;                // 0–100
      const y = 360 - v * 1.15;              // superficie: de 360 a 245
      agua.setAttribute('y', y); agua.setAttribute('height', 420 - y);
      borde.style.transform = `translateY(${y - 360}px)`;
      brotes.forEach(b => b.style.opacity = v > 55 ? .25 : 1);
      msg.textContent = v < 20 ? 'Arrastra para subir la marea.'
        : v < 55 ? 'La marea sube. Abajo, el agua empieza a tocar la huerta.'
        : 'Lo que se sembró abajo, la marea se lo lleva. Arriba, la azotea sigue seca.';
    };
    nivel.addEventListener('input', pinta); pinta();
    // Pequeña demostración la primera vez que se ve
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      o.disconnect(); let v = 0;
      const sube = () => { if (+nivel.value !== v) return; v += 2; nivel.value = v; pinta(); if (v < 48) setTimeout(sube, 35); };
      setTimeout(sube, 500);
    }), { threshold: .6 }).observe(nivel.closest('.interactivo'));
  }

  /* ---------- ¿Dónde entra cada quien? ---------- */
  const edadR = $('#edad-r');
  if (edadR) {
    const out = $('#edad-o'), img = $('.edad__img'), tramo = $('.edad__tramo'), txt = $('.edad__txt'), cupos = $('.edad__cupos');
    const T = [
      { max: 13, n: 'Semilleros', img: 'semilla', cupos: '90 cupos por nodo al año',
        t: e => `A los ${e} años, el foco es seguir en la escuela: matemáticas con marimba, lectura con tradición oral y un lugar seguro después de clases.` },
      { max: 17, n: 'Aprendices del Territorio', img: 'brote', cupos: '60 cupos por nodo al año',
        t: e => `A los ${e} años, aprende con sabedoras y sabedores, conoce los oficios de su territorio y escribe su propia ruta hacia la media técnica.` },
      { max: 28, n: 'Cosecha', img: 'planta-fruto', cupos: '90 cupos por nodo al año',
        t: e => `A los ${e} años, lo aprendido se vuelve oficio: certificación, empleo con aliados o un negocio propio.` }
    ];
    let actual = '';
    const pinta = () => {
      const e = +edadR.value, t = T.find(x => e <= x.max);
      out.textContent = e; txt.textContent = t.t(e); cupos.textContent = t.cupos;
      if (t.n !== actual) {
        actual = t.n; tramo.textContent = t.n;
        img.classList.add('pop'); img.src = `assets/img/${t.img}.png`;
        setTimeout(() => img.classList.remove('pop'), 180);
      }
    };
    edadR.addEventListener('input', pinta); pinta();
  }

  /* ---------- Calculadora de aliado ---------- */
  const aporte = $('#aporte');
  if (aporte) {
    const ESC = { completo: { total: 16762.0, persona: 16762.0 / 2800, nodo: 920.4 },
                  basico:   { total: 14577.1, persona: 14577.1 / 2800, nodo: 788.0 } };
    const escActual = () => $('.tabs button[aria-selected="true"]')?.dataset.esc || 'completo';
    const pinta = () => {
      const v = +aporte.value, e = ESC[escActual()];
      $('#aporte-o').textContent = num(v);
      $('#c-pers').textContent = num(Math.floor(v / e.persona));
      $('#c-mes').textContent = num(v / e.nodo * 12, 1);
      $('#c-pct').textContent = num(Math.min(100, v / e.total * 100), 1) + ' %';
    };
    aporte.addEventListener('input', pinta);
    $$('.calc__chips button').forEach(b => b.addEventListener('click', () => { aporte.value = b.dataset.v; pinta(); }));
    $$('.tabs button').forEach(b => b.addEventListener('click', () => setTimeout(pinta, 0)));
    pinta();
  }
})();
