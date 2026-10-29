/*
 * Suivi des visites des maquettes (sans cookie, sans adresse IP).
 * Envoie la maquette consultée, la page, la durée de lecture et le type
 * d'appareil au script Google de Zank Solutions.
 *
 * Pour ne pas compter vos propres visites : ouvrez une fois n'importe quelle
 * maquette avec ?moi à la fin de l'adresse, dans chaque navigateur que vous
 * utilisez (ex. https://webstudio.zanksolutions.be/demo/alintech/?moi).
 * ?moi=0 réactive le comptage dans ce navigateur.
 */
(function () {
  var URL_SUIVI = 'A_REMPLACER_PAR_L_URL_DU_SCRIPT_GOOGLE';
  if (URL_SUIVI.indexOf('https://') !== 0) return;

  try {
    var q = location.search;
    if (/[?&]moi=0\b/.test(q)) localStorage.removeItem('zk_moi');
    else if (/[?&]moi\b/.test(q)) localStorage.setItem('zk_moi', '1');
    if (localStorage.getItem('zk_moi')) return;
  } catch (e) {}

  var ua = navigator.userAgent || '';
  if (navigator.webdriver || /bot|crawl|spider|slurp|preview|lighthouse|headless|facebookexternalhit|whatsapp/i.test(ua)) return;
  if (!navigator.sendBeacon) return;

  var m = location.pathname.match(/\/demo\/([^\/]+)/);
  if (!m) return;

  var maquette = m[1];
  var vue = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  var mobile = /Mobi|Android|iPhone|iPad/i.test(ua) ? 1 : 0;
  var cumul = 0;
  var depuis = document.visibilityState === 'visible' ? Date.now() : 0;

  function envoyer(type) {
    var ms = cumul + (depuis ? Date.now() - depuis : 0);
    try {
      navigator.sendBeacon(URL_SUIVI, JSON.stringify({
        s: maquette, p: location.pathname, t: type, d: Math.round(ms / 1000), v: vue, m: mobile
      }));
    } catch (e) {}
  }

  envoyer('v');
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      if (depuis) { cumul += Date.now() - depuis; depuis = 0; }
      envoyer('f');
    } else {
      depuis = Date.now();
    }
  });
})();
