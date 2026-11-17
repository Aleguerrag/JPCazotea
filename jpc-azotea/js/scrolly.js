/* Azotea · reportaje scrollytelling — motor sin dependencias */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const D = window.DATOS, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fmt = (n, dec = 0) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const leer = ruta => ruta.split('.').reduce((o, k) => o?.[k], D);

  /* ---------- 1. Cifras desde data.js ---------- */
  const textoDato = el => {
    let v = leer(el.dataset.dato); if (v == null) return '';
    if ('redondo' in el.dataset) v = Math.round(v);
    const dec = +(el.dataset.dec || 0);
    return ('miles' in el.dataset || dec) ? fmt(v, dec) : String(v).replace('.', ',');
  };
  $$('[data-dato]').forEach(el => { if (!el.classList.contains('cuenta')) el.textContent = textoDato(el); });

  const estadoClase = { 'verificado': 'verificado', 'proyección': 'proyeccion', 'respaldado con límites': 'limites' };
  const sello = k => { const f = D.fuentes[k]; return `<span class="est est--${estadoClase[f.estado]}">${f.estado}</span> Fuente: ${f.nombre}`; };
  $$('[data-fuente]').forEach(el => el.innerHTML = sello(el.dataset.fuente));
  $('.fuentes').innerHTML = [
    ['Cobertura neta en educación media 2023: Colombia 50,9 %; Buenaventura 33,7 %; Cauca 37,2 %; Nariño 37,3 %; Chocó 25,1 %.', 'icesi'],
    ['Buenaventura 2023, sector oficial: aprobación 85,6 %; repitencia 13,0 %; deserción 3,53 %.', 'sineb'],
    ['Lo esporádico de la oferta institucional en el litoral.', 'diag'],
    ['Metas 2030, cupos por tramo, diseño de evaluación y costeo.', 'jpc']
  ].map(([t, k]) => `<li><span>${t}</span> ${sello(k)}</li>`).join('');

  /* ---------- 2. Testimonios reales (solo si existen) ---------- */
  (window.TESTIMONIOS || []).forEach(t => {
    const caja = $(`.testimonios[data-capitulo="${t.capitulo}"]`); if (!caja) return;
    caja.hidden = false;
    caja.insertAdjacentHTML('beforeend', `<blockquote class="papel"><p>«${t.cita}»</p><cite>${t.nombre}${t.rol ? ', ' + t.rol : ''}${t.lugar ? ' · ' + t.lugar : ''}</cite></blockquote>`);
  });

  /* ---------- 3. Portadas: título palabra por palabra ---------- */
  $$('[data-palabras]').forEach(h => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  });
  const veIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ve'); veIO.unobserve(e.target); } }), { threshold: .35 });
  $$('.portada').forEach(p => veIO.observe(p));

  /* ---------- 4. Pasos ---------- */
  const enRango = (spec, n) => {
    if (spec.endsWith('-')) return n >= +spec.slice(0, -1);
    if (spec.includes('-')) { const [a, b] = spec.split('-').map(Number); return n >= a && n <= b; }
    return n === +spec;
  };
  const alPaso = {};
  $$('.escena').forEach(sec => {
    const pasos = $$('.paso', sec);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const n = +e.target.dataset.n;
      pasos.forEach(p => p.classList.toggle('on', p === e.target));
      sec.dataset.paso = n;
      $$('[data-s]', sec).forEach(el => el.classList.toggle('on', enRango(el.dataset.s, n)));
      Object.keys(alPaso).forEach(k => sec.classList.contains(k) && alPaso[k](sec, n));
    }), { rootMargin: '-48% 0px -48% 0px' });
    pasos.forEach(p => io.observe(p));
  });

  /* Cap. 2 · el año y la lancha */
  const meses = $('.anio__meses');
  ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'].forEach(m => meses.insertAdjacentHTML('beforeend', `<span class="mes">${m}</span>`));
  const mesEls = $$('.mes', meses), lancha = $('.lancha');
  const visitas = [2, 6, 10];
  alPaso['escena--anio'] = (sec, n) => {
    mesEls.forEach(m => m.classList.remove('on', 'fria'));
    visitas.forEach((m, i) => { if (i + 1 < n || (n === 4)) mesEls[m].classList.add('fria'); else if (i + 1 === n) mesEls[m].classList.add('on'); });
    $('.anio__n').textContent = Math.min(n, 3);
    const destino = n <= 3 ? mesEls[visitas[n - 1]] : null;
    lancha.style.transform = destino ? `translateX(${destino.offsetLeft + destino.offsetWidth / 2 - 75}px)` : `translateX(${meses.offsetWidth + 40}px)`;
  };

  /* Cap. 2 · gráfico de 100 unidades */
  const grilla = $('.unidades__grilla');
  grilla.innerHTML = Array.from({ length: 100 }, (_, i) => `<span class="u" style="--d:${i}"></span>`).join('');
  const us = $$('.u', grilla), res = $('.unidades__res');
  alPaso['escena--unidades'] = (sec, n) => {
    const nac = Math.round(D.cobertura_media.nacional), bun = Math.round(D.cobertura_media.buenaventura);
    const quedan = n === 1 ? 100 : n === 2 ? nac : bun;
    us.forEach((u, i) => u.classList.toggle('off', i >= quedan));
    res.innerHTML = n === 1 ? '100 <small>jóvenes de tu edad</small>'
      : n === 2 ? `${nac} <small>están en la media · Colombia</small>`
      : `${bun} <small>están en la media · Buenaventura</small>`;
  };

  /* ---------- 5. Scrub (progreso 0–1 ligado al scroll) ---------- */
  const alScrub = {};

  /* Apertura · la marea sube */
  const agua = $('.m-agua'), ola = $('.m-ola'), suelo = $('.m-suelo');
  alScrub.marea = p => {
    const y = 600 - clamp(p * 1.35) * 92;         // superficie de 600 a 508: los pilotes quedan a la vista
    agua.setAttribute('y', y); agua.setAttribute('height', 1000 - y);
    ola.setAttribute('transform', `translate(${(p * 400) % 100 - 100} ${y - 600})`);
    suelo.classList.toggle('bajo', y < 560);
  };

  /* Cap. 3 · rueda de 12 meses */
  const g = $('.rueda__meses'), M = ['E','F','M','A','M','J','J','A','S','O','N','D'];
  const polar = (r, a) => [300 + r * Math.cos(a), 300 + r * Math.sin(a)];
  M.forEach((m, i) => {
    const a0 = -Math.PI / 2 + i * Math.PI / 6 + .02, a1 = a0 + Math.PI / 6 - .04;
    const [x0, y0] = polar(292, a0), [x1, y1] = polar(292, a1), [x2, y2] = polar(212, a1), [x3, y3] = polar(212, a0);
    const [tx, ty] = polar(252, (a0 + a1) / 2);
    g.insertAdjacentHTML('beforeend', `<path d="M${x0} ${y0} A292 292 0 0 1 ${x1} ${y1} L${x2} ${y2} A212 212 0 0 0 ${x3} ${y3}Z"/><text x="${tx}" y="${ty}">${m}</text>`);
  });
  const sectores = $$('path', g), letras = $$('text', g), ruedaN = $('.rueda__n b');
  alScrub.rueda = p => {
    const k = Math.round(clamp((p - .05) / .6) * 12);
    sectores.forEach((s, i) => s.classList.toggle('on', i < k));
    letras.forEach((t, i) => t.classList.toggle('on', i < k));
    ruedaN.textContent = k;
  };

  /* Cap. 4 · línea de tiempo horizontal con pausas de lectura */
  const pista = $('.horizontal__pista'), linea = $('.horizontal__linea'), PANELES = 4, PAUSA = .55;
  alScrub.horizontal = p => {
    const u = clamp(p) * (PANELES - 1 + PAUSA), i = Math.floor(u), f = u - i;
    let pos = i + (f < PAUSA ? 0 : (t => t * t * (3 - 2 * t))((f - PAUSA) / (1 - PAUSA)));
    pos = Math.min(pos, PANELES - 1);
    pista.style.setProperty('--hx', (pos * 100).toFixed(2));
    linea.style.setProperty('--hp', (.125 + pos / (PANELES - 1) * .75).toFixed(3));
  };

  /* Cap. 6 · la costa se dibuja y se encienden las Azoteas */
  const costa = $('.mapa__costa--viva'), guia = $('.mapa__guia'), L = costa.getTotalLength();
  costa.style.strokeDasharray = L;
  const sitios = [.1, .27, .47, .62, .77, .93];
  const gp = $('.mapa__puntos');
  sitios.forEach((f, i) => {
    const pt = costa.getPointAtLength(L * f);
    gp.insertAdjacentHTML('beforeend', `<circle cx="${pt.x}" cy="${pt.y}" r="0" class="${i === 2 ? 'primera' : ''}"/>`);
  });
  const circs = $$('circle', gp), hudN = $('.hud-nodos'), hudP = $('.hud-pers');
  alScrub.mapa = p => {
    const d = clamp((p - .12) / .55);
    costa.style.strokeDashoffset = L * (1 - d);
    const pt = costa.getPointAtLength(L * d); guia.setAttribute('cx', pt.x); guia.setAttribute('cy', pt.y);
    let n = 0;
    circs.forEach((c, i) => {
      const on = i === 2 ? p > .04 : d >= sitios[i] && p > .3;
      const r = on ? (i === 2 ? 12 : 9) : 0;
      c.setAttribute('r', r); c.style.r = r; if (on) n++;
    });
    hudN.textContent = n;
    hudP.textContent = fmt(Math.round(D.metas_2030.personas * clamp((p - .66) / .26) / 10) * 10);
  };

  const scrubs = $$('[data-scrub]');
  const barra = $('.progreso span'), top = $('.top'), cierre = $('#cierre'), portadas = $$('.portada'), caps = $$('.top__caps a');
  let pend = false;
  const tick = () => {
    pend = false;
    const vh = innerHeight, y = scrollY, H = document.documentElement.scrollHeight - vh;
    barra.style.setProperty('--p', (y / H).toFixed(4));
    top.classList.toggle('solida', y > 40);
    scrubs.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      alScrub[s.dataset.scrub]?.(clamp(-r.top / (r.height - vh)));
    });
    let actual = -1;
    portadas.forEach((p, i) => { if (p.getBoundingClientRect().top < vh * .5) actual = i; });
    if (cierre.getBoundingClientRect().top < vh * .5) actual = -1;
    caps.forEach((a, i) => a.classList.toggle('activo', i === actual));
    const rc = cierre.getBoundingClientRect();
    if (rc.top < vh && rc.bottom > 0) cierre.style.setProperty('--pc', clamp(1 - rc.top / vh).toFixed(3));
  };
  addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick);
  tick();

  /* ---------- 6. Contadores ---------- */
  const cntIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cntIO.unobserve(e.target);
    const fin = leer(e.target.dataset.dato), t0 = performance.now();
    if (reduce) { e.target.textContent = fmt(fin); return; }
    const f = t => { const k = clamp((t - t0) / 1400); e.target.textContent = fmt(fin * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }), { threshold: .5 });
  $$('.cuenta').forEach(c => cntIO.observe(c));

  /* ---------- 7. Cierre: vuelve al gancho ---------- */
  const lIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; lIO.disconnect();
    $$('.cierre__l').forEach((l, i) => setTimeout(() => l.classList.add('on'), reduce ? 0 : i * 900));
  }), { threshold: .4 });
  lIO.observe($('.cierre__in'));

  /* ---------- 8. Lluvia de la apertura ---------- */
  const cv = $('.lluvia');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let gotas = [], vivo = true;
    const tam = () => { cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio;
      gotas = Array.from({ length: Math.round(cv.width / 9) }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, v: 6 + Math.random() * 10, l: 10 + Math.random() * 18 })); };
    tam(); addEventListener('resize', tam);
    new IntersectionObserver(es => { vivo = es[0].isIntersecting; if (vivo) requestAnimationFrame(dibuja); }).observe(cv);
    function dibuja() {
      if (!vivo) return;
      ctx.clearRect(0, 0, cv.width, cv.height); ctx.strokeStyle = 'rgba(246,239,230,.35)'; ctx.lineWidth = devicePixelRatio;
      ctx.beginPath();
      gotas.forEach(g => { ctx.moveTo(g.x, g.y); ctx.lineTo(g.x - 2, g.y + g.l); g.y += g.v * devicePixelRatio; if (g.y > cv.height) { g.y = -20; g.x = Math.random() * cv.width; } });
      ctx.stroke(); requestAnimationFrame(dibuja);
    }
  }

  /* ---------- 9. Video: modal y versión según pantalla ---------- */
  const srcVideo = () => {
    const hd = matchMedia('(min-width: 900px)').matches && !navigator.connection?.saveData;
    return `assets/video/azotea-${hd ? 1080 : 720}.mp4`;
  };
  const modal = $('#modal-video'), mv = $('video', modal);
  $$('.abre-video').forEach(b => b.addEventListener('click', () => {
    if (!mv.src) mv.src = srcVideo();
    modal.showModal(); mv.play().catch(() => {});
  }));
  const cerrar = () => { mv.pause(); modal.close(); };
  $('.modal__cerrar').addEventListener('click', cerrar);
  modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
  modal.addEventListener('close', () => mv.pause());
  const vid = $('#vid'), src = $('source', vid);
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { src.src = srcVideo(); vid.load(); o.disconnect(); } }), { rootMargin: '400px' }).observe(vid);

  /* ---------- 10. Calculadora de aliado ---------- */
  const aporte = $('#aporte'), out = $('#aporte-o'), botones = $$('.calc .conmuta button');
  let esc = 'completo';
  const calcula = () => {
    const v = +aporte.value, e = D.inversion[esc], persona = e.total / D.metas_2030.personas;
    out.textContent = fmt(v);
    $('#c-pers').textContent = fmt(Math.floor(v / persona));
    $('#c-mes').textContent = fmt(v / e.nodo * 12, 1);
    $('#c-pct').textContent = fmt(Math.min(100, v / e.total * 100), 1) + ' %';
  };
  aporte.addEventListener('input', calcula);
  botones.forEach(b => b.addEventListener('click', () => { botones.forEach(x => x.setAttribute('aria-selected', x === b)); esc = b.dataset.esc; calcula(); }));
  $$('.calc__chips button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.v; aporte.value = isNaN(k) ? Math.round(D.inversion[esc][k]) : k; calcula();
  }));
  calcula();
})();
