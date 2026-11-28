// Données partagées entre le site (réservation) et l'agenda. Maquette : stockage dans le navigateur, clients fictifs.
const CLE='hair-elle-lui-v1';
const PAS=30;
// Prestations de l'affiche, sans prix. Durées indicatives, à confirmer avec le salon.
const CATS=[['femme','Femme et enfant'],['homme','Homme · Barber'],['visa','Visagiste · Couleur'],['spa','Hair Spa'],['make','Maquillage'],['pedi','Pédicure']];
const SOINS=[
  {id:'cf',cat:'femme',nom:'Coupe femme',duree:45},
  {id:'br',cat:'femme',nom:'Brushing',duree:45},
  {id:'cb',cat:'femme',nom:'Coupe + brushing',duree:60},
  {id:'co',cat:'femme',nom:'Coloration',duree:90},
  {id:'ba',cat:'femme',nom:'Balayage',duree:150},
  {id:'ev',cat:'femme',nom:'Coiffure événementielle',duree:60},
  {id:'ce',cat:'femme',nom:'Coupe enfant',duree:30},
  {id:'ch',cat:'homme',nom:'Coupe homme',duree:30},
  {id:'dg',cat:'homme',nom:'Dégradé',duree:30},
  {id:'ct',cat:'homme',nom:'Coupe tendance',duree:45},
  {id:'tb',cat:'homme',nom:'Taille de barbe',duree:20},
  {id:'hb',cat:'homme',nom:'Coupe + barbe',duree:45},
  {id:'hl',cat:'visa',nom:'High light',duree:150},
  {id:'td',cat:'visa',nom:'Tie and dye',duree:150},
  {id:'om',cat:'visa',nom:'Ombré',duree:150},
  {id:'sc',cat:'visa',nom:'Soin capillaire',duree:30},
  {id:'cv',cat:'visa',nom:'Conseil visagiste',duree:30},
  {id:'hs',cat:'spa',nom:'Hair Spa signature',duree:60},
  {id:'mq',cat:'make',nom:'Maquillage',duree:45},
  {id:'gr',cat:'make',nom:'Grimage',duree:20},
  {id:'pd',cat:'pedi',nom:'Pédicure, soin complet',duree:60}
];
// Horaires de l'affiche du salon. 0 = dimanche.
const HORAIRES={2:[['10:00','17:00']],3:[['09:30','17:30']],4:[['09:00','19:00']],5:[['09:00','20:00']],6:[['08:30','15:00']]};
const STATUTS={ok:'Confirmé',fin:'Venu·e',abs:'Absent·e',ann:'Annulé'};

const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const plus=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return iso(x)};
const min=h=>{const[a,b]=h.split(':');return +a*60+ +b};
const hh=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const fmtH=h=>h.replace(':','h');
const fmtDate=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'});
const fmtCourt=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'short',day:'numeric',month:'short'});
const telNorm=t=>String(t||'').replace(/\D/g,'');
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const soin=id=>SOINS.find(s=>s.id===id)||SOINS[0];
const prixTxt=s=>s.duree>=60?Math.floor(s.duree/60)+' h'+(s.duree%60?String(s.duree%60).padStart(2,'0'):''):s.duree+' min';
const uid=()=>Math.random().toString(36).slice(2,9);
const actif=r=>r.statut!=='ann';

function ouvre(n){let d=new Date(),k=0,s=n<0?-1:1;while(true){if(HORAIRES[d.getDay()]){if(k===Math.abs(n))return iso(d);k++}d.setDate(d.getDate()+s)}}

function demo(){
  const C=[['Julien Lemaire','0475 21 33 48'],['Sarah Dethier','0478 55 12 09'],['Kevin Mathieu','0496 40 71 22'],['Céline Wauthier','0473 18 92 64'],
    ['Maxime Hubert','0471 66 03 57'],['Manon Lecocq','0479 30 44 81'],['Yanis Bodart','0497 12 58 36'],['Aurore Francotte','0474 81 27 90'],
    ['Thomas Gérard','0498 73 15 42'],['Mélanie Collignon','0472 09 66 13'],['Dylan Delvaux','0470 44 21 87']];
  const P=[[0,'10:00','cb',0],[0,'11:00','hb',2],[0,'13:30','co',1],[0,'15:30','dg',4],[1,'09:00','ba',3],[1,'11:30','ch',6],[1,'14:00','hs',5],[1,'16:00','ce',7],
    [2,'09:00','pd',9],[2,'10:30','tb',10],[2,'13:00','om',8],[3,'08:30','ev',1],[3,'10:00','cf',5],[4,'09:30','mq',3],
    [-1,'10:00','cf',1],[-1,'14:00','dg',2],[-2,'09:00','co',3],[-2,'13:00','hb',10],[-3,'15:00','br',6]];
  const rdv=P.map(([j,h,s,c])=>({id:uid(),date:ouvre(j),heure:h,soin:s,duree:soin(s).duree,nom:C[c][0],tel:C[c][1],note:j===0&&c===1?'Envie d\'un ton plus chaud':'',statut:j<0?(c===10?'abs':'fin'):'ok',cree:Date.now()}));
  const hist=[[0,[-9,-16,-23,-30,-37]],[3,[-12,-19,-26]],[5,[-30,-44,-58]],[8,[-28,-35]],[9,[-40]]];
  hist.forEach(([c,js])=>js.forEach(j=>rdv.push({id:uid(),date:jour(j),heure:'18:00',soin:'cb',duree:60,nom:C[c][0],tel:C[c][1],note:'',statut:'fin',cree:0})));
  [[-52,'Laura Pirotte','0476 52 11 30','co'],[-60,'Laura Pirotte','0476 52 11 30','cb'],[-48,'Nathan Leclercq','0468 21 40 77','hb']].forEach(([j,n,tl,s])=>rdv.push({id:uid(),date:jour(j),heure:'10:00',soin:s,duree:soin(s).duree,nom:n,tel:tl,note:'',statut:'fin',cree:0}));
  return{rdv};
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}

// Un seul fauteuil : un créneau est libre s'il ne chevauche aucun rendez-vous.
function creneaux(D,date,duree){
  const h=HORAIRES[new Date(date+'T12:00').getDay()];if(!h)return[];
  const pris=D.rdv.filter(r=>r.date===date&&actif(r));
  const maint=date===jour(0)?new Date().getHours()*60+new Date().getMinutes()+60:0;
  const out=[];
  for(const[a,b]of h)for(let m=min(a);m+duree<=min(b);m+=PAS){
    if(m<maint)continue;
    if(!pris.some(r=>min(r.heure)<m+duree&&min(r.heure)+r.duree>m))out.push(hh(m));
  }
  return out;
}
