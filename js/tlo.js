(function () {
  const kolory = ['#ffb7c5', '#ff8fab', '#f06292', '#ffd1dc'];
  const kolorySlisci = ['#e85d75', '#ff7f50', '#d7263d', '#ff9eb5', '#c2185b'];

  const wiatr = [
    { top: 18, width: 180, delay: 0 },
    { top: 26, width: 120, delay: 0.15 },
    { top: 35, width: 220, delay: 0.3 },
    { top: 52, width: 140, delay: 0.1 },
    { top: 63, width: 200, delay: 0.4 },
    { top: 74, width: 100, delay: 0.25 },
  ];

  const latarnie = [
    { left: 41, top: 72 },
    { left: 57, top: 72 },
    { left: 67, top: 76 },
    { left: 78, top: 76 },
    { left: 90, top: 79 },
  ];

  const CYKL = 4;
  const WIATR_OD = 0.1;
  const WIATR_DO = 1.6;

  const los = Math.random;

  function nowy(tag, klasa, rodzic) {
    const el = document.createElement(tag);
    el.className = klasa;
    rodzic.appendChild(el);
    return el;
  }

  function stworzCzastki() {
    const platki = Array.from({ length: 40 }, () => ({
      lisc: false,
      size: 4 + Math.floor(los() * 3) * 2,
      color: kolory[Math.floor(los() * kolory.length)],
      vy: 40 + los() * 50,    
      baseVx: 5 + los() * 15,  
      push: 150 + los() * 150, 
      sway: 10 + los() * 20,  
      vr: 60 + los() * 120,  
      blur: 0,
      flutter: 0,
    }));

    const liscie = Array.from({ length: 18 }, () => {
      const blisko = los() < 0.3;
      return {
        lisc: true,
        size: blisko ? 22 + los() * 12 : 10 + los() * 8,
        color: kolorySlisci[Math.floor(los() * kolorySlisci.length)],
        vy: blisko ? 80 + los() * 40 : 40 + los() * 30,
        baseVx: 10 + los() * 20,
        push: blisko ? 300 + los() * 150 : 150 + los() * 100,
        sway: 20 + los() * 30,
        vr: 0,
        blur: blisko ? 1.5 : 0,
        flutter: 1.5 + los() * 2,
      };
    });

    return platki.concat(liscie);
  }

  function uruchom(tlo) {
    nowy('div', 'tlo-obraz', tlo);
    nowy('div', 'slonce', tlo);

    latarnie.forEach((l, i) => {
      const d = nowy('div', 'latarnia', tlo);
      d.style.left = l.left + '%';
      d.style.top = l.top + '%';
      d.style.animationDuration = (2 + i * 0.4) + 's';
    });

    nowy('div', 'mgla', tlo);

    const czastki = stworzCzastki();
    const elementy = czastki.map((c) => {
      const el = nowy('span', 'czastka', tlo);
      if (c.lisc) {
        el.style.zIndex = c.blur ? 3 : 1;
        el.style.perspective = '400px';
        if (c.blur) el.style.filter = `blur(${c.blur}px)`;
        const l = nowy('span', 'lisc', el);
        l.style.width = c.size + 'px';
        l.style.height = c.size * 0.6 + 'px';
        l.style.background = c.color;
        l.style.animationDuration = c.flutter + 's';
      } else {
        el.style.width = c.size + 'px';
        el.style.height = c.size + 'px';
        el.style.background = c.color;
      }
      return el;
    });

    wiatr.forEach((w) => {
      const s = nowy('span', 'wiatr', tlo);
      s.style.top = w.top + '%';
      s.style.width = w.width + 'px';
      s.style.animationDelay = w.delay + 's';
    });

    nowy('div', 'cien', tlo);

    const stan = czastki.map((c) => ({
      x: los() * tlo.clientWidth,
      y: los() * tlo.clientHeight,
      vx: c.baseVx,
      rot: los() * 360,
      phase: los() * Math.PI * 2,
    }));

    function rysuj(i) {
      const s = stan[i];
      elementy[i].style.transform = czastki[i].lisc
        ? `translate(${s.x}px, ${s.y}px)`
        : `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stan.forEach((_, i) => rysuj(i));
      return;
    }

    const start = performance.now();
    let last = start;

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const t = ((now - start) / 1000) % CYKL;
      const sila =
        t > WIATR_OD && t < WIATR_DO
          ? Math.sin((Math.PI * (t - WIATR_OD)) / (WIATR_DO - WIATR_OD))
          : 0;

      const W = tlo.clientWidth;
      const H = tlo.clientHeight;

      for (let i = 0; i < czastki.length; i++) {
        const c = czastki[i];
        const s = stan[i];

        s.vx += (c.baseVx + sila * c.push - s.vx) * Math.min(1, dt * 5);
        s.phase += dt * 2;
        s.x += (s.vx + Math.sin(s.phase) * c.sway) * dt;
        s.y += c.vy * dt * (1 - sila * 0.3);
        s.rot += c.vr * dt * (1 + sila * 3);

        if (s.y > H + 40) {
          s.y = -40;
          s.x = los() * W;
        }
        if (s.x > W + 40) {
          s.x = -40;
          s.y = los() * H * 0.8;
        }

        rysuj(i);
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  document.querySelectorAll('.tlo').forEach(uruchom);
})();