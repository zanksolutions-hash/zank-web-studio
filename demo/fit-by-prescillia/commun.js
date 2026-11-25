// Données partagées entre le site (réservation) et l'agenda. Maquette : stockage dans le navigateur, clients fictifs.
const CLE='fit-by-prescillia-v1';
const PAS=30;
// Formules sans prix (tarifs donnés à la séance découverte). Durées et disponibilités indicatives, à confirmer.
const CATS=[['coach','En salle'],['suivi','En ligne']];
const SOINS=[
  {id:'decouv',cat:'coach',nom:'Séance découverte (bilan)',duree:60},
  {id:'indiv',cat:'coach',nom:'Coaching en salle',duree:60},
  {id:'duo',cat:'coach',nom:'Coaching duo en salle',duree:60},
  {id:'dom',cat:'suivi',nom:'Bilan coaching en ligne (visio)',duree:30},
  {id:'bilan',cat:'suivi',nom:'Bilan postural pilates (visio)',duree:45},
  {id:'nutri',cat:'suivi',nom:'Point de suivi en ligne',duree:30}
];
const HORAIRES={1:[['07:00','10:00'],['16:00','21:00']],2:[['07:00','10:00'],['16:00','21:00']],3:[['07:00','10:00'],['16:00','21:00']],4:[['07:00','10:00'],['16:00','21:00']],5:[['07:00','10:00'],['16:00','21:00']],6:[['08:00','13:00']]};
const STATUTS={ok:'Confirmé',fin:'Venu',abs:'Absent',ann:'Annulé'};

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
const prixTxt=s=>s.duree+' min';
const uid=()=>Math.random().toString(36).slice(2,9);
const actif=r=>r.statut!=='ann';

function ouvre(n){let d=new Date(),k=0,s=n<0?-1:1;while(true){if(HORAIRES[d.getDay()]){if(k===Math.abs(n))return iso(d);k++}d.setDate(d.getDate()+s)}}

function demo(){
  const C=[['Julien Lemaire','0475 21 33 48'],['Sarah Dethier','0478 55 12 09'],['Kevin Mathieu','0496 40 71 22'],['Céline Wauthier','0473 18 92 64'],
    ['Maxime Hubert','0471 66 03 57'],['Manon Lecocq','0479 30 44 81'],['Yanis Bodart','0497 12 58 36'],['Aurore Francotte','0474 81 27 90'],
    ['Thomas Gérard','0498 73 15 42'],['Mélanie Collignon','0472 09 66 13'],['Dylan Delvaux','0470 44 21 87']];
  const P=[[0,'07:00','indiv',0],[0,'17:00','decouv',1],[0,'18:00','duo',2],[0,'19:30','indiv',3],[1,'07:30','indiv',4],[1,'17:30','dom',5],[1,'19:00','indiv',6],
    [2,'18:00','bilan',0],[2,'19:00','indiv',7],[3,'08:00','indiv',8],[3,'18:30','nutri',9],[4,'09:00','duo',2],
    [-1,'18:00','indiv',1],[-1,'19:00','indiv',3],[-2,'07:00','indiv',0],[-2,'18:00','decouv',10],[-3,'19:00','indiv',6]];
  const rdv=P.map(([j,h,s,c])=>({id:uid(),date:ouvre(j),heure:h,soin:s,duree:soin(s).duree,nom:C[c][0],tel:C[c][1],note:j===0&&c===1?'Objectif : perdre 8 kg avant l\'été':'',statut:j<0?(c===10?'abs':'fin'):'ok',cree:Date.now()}));
  const hist=[[0,[-9,-16,-23,-30,-37]],[3,[-12,-19,-26]],[5,[-30,-44,-58]],[8,[-28,-35]],[9,[-40]]];
  hist.forEach(([c,js])=>js.forEach(j=>rdv.push({id:uid(),date:jour(j),heure:'18:00',soin:'indiv',duree:60,nom:C[c][0],tel:C[c][1],note:'',statut:'fin',cree:0})));
  [[-26,'Laura Pirotte','0476 52 11 30'],[-33,'Laura Pirotte','0476 52 11 30'],[-24,'Nathan Leclercq','0468 21 40 77']].forEach(([j,n,tl])=>rdv.push({id:uid(),date:jour(j),heure:'19:00',soin:'indiv',duree:60,nom:n,tel:tl,note:'',statut:'fin',cree:0}));
  return{rdv};
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}

// Un seul coach : un créneau est libre s'il ne chevauche aucune séance.
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
