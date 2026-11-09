(function () {
  const produkt = {
    nazwa: 'test',
    opis: 'test 123 janek patryk 12345',
    cena: 80,
    zdjecie: 'images/bluza.jpg',
    rozmiary: ['S', 'M', 'XXL', 'hubert XXXXXXXLLLLLLLL'],
  };

  const KODY = {
    PL: { wzor: /^\d{2}-\d{3}$/, przyklad: '00-000' },
    FR: { wzor: /^\d{5}$/, przyklad: '00000' },
  };

  const $ = (id) => document.getElementById(id);
  const modal = $('modal');
  const koszykOkno = $('koszyk');
  const adresOkno = $('adres');
  const zamowieniaOkno = $('zamowienia');

  let rozmiar = null;
  let ilosc = 1;
  let koszyk = wczytaj('koszyk');
  let zamowienia = wczytaj('zamowienia');
  let zamowienie = null;
  let timerAdres = null;

  function wczytaj(klucz) {
    try {
      return JSON.parse(localStorage.getItem(klucz)) || [];
    } catch (e) {
      return [];
    }
  }

  function zapisz(klucz, dane) {
    try {
      localStorage.setItem(klucz, JSON.stringify(dane));
    } catch (e) {}
  }

  function przewijanie() {
    const otwarte =
      !modal.hidden || !koszykOkno.hidden || !adresOkno.hidden || !zamowieniaOkno.hidden;
    document.body.style.overflow = otwarte ? 'hidden' : '';
  }

  function nowy(tag, klasa, tekst) {
    const el = document.createElement(tag);
    if (klasa) el.className = klasa;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  }

  $('karta-img').src = produkt.zdjecie;
  $('karta-img').alt = produkt.nazwa;
  $('karta-cena').textContent = produkt.cena + ' zł';

  $('modal-img').src = produkt.zdjecie;
  $('modal-img').alt = produkt.nazwa;
  $('modal-nazwa').textContent = produkt.nazwa;
  $('modal-cena').textContent = produkt.cena + ' zł';
  $('modal-opis').textContent = produkt.opis;

  const przyciskiRozmiarow = produkt.rozmiary.map((r) => {
    const b = nowy('button', 'rozmiar', r);
    b.addEventListener('click', () => {
      rozmiar = r;
      odswiez();
    });
    $('rozmiary').appendChild(b);
    return b;
  });

  function odswiez() {
    przyciskiRozmiarow.forEach((b, i) => {
      b.classList.toggle('aktywny', produkt.rozmiary[i] === rozmiar);
    });
    $('ilosc').textContent = ilosc;
    $('kup').disabled = !rozmiar;
    $('do-koszyka').disabled = !rozmiar;
  }

  function pokazKomunikat(tekst) {
    const k = $('komunikat');
    k.textContent = tekst;
    k.hidden = !tekst;
  }

  function otworz() {
    rozmiar = null;
    ilosc = 1;
    pokazKomunikat('');
    odswiez();
    modal.hidden = false;
    przewijanie();
  }

  function zamknij() {
    modal.hidden = true;
    przewijanie();
  }

  function otworzKoszyk() {
    rysujKoszyk();
    koszykOkno.hidden = false;
    przewijanie();
  }

  function zamknijKoszyk() {
    koszykOkno.hidden = true;
    przewijanie();
  }

  function dodajDoKoszyka() {
    const istniejacy = koszyk.find(
      (p) => p.nazwa === produkt.nazwa && p.rozmiar === rozmiar
    );
    if (istniejacy) {
      istniejacy.ilosc += ilosc;
    } else {
      koszyk.push({
        nazwa: produkt.nazwa,
        cena: produkt.cena,
        zdjecie: produkt.zdjecie,
        rozmiar: rozmiar,
        ilosc: ilosc,
      });
    }
    zapisz('koszyk', koszyk);
    rysujKoszyk();

    const ikona = $('koszyk-ikona');
    ikona.classList.remove('podskok');
    void ikona.offsetWidth;
    ikona.classList.add('podskok');
  }

  function zmienIlosc(i, zmiana) {
    koszyk[i].ilosc += zmiana;
    if (koszyk[i].ilosc < 1) koszyk.splice(i, 1);
    zapisz('koszyk', koszyk);
    rysujKoszyk();
  }

  function usun(i) {
    koszyk.splice(i, 1);
    zapisz('koszyk', koszyk);
    rysujKoszyk();
  }

  function rysujKoszyk() {
    const lista = $('koszyk-lista');
    lista.innerHTML = '';

    koszyk.forEach((p, i) => {
      const li = nowy('li', 'koszyk-pozycja');
      li.innerHTML = `
        <img alt="">
        <div class="koszyk-dane">
          <span class="koszyk-nazwa"></span>
          <span class="koszyk-rozmiar"></span>
          <div class="koszyk-wiersz">
            <div class="ilosc">
              <button class="k-minus">−</button>
              <span class="k-ilosc"></span>
              <button class="k-plus">+</button>
            </div>
            <span class="koszyk-cena"></span>
          </div>
        </div>
        <button class="usun" aria-label="Usuń">&times;</button>
      `;

      li.querySelector('img').src = p.zdjecie;
      li.querySelector('img').alt = p.nazwa;
      li.querySelector('.koszyk-nazwa').textContent = p.nazwa;
      li.querySelector('.koszyk-rozmiar').textContent = 'Rozmiar: ' + p.rozmiar;
      li.querySelector('.k-ilosc').textContent = p.ilosc;
      li.querySelector('.koszyk-cena').textContent = p.cena * p.ilosc + ' zł';

      li.querySelector('.k-minus').addEventListener('click', () => zmienIlosc(i, -1));
      li.querySelector('.k-plus').addEventListener('click', () => zmienIlosc(i, 1));
      li.querySelector('.usun').addEventListener('click', () => usun(i));

      lista.appendChild(li);
    });

    const pusty = koszyk.length === 0;
    lista.hidden = pusty;
    $('koszyk-pusty').hidden = !pusty;
    $('koszyk-zamow').disabled = pusty;

    const suma = koszyk.reduce((s, p) => s + p.cena * p.ilosc, 0);
    $('koszyk-suma').textContent = suma + ' zł';

    const sztuki = koszyk.reduce((s, p) => s + p.ilosc, 0);
    const licznik = $('koszyk-licznik');
    licznik.textContent = sztuki > 99 ? '99+' : sztuki;
    licznik.hidden = sztuki === 0;
  }

  function pokazBlad(tekst) {
    const b = $('adres-blad');
    b.textContent = tekst;
    b.hidden = !tekst;
  }

  function formatujKod() {
    const pole = $('adres-kod');
    const cyfry = pole.value.replace(/\D/g, '').slice(0, 5);
    pole.value =
      $('adres-kraj').value === 'PL' && cyfry.length > 2
        ? cyfry.slice(0, 2) + '-' + cyfry.slice(2)
        : cyfry;
  }

  function ustawKraj() {
    $('adres-kod').placeholder = KODY[$('adres-kraj').value].przyklad;
    formatujKod();
  }

  function otworzAdres(pozycje, zKoszyka) {
    clearTimeout(timerAdres);
    zamowienie = { pozycje: pozycje, zKoszyka: zKoszyka };

    const suma = pozycje.reduce((s, p) => s + p.cena * p.ilosc, 0);
    const opis = pozycje
      .map((p) => `${p.nazwa} (${p.rozmiar}) × ${p.ilosc}`)
      .join(', ');
    const pods = $('adres-podsumowanie');
    pods.textContent = opis + ' — razem ';
    pods.appendChild(nowy('strong', '', suma + ' zł'));

    $('adres-form').reset();
    document
      .querySelectorAll('#adres-form .zle')
      .forEach((el) => el.classList.remove('zle'));
    ustawKraj();
    pokazBlad('');
    $('adres-komunikat').hidden = true;
    $('adres-zamow').disabled = false;

    adresOkno.hidden = false;
    przewijanie();
    $('adres-kod').focus();
  }

  function zamknijAdres() {
    clearTimeout(timerAdres);
    adresOkno.hidden = true;
    przewijanie();
  }

  function rysujZamowienia() {
    const lista = $('zamowienia-lista');
    lista.innerHTML = '';

    zamowienia
      .slice()
      .reverse()
      .forEach((z, i) => {
        const li = nowy('li', 'zamowienie');

        const gora = nowy('div', 'zamowienie-gora');
        gora.appendChild(nowy('strong', '', '#' + (zamowienia.length - i)));
        gora.appendChild(
          nowy(
            'span',
            '',
            new Date(z.data).toLocaleString('pl-PL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          )
        );
        li.appendChild(gora);

        const pozycje = nowy('ul', 'zamowienie-pozycje');
        z.pozycje.forEach((p) => {
          const wiersz = nowy('li');
          wiersz.appendChild(nowy('span', '', `${p.nazwa} (${p.rozmiar}) × ${p.ilosc}`));
          wiersz.appendChild(nowy('span', '', p.cena * p.ilosc + ' zł'));
          pozycje.appendChild(wiersz);
        });
        li.appendChild(pozycje);

        li.appendChild(
          nowy(
            'p',
            'zamowienie-adres',
            `${z.adres.ulica}, ${z.adres.kod} ${z.adres.miasto}, ${z.adres.kraj}`
          )
        );

        const suma = nowy('div', 'zamowienie-suma');
        suma.appendChild(nowy('span', '', 'Suma'));
        suma.appendChild(nowy('span', '', z.suma + ' zł'));
        li.appendChild(suma);

        lista.appendChild(li);
      });

    const pusty = zamowienia.length === 0;
    lista.hidden = pusty;
    $('zamowienia-pusty').hidden = !pusty;
  }

  function otworzZamowienia() {
    rysujZamowienia();
    zamowieniaOkno.hidden = false;
    przewijanie();
  }

  function zamknijZamowienia() {
    zamowieniaOkno.hidden = true;
    przewijanie();
  }

  $('karta').addEventListener('click', otworz);
  $('zamknij').addEventListener('click', zamknij);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) zamknij();
  });

  $('koszyk-ikona').addEventListener('click', otworzKoszyk);
  $('koszyk-zamknij').addEventListener('click', zamknijKoszyk);
  koszykOkno.addEventListener('click', (e) => {
    if (e.target === koszykOkno) zamknijKoszyk();
  });

  $('adres-zamknij').addEventListener('click', zamknijAdres);
  adresOkno.addEventListener('click', (e) => {
    if (e.target === adresOkno) zamknijAdres();
  });

  $('zamowienia-zamknij').addEventListener('click', zamknijZamowienia);
  zamowieniaOkno.addEventListener('click', (e) => {
    if (e.target === zamowieniaOkno) zamknijZamowienia();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!zamowieniaOkno.hidden) zamknijZamowienia();
      else if (!adresOkno.hidden) zamknijAdres();
      else if (!koszykOkno.hidden) zamknijKoszyk();
      else if (!modal.hidden) zamknij();
      return;
    }

    if (e.key.toLowerCase() !== 'n') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, select, textarea')) return;

    if (zamowieniaOkno.hidden) otworzZamowienia();
    else zamknijZamowienia();
  });

  $('minus').addEventListener('click', () => {
    ilosc = Math.max(1, ilosc - 1);
    odswiez();
  });
  $('plus').addEventListener('click', () => {
    ilosc += 1;
    odswiez();
  });

  $('kup').addEventListener('click', () => {
    const pozycja = {
      nazwa: produkt.nazwa,
      cena: produkt.cena,
      rozmiar: rozmiar,
      ilosc: ilosc,
    };
    zamknij();
    otworzAdres([pozycja], false);
  });

  $('do-koszyka').addEventListener('click', () => {
    dodajDoKoszyka();
    pokazKomunikat(`dodano do koszyka ${ilosc} szt. (${rozmiar})`);
  });

  $('koszyk-zamow').addEventListener('click', () => {
    otworzAdres(koszyk.slice(), true);
  });

  $('adres-kod').addEventListener('input', formatujKod);
  $('adres-kraj').addEventListener('change', ustawKraj);
  ['adres-kod', 'adres-ulica', 'adres-miasto'].forEach((id) => {
    $(id).addEventListener('input', () => $(id).classList.remove('zle'));
  });

  $('adres-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const kod = $('adres-kod');
    const ulica = $('adres-ulica');
    const miasto = $('adres-miasto');
    const kraj = $('adres-kraj');

    const puste = [kod, ulica, miasto].filter((p) => !p.value.trim());
    puste.forEach((p) => p.classList.add('zle'));
    if (puste.length) return pokazBlad('Uzupełnij wszystkie pola');

    if (!KODY[kraj.value].wzor.test(kod.value)) {
      kod.classList.add('zle');
      return pokazBlad(`Kod pocztowy musi mieć format ${KODY[kraj.value].przyklad}`);
    }

    pokazBlad('');

    const adres = {
      kod: kod.value,
      ulica: ulica.value.trim(),
      miasto: miasto.value.trim(),
      kraj: kraj.selectedOptions[0].textContent,
    };

    zamowienia.push({
      data: Date.now(),
      pozycje: zamowienie.pozycje.map((p) => ({
        nazwa: p.nazwa,
        cena: p.cena,
        rozmiar: p.rozmiar,
        ilosc: p.ilosc,
      })),
      suma: zamowienie.pozycje.reduce((s, p) => s + p.cena * p.ilosc, 0),
      adres: adres,
    });
    zapisz('zamowienia', zamowienia);

    const k = $('adres-komunikat');
    k.textContent = `Zamówienie przyjęte! Wysyłka na: ${adres.ulica}, ${adres.kod} ${adres.miasto}, ${adres.kraj}`;
    k.hidden = false;
    $('adres-zamow').disabled = true;

    if (zamowienie.zKoszyka) {
      koszyk = [];
      zapisz('koszyk', koszyk);
      rysujKoszyk();
      zamknijKoszyk();
    }

    timerAdres = setTimeout(zamknijAdres, 3000);
  });

  rysujKoszyk();
})();