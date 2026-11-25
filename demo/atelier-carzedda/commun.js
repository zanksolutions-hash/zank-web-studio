// Données partagées entre le site (prise de rendez-vous) et le tableau de bord. Maquette : stockage dans le navigateur.
const CLE='carzedda-v1';
const PONTS=2; // véhicules pris en charge en même temps
const PAS=30;  // minutes
const SERVICES=[
  {id:'entretien',nom:'Entretien et vidange',duree:60},
  {id:'pneus',nom:'Pneus (montage, équilibrage, saisonnier)',duree:30},
  {id:'freins',nom:'Freins (plaquettes, disques)',duree:90},
  {id:'diag',nom:'Diagnostic électronique',duree:60},
  {id:'ct',nom:'Préparation au contrôle technique',duree:60},
  {id:'clim',nom:'Climatisation',duree:60},
  {id:'distrib',nom:'Distribution, embrayage (sur devis)',duree:240},
  {id:'autre',nom:'Autre / je ne sais pas',duree:30}
];
// Horaires indicatifs, à confirmer avec le garage. 0 = dimanche.
const HORAIRES={1:[['08:00','12:00'],['13:00','17:30']],2:[['08:00','12:00'],['13:00','17:30']],3:[['08:00','12:00'],['13:00','17:30']],
  4:[['08:00','12:00'],['13:00','17:30']],5:[['08:00','12:00'],['13:00','17:00']],6:[['08:00','12:00']]};
const STATUTS={dem:'À confirmer',ok:'Confirmé',arr:'Au garage',fin:'Terminé',ann:'Annulé'};

const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const min=h=>{const[a,b]=h.split(':');return +a*60+ +b};
const hh=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const fmtH=h=>h.replace(':','h');
const fmtDate=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'});
const fmtCourt=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'short',day:'numeric',month:'short'});
const telNorm=t=>String(t||'').replace(/\D/g,'');
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const svc=id=>SERVICES.find(s=>s.id===id)||SERVICES[SERVICES.length-1];
const ref=()=>Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*31)]).join('');

function demo(){
  const c=[['Marc Dubois','0475 21 33 48','Peugeot 208','1-ABC-123'],['Sophie Leclercq','0478 55 12 09','Renault Clio','1-DEF-456'],
    ['Kevin Hennaux','0496 40 71 22','VW Golf 7','2-GHI-789'],['Nathalie Roland','0473 18 92 64','Opel Corsa','1-JKL-012'],
    ['Julien Masson','0471 66 03 57','BMW Série 1','2-MNO-345'],['Isabelle Fontaine','0479 30 44 81','Citroën C3','1-PQR-678'],
    ['David Lambot','0497 12 58 36','Ford Focus','2-STU-901'],['Patricia Duchêne','0474 81 27 90','Toyota Yaris','1-VWX-234'],
    ['Thomas Colin','0498 73 15 42','Skoda Octavia','2-YZA-567'],['Laurence Gobert','0472 09 66 13','Dacia Sandero','1-BCD-890']];
  const plan=[[0,'08:00','entretien','arr'],[0,'09:00','freins','ok'],[0,'10:30','pneus','ok'],[0,'13:00','diag','dem'],[0,'14:30','clim','ok'],
    [1,'08:00','distrib','ok'],[1,'08:30','ct','ok'],[1,'13:30','pneus','dem'],[2,'09:00','entretien','ok'],[2,'15:00','freins','dem'],
    [3,'10:00','diag','ok'],[-1,'08:00','entretien','fin'],[-1,'10:00','pneus','fin'],[-1,'13:00','freins','fin']];
  const rdv=plan.map(([d,h,s,st],i)=>{let dt=new Date();dt.setDate(dt.getDate()+d);while(!HORAIRES[dt.getDay()])dt.setDate(dt.getDate()+(d<0?-1:1));
    const p=c[i%c.length];return{id:ref(),date:iso(dt),heure:h,service:s,duree:svc(s).duree,nom:p[0],tel:p[1],voiture:p[2],plaque:p[3],note:'',statut:st,cree:Date.now()-i*36e5}});
  return{rdv};
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}
const actif=r=>r.statut!=='ann';

// Créneaux libres pour un jour et une durée, en tenant compte des ponts occupés.
function creneaux(D,date,duree){
  const h=HORAIRES[new Date(date+'T12:00').getDay()];if(!h)return[];
  const pris=D.rdv.filter(r=>r.date===date&&actif(r));
  const maint=date===jour(0)?new Date().getHours()*60+new Date().getMinutes()+60:0;
  const out=[];
  for(const[a,b]of h){for(let m=min(a);m+Math.min(duree,min(b)-min(a))<=min(b);m+=PAS){
    if(m<maint)continue;
    const fin=m+Math.min(duree,120); // les longs travaux occupent le pont, la voiture reste ensuite
    const occ=pris.filter(r=>min(r.heure)<fin&&min(r.heure)+Math.min(r.duree,120)>m).length;
    if(occ<PONTS)out.push(hh(m));
  }}
  return out;
}
