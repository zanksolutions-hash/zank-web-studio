// Données partagées entre le site (réservation) et l'agenda. Maquette : stockage dans le navigateur, clientes fictives.
const CLE='awcare-v1';
const PAS=30;
// Prix repris de la page de réservation publique de l'institut. Durées indicatives (à confirmer), servent au calcul des créneaux.
const CATS=[['visage','Soins visage'],['combo','Combinés'],['laser','Épilation définitive']];
const SOINS=[
  {id:'diag',cat:'visage',nom:'Diagnostic de peau',prix:30,duree:30},
  {id:'peel',cat:'visage',nom:'Peeling',prix:65,duree:45},
  {id:'hydra',cat:'visage',nom:'Hydrapeel',prix:70,duree:60},
  {id:'micro',cat:'visage',nom:'Microneedling',prix:95,duree:60},
  {id:'duo',cat:'visage',nom:'Active Duo (femmes)',prix:70,duree:60},
  {id:'c1',cat:'combo',nom:'Hydrapeel + peeling + lampe Bioled',prix:120,duree:90},
  {id:'c2',cat:'combo',nom:'Peeling + microneedling + lampe Bioled',prix:150,duree:90},
  {id:'c3',cat:'combo',nom:'Hydrapeel + microneedling + lampe Bioled',prix:150,duree:90},
  {id:'c4',cat:'combo',nom:'Hydrapeel + peeling + microneedling + lampe Bioled',prix:195,duree:120},
  {id:'lv',cat:'laser',nom:'Laser visage',prix:35,apartir:true,duree:30},
  {id:'lb',cat:'laser',nom:'Laser bras',prix:35,apartir:true,duree:30},
  {id:'lj',cat:'laser',nom:'Laser jambes',prix:35,apartir:true,duree:60},
  {id:'lm',cat:'laser',nom:'Laser maillot',prix:60,apartir:true,duree:30},
  {id:'lc',cat:'laser',nom:'Laser corps (autre zone)',prix:35,apartir:true,duree:30}
];
// Horaires repris de la page de réservation : mercredi à vendredi, 14 h – 18 h. 0 = dimanche.
const HORAIRES={3:[['14:00','18:00']],4:[['14:00','18:00']],5:[['14:00','18:00']]};
const STATUTS={ok:'Confirmé',fin:'Venue',abs:'Absente',ann:'Annulé'};

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
const prixTxt=s=>(s.apartir?'dès ':'')+s.prix+' €';
const uid=()=>Math.random().toString(36).slice(2,9);
const actif=r=>r.statut!=='ann';

// Jours ouvrés à partir d'aujourd'hui (n>0) ou en arrière (n<0)
function ouvre(n){let d=new Date(),k=0,s=n<0?-1:1;while(true){if(HORAIRES[d.getDay()]){if(k===Math.abs(n))return iso(d);k++}d.setDate(d.getDate()+s)}}

function demo(){
  const C=[['Julie Lemaire','0475 21 33 48'],['Sarah Dethier','0478 55 12 09'],['Laura Mathieu','0496 40 71 22'],['Céline Wauthier','0473 18 92 64'],
    ['Amélie Hubert','0471 66 03 57'],['Manon Lecocq','0479 30 44 81'],['Émilie Bodart','0497 12 58 36'],['Aurore Francotte','0474 81 27 90'],
    ['Pauline Gérard','0498 73 15 42'],['Mélanie Collignon','0472 09 66 13'],['Kevin Delvaux','0470 44 21 87']];
  const P=[[0,'14:00','lj',0],[0,'15:00','c2',1],[0,'16:30','lm',2],[0,'17:00','diag',3],[1,'14:00','hydra',4],[1,'15:00','lv',5],[1,'15:30','lb',10],
    [1,'16:30','micro',6],[2,'14:00','lm',7],[2,'14:30','c4',8],[3,'15:00','peel',9],[4,'14:00','lj',0],
    [-1,'14:00','lm',1],[-1,'15:00','micro',2],[-1,'16:00','lv',3],[-2,'14:00','lj',5],[-2,'15:00','duo',6],[-3,'16:00','lb',10]];
  const rdv=P.map(([j,h,s,c])=>({id:uid(),date:j>=0?ouvre(j):ouvre(j),heure:h,soin:s,duree:soin(s).duree,nom:C[c][0],tel:C[c][1],note:'',statut:j<0?(c===6&&j===-2?'abs':'fin'):'ok',cree:Date.now()}));
  // historique laser pour le suivi des séances
  const hist=[[0,'lj',[-84,-140,-196]],[1,'lm',[-70,-126]],[2,'lm',[-62,-118,-174,-230]],[5,'lv',[-90]],[7,'lm',[-50,-106,-162]],[10,'lb',[-75,-131]]];
  hist.forEach(([c,s,js])=>js.forEach(j=>rdv.push({id:uid(),date:jour(j),heure:'14:00',soin:s,duree:soin(s).duree,nom:C[c][0],tel:C[c][1],note:'',statut:'fin',cree:0})));
  rdv.push({id:uid(),date:jour(-80),heure:'15:00',soin:'lj',duree:60,nom:'Charlotte Renard',tel:'0476 52 11 30',note:'',statut:'fin',cree:0});
  rdv.push({id:uid(),date:jour(-136),heure:'15:00',soin:'lj',duree:60,nom:'Charlotte Renard',tel:'0476 52 11 30',note:'',statut:'fin',cree:0});
  return{rdv};
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}

// Une seule cabine : un créneau est libre s'il ne chevauche aucun rendez-vous.
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
