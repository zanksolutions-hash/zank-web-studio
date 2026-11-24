/* Réservation en ligne et espace pro de démonstration pour les maquettes de prospects.
 * <script src="/demo/rdv-demo.js" data-site="slug" defer></script> (ajouté par rdv-worker/scripts/demos.py)
 * Remplace le formulaire de demande de rendez-vous par l'agenda en ligne (Worker zank-rdv, dossier rdv-worker/)
 * et ajoute une section qui présente le tableau de bord, avec un aperçu réel de l'agenda de démonstration. */
(() => {
  const SITE = document.currentScript && document.currentScript.dataset.site;
  if (!SITE) return;
  const API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'http://localhost:8790' : 'https://zank-rdv.zank-solutions.workers.dev';
  const AGENDA = API + '/agenda/' + SITE;

  /* Couleurs reprises de la maquette : variables du gabarit, sinon bouton principal et texte de la page */
  const css = getComputedStyle(document.documentElement), corps = getComputedStyle(document.body);
  const v = n => css.getPropertyValue(n).trim();
  const vide = c => !c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)';
  const bouton = document.querySelector('.btn, .button, button[type=submit], a[class*=btn]');
  const fondBouton = bouton && getComputedStyle(bouton).backgroundColor;
  const acc = v('--accent') || v('--acc') || v('--primary') || v('--brand') || (!vide(fondBouton) ? fondBouton : '') || '#1f2a24';
  const ink = v('--ink') || v('--encre') || v('--text') || corps.color || '#1f2a24';
  const fond = v('--bg') || v('--papier') || (!vide(corps.backgroundColor) ? corps.backgroundColor : '') || '#ffffff';
  const carte = v('--card') || v('--blanc') || v('--surface') || '#ffffff';
  const titres = v('--serif') || getComputedStyle(document.querySelector('h2, h1') || document.body).fontFamily;

  // Accent clair (vert pâle, sable…) : texte foncé dessus et horaires dans la couleur du texte, pour rester lisible
  const lum = (() => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = acc; c.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(c.getImageData(0, 0, 1, 1).data.slice(0, 3)).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; });
    return .2126 * r + .7152 * g + .0722 * b; })();
  const clair = lum > .3;
  const style = document.createElement('style');
  style.textContent = `
.zr{--zr-acc:${acc};--zr-sur:${clair ? '#1b1b1b' : '#fff'};--zr-heure:${clair ? 'var(--zr-ink)' : 'var(--zr-acc)'};--zr-ink:${ink};--zr-bg:${fond};--zr-card:${carte};--zr-line:color-mix(in srgb,var(--zr-ink) 14%,transparent);--zr-muted:color-mix(in srgb,var(--zr-ink) 64%,transparent);--zr-titre:${titres}}
.zr *{box-sizing:border-box}
.zr-resa{background:var(--zr-bg);color:var(--zr-ink);border-radius:26px;padding:clamp(22px,4vw,36px);display:grid;gap:16px;align-self:start;text-align:left;box-shadow:0 1px 0 var(--zr-line)}
.zr-resa h3{margin:0;font:400 clamp(24px,3vw,28px)/1.15 var(--zr-titre)}
.zr-resa form{all:unset;display:grid;gap:12px}
.zr-resa label{display:grid;gap:6px;font-size:13.5px;font-weight:500;color:var(--zr-ink)}
.zr-resa input,.zr-resa select{width:100%;font:inherit;font-size:15px;color:var(--zr-ink);background:var(--zr-card);border:1px solid var(--zr-line);border-radius:12px;padding:12px 14px;outline:none}
.zr-resa input:focus,.zr-resa select:focus{border-color:var(--zr-acc);box-shadow:0 0 0 3px color-mix(in srgb,var(--zr-acc) 22%,transparent)}
.zr-f2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.zr-jours{display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));gap:8px}
.zr-jour{border:1px solid var(--zr-line);border-radius:14px;padding:10px 12px;background:var(--zr-card);font:inherit;color:var(--zr-ink);text-align:left;cursor:pointer;display:grid;gap:2px;transition:border-color .2s,background .2s}
.zr-jour b{font-size:13px;font-weight:600;text-transform:capitalize}
.zr-jour span{font-size:15px;color:var(--zr-heure);font-weight:600}
.zr-jour:hover{border-color:var(--zr-acc)}
.zr-jour[aria-pressed=true]{background:var(--zr-acc);border-color:var(--zr-acc);color:var(--zr-sur)}
.zr-jour[aria-pressed=true] span{color:var(--zr-sur)}
.zr-info{margin:0;font-size:13.5px;color:var(--zr-muted)}
.zr-recap{margin:0;padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--zr-acc) 10%,var(--zr-card));font-size:14px}
.zr-go{all:unset;box-sizing:border-box;display:inline-flex;justify-content:center;align-items:center;gap:8px;background:var(--zr-acc);color:var(--zr-sur);border-radius:999px;padding:14px 26px;font-weight:600;font-size:15px;cursor:pointer;text-align:center;text-decoration:none;transition:transform .2s,filter .2s}
.zr-go:hover{transform:translateY(-1px);filter:brightness(1.06)}
.zr-go[disabled]{opacity:.55;cursor:wait}
.zr-err{margin:0;color:#b3261e;font-size:13.5px}
.zr-ok{margin:0;padding:12px 14px;border-radius:12px;background:#e7f3ea;color:#1d4d2b;font-size:14px}
.zr-note{margin:0;font-size:12px;color:var(--zr-muted)}
.zr-piege{position:absolute;left:-9999px}
.zr-pro{padding:clamp(56px,9vw,110px) 0;background:var(--zr-bg);color:var(--zr-ink)}
.zr-wrap{width:min(1180px,100% - 40px);margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(32px,5vw,64px);align-items:center}
.zr-tag{display:inline-block;margin:0 0 14px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--zr-acc)}
.zr-pro h2{margin:0 0 14px;font:400 clamp(30px,4.2vw,48px)/1.08 var(--zr-titre);letter-spacing:-.015em}
.zr-lead{margin:0 0 26px;font-size:17px;line-height:1.55;color:var(--zr-muted)}
.zr-mods{display:grid;grid-template-columns:1fr 1fr;gap:18px 22px;margin:0 0 30px;padding:0;list-style:none}
.zr-mods li{display:grid;grid-template-columns:34px 1fr;gap:0 12px;font-size:14px;line-height:1.45;color:var(--zr-muted)}
.zr-mods svg{grid-row:span 2;width:34px;height:34px;padding:8px;border-radius:10px;background:color-mix(in srgb,var(--zr-acc) 13%,transparent);color:var(--zr-acc);fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.zr-mods b{color:var(--zr-ink);font-size:15px;font-weight:600}
.zr-actions{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center}
.zr-lien{color:var(--zr-ink);font-size:14.5px;font-weight:500;text-decoration:underline;text-underline-offset:3px}
.zr-mini{margin:14px 0 0;font-size:12.5px;color:var(--zr-muted)}
.zr-ecran{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--zr-line);background:#eef0ee;box-shadow:0 30px 60px -30px rgba(0,0,0,.35);aspect-ratio:16/10}
.zr-ecran::before{content:"";display:block;height:28px;background:var(--zr-card);border-bottom:1px solid var(--zr-line)}
.zr-ecran i{position:absolute;top:10px;width:9px;height:9px;border-radius:50%;background:var(--zr-line)}
.zr-ecran iframe{position:absolute;top:28px;left:0;width:1280px;height:800px;border:0;transform-origin:0 0;pointer-events:none}
.zr-ecran a{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:18px;background:linear-gradient(transparent 70%,rgba(0,0,0,.28));color:#fff;font-weight:600;font-size:14px;text-decoration:none;opacity:0;transition:opacity .25s}
.zr-ecran:hover a,.zr-ecran a:focus{opacity:1}
.zr-flottant{position:fixed;right:18px;bottom:62px;z-index:89;box-shadow:0 12px 30px -10px rgba(0,0,0,.45);transition:opacity .25s,transform .25s}
.zr-flottant[data-cache]{opacity:0;transform:translateY(12px);pointer-events:none}
.zr-section{padding:clamp(56px,8vw,96px) 0}
.zr-section .zr-resa{width:min(640px,100% - 40px);margin:0 auto}
@media (max-width:860px){.zr-wrap{grid-template-columns:1fr}.zr-mods{grid-template-columns:1fr}}
@media (max-width:520px){.zr-f2{grid-template-columns:1fr}.zr-flottant{right:12px;bottom:56px;padding:12px 20px}}
`;
  document.head.append(style);

  const el = (tag, attrs = {}, ...enfants) => {
    const e = document.createElement(tag);
    for (const [k, x] of Object.entries(attrs)) k === 'text' ? (e.textContent = x) : e.setAttribute(k, x);
    e.append(...enfants);
    return e;
  };
  const champ = (txt, attrs) => el('label', {}, txt, el('input', attrs));
  const heure = m => Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0');
  const date = (j, o) => new Intl.DateTimeFormat('fr-BE', { timeZone: 'UTC', ...o }).format(new Date(j + 'T12:00:00Z'));
  const appel = (chemin, opt) => fetch(API + chemin, opt).then(r => r.json().then(d => ({ status: r.status, d })));

  /* 1. Bloc de réservation, à la place du formulaire de demande de rendez-vous */
  const resa = el('div', { class: 'zr zr-resa', id: 'reserver' });
  const soin = el('select', { required: '', disabled: '' }, el('option', { value: '', text: 'Chargement…' }));
  const jours = el('div', { class: 'zr-jours' });
  const info = el('p', { class: 'zr-info', text: 'Choisissez une prestation pour voir les horaires libres.' });
  const recap = el('p', { class: 'zr-recap', hidden: '' });
  const err = el('p', { class: 'zr-err', role: 'alert', hidden: '' });
  const ok = el('p', { class: 'zr-ok', role: 'status', hidden: '' });
  const go = el('button', { class: 'zr-go', type: 'submit', text: 'Confirmer le rendez-vous' });
  const commune = champ('Commune où se rendre', { name: 'commune', autocomplete: 'address-level2' });
  commune.hidden = true;
  const f = el('form', { novalidate: '' },
    el('div', { class: 'zr-f2' }, champ('Nom', { name: 'nom', required: '', autocomplete: 'name' }), champ('E-mail', { name: 'email', type: 'email', required: '', autocomplete: 'email' })),
    champ('Téléphone (facultatif)', { name: 'telephone', type: 'tel', autocomplete: 'tel' }),
    commune,
    el('input', { class: 'zr-piege', name: 'web', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' }),
    recap, err, go, ok);
  resa.append(
    el('h3', { text: 'Réserver en ligne' }),
    el('label', {}, 'Prestation', soin),
    info, jours, f,
    el('p', { class: 'zr-note', text: 'Démonstration : la réservation arrive dans l\'agenda de démonstration, visible par toute personne qui consulte cette maquette. Un nom fictif suffit.' }));

  const ancien = document.querySelector('#rdv form[data-web3]') || document.querySelector('form[data-web3]') || document.querySelector('#contact form, #rdv form');
  let bloc;
  if (ancien) {
    ancien.replaceWith(resa);
    bloc = resa.closest('section') || resa;
    const lead = document.querySelector('#rdv .lead');
    if (lead && /appelez|demande/i.test(lead.textContent)) lead.textContent = 'Choisissez votre prestation et un horaire libre : votre rendez-vous est confirmé tout de suite, par e-mail.';
  } else {
    bloc = el('section', { class: 'zr zr-section', id: 'rdv-en-ligne' }, resa);
    const pied = document.querySelector('footer');
    pied ? pied.before(bloc) : document.body.append(bloc);
  }

  /* 2. Section « espace pro » : les modules, et l'agenda de démonstration en aperçu */
  const ico = d => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = d; return s; };
  const MODULES = [
    ['Réservation 24 h sur 24', 'Vos clients voient les horaires réellement libres et réservent sans vous appeler.', '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M9 15l2 2 4-4"/>'],
    ['Agenda et calendrier', 'Jour, semaine ou mois. Un rendez-vous pris par téléphone s\'ajoute en quelques secondes.', '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 10h18M8 14h3M8 17h6"/>'],
    ['Tableau de bord', 'Les rendez-vous du jour, les nouvelles réservations et les chiffres du mois.', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
    ['Fichier clients', 'Chaque client a sa fiche : coordonnées, historique des rendez-vous et notes.', '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 11h5M19.5 8.5v5"/>'],
    ['Confirmations par e-mail', 'Chaque réservation est confirmée au client, avec un lien pour annuler ou déplacer.', '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>'],
    ['Déplacer en un clic', 'Vous proposez un autre horaire, le client l\'accepte depuis son e-mail.', '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>'],
  ];
  const ecran = el('div', { class: 'zr-ecran' }, el('i', { style: 'left:12px' }), el('i', { style: 'left:26px' }), el('i', { style: 'left:40px' }));
  const cadre = el('iframe', { title: 'Aperçu du tableau de bord de démonstration', loading: 'lazy', tabindex: '-1', 'aria-hidden': 'true' });
  ecran.append(cadre, el('a', { href: AGENDA, target: '_blank', rel: 'noopener', text: 'Ouvrir le tableau de bord' }));
  const pro = el('section', { class: 'zr zr-pro', id: 'espace-pro' },
    el('div', { class: 'zr-wrap' },
      el('div', {},
        el('p', { class: 'zr-tag', text: 'Inclus avec le site' }),
        el('h2', { text: 'Votre agenda en ligne, avec son tableau de bord.' }),
        el('p', { class: 'zr-lead', text: 'Les réservations faites sur le site arrivent directement dans votre agenda. Vous gérez tout au même endroit, sur ordinateur comme sur GSM.' }),
        el('ul', { class: 'zr-mods' }, ...MODULES.map(([t, d, i]) => el('li', {}, ico(i), el('b', { text: t }), d))),
        el('div', { class: 'zr-actions' },
          el('a', { class: 'zr-go', href: AGENDA, target: '_blank', rel: 'noopener', text: 'Ouvrir le tableau de bord de démo' }),
          el('a', { class: 'zr-lien', href: '#reserver', text: 'Tester une réservation' }),
          el('a', { class: 'zr-lien', href: API + '/apercu', target: '_blank', rel: 'noopener', text: 'L\'e-mail reçu par le client' })),
        el('p', { class: 'zr-mini', text: 'Mot de passe de démonstration : demo. Les rendez-vous affichés sont fictifs.' })),
      ecran));
  bloc.after(pro);
  // L'aperçu n'est chargé qu'à l'approche de la section, puis mis à l'échelle de l'écran
  const echelle = () => { cadre.style.transform = `scale(${ecran.clientWidth / 1280})`; };
  new ResizeObserver(echelle).observe(ecran);
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { cadre.src = AGENDA; o.disconnect(); } }, { rootMargin: '600px' }).observe(ecran);

  /* 3. Bouton flottant, masqué quand la réservation est à l'écran */
  const flottant = el('a', { class: 'zr zr-go zr-flottant', href: '#reserver', text: 'Réserver en ligne' });
  document.body.append(flottant);
  new IntersectionObserver(e => { e[0].isIntersecting ? flottant.setAttribute('data-cache', '') : flottant.removeAttribute('data-cache'); }).observe(resa);
  document.querySelectorAll('a[href="#rdv"], a[href="#contact"]').forEach(a => { if (/rendez-vous|réserv/i.test(a.textContent)) a.href = '#reserver'; });

  /* 4. Créneaux et réservation */
  let soins = [], p = null, c = null;
  const HS = 'Agenda indisponible pour le moment. Réessayez dans un instant.';
  const erreur = m => { err.textContent = m; err.hidden = !m; };
  function charger() {
    c = null; recap.hidden = true; jours.replaceChildren();
    if (!p) { info.textContent = 'Choisissez une prestation pour voir les horaires libres.'; return Promise.resolve(); }
    info.textContent = 'Recherche des disponibilités…';
    return appel('/creneaux?site=' + SITE + '&prestation=' + encodeURIComponent(p.id)).then(({ d }) => {
      if (!d.jours || !d.jours.length) { info.textContent = 'Aucune disponibilité pour le moment.'; return; }
      info.textContent = 'Horaires libres (' + p.duree + ' min) :';
      jours.replaceChildren(...d.jours.slice(0, 8).map(j => {
        const b = el('button', { type: 'button', class: 'zr-jour', 'aria-pressed': 'false' },
          el('b', { text: date(j.jour, { weekday: 'short', day: 'numeric', month: 'short' }) }), el('span', { text: heure(j.debut) }));
        b.onclick = () => {
          c = j; jours.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); erreur(''); ok.hidden = true;
          recap.textContent = p.nom + ' · ' + date(j.jour, { weekday: 'long', day: 'numeric', month: 'long' }) + ', de ' + heure(j.debut) + ' à ' + heure(j.fin);
          recap.hidden = false; f.elements.nom.focus();
        };
        return b;
      }));
    }).catch(() => { info.textContent = HS; });
  }
  appel('/config?site=' + SITE).then(({ d }) => {
    if (!d.prestations) throw new Error();
    soins = d.prestations;
    commune.hidden = !d.domicile;
    soin.replaceChildren(el('option', { value: '', text: 'Choisir…' }), ...[...new Set(soins.map(x => x.groupe))].map(g => {
      const og = el('optgroup', { label: g });
      soins.filter(x => x.groupe === g).forEach(x => og.append(el('option', { value: x.id, text: x.nom + ' · ' + x.duree + ' min' })));
      return og;
    }));
    soin.disabled = false;
  }).catch(() => { soin.replaceChildren(el('option', { text: 'Indisponible' })); info.textContent = HS; });
  soin.addEventListener('change', () => { p = soins.find(x => x.id === soin.value) || null; erreur(''); charger(); });
  f.addEventListener('submit', e => {
    e.preventDefault(); ok.hidden = true;
    if (!p || !c) { erreur('Choisissez d\'abord une prestation et un horaire.'); return; }
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const x = f.elements, quoi = recap.textContent;
    go.disabled = true; erreur('');
    appel('/reserver', { method: 'POST', body: JSON.stringify({ site: SITE, prestation: p.id, jour: c.jour, debut: c.debut, nom: x.nom.value, email: x.email.value, telephone: x.telephone.value, commune: x.commune.value, sms: false, web: x.web.value }) })
      .then(({ status, d }) => {
        go.disabled = false;
        if (status === 409) { erreur('Cet horaire vient d\'être réservé. Choisissez-en un autre.'); return charger(); }
        if (!d.ok) { erreur(d.erreur || 'Une erreur est survenue. Réessayez.'); return; }
        f.reset(); charger();
        ok.textContent = 'Rendez-vous confirmé : ' + quoi + '.' + (d.email ? ' Un e-mail de confirmation vient de vous être envoyé.' : '') + ' Il est déjà dans le tableau de bord de démonstration.';
        ok.hidden = false;
        if (cadre.src) cadre.src = AGENDA;
      })
      .catch(() => { go.disabled = false; erreur('Connexion impossible. Réessayez dans un instant.'); });
  });
})();
