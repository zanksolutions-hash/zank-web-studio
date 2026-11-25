// Données partagées entre le site (demande de soins) et le tableau de bord.
// Maquette : stockage dans le navigateur, patients fictifs uniquement.
const CLE='kendall-v1';
const SOINS=[
  {id:'hyg',nom:'Soins d\'hygiène',desc:'Toilette complète ou partielle, aide à l\'habillage, soins de confort.'},
  {id:'pans',nom:'Pansements',desc:'Plaies, ulcères, suites opératoires, retrait de fils et d\'agrafes.'},
  {id:'inj',nom:'Injections',desc:'Injections sous-cutanées et intramusculaires, sur prescription.'},
  {id:'autre',nom:'Autre soin',desc:'Expliquez votre besoin, je vous rappelle pour en parler.'}
];
const FREQ={une:'Une seule fois',jours:'Quelques jours',quot:'Tous les jours'};
const MOMENTS={mat:'Matin',midi:'Midi',soir:'Soir'};
const COMMUNES=['Anderlues','Binche','Fontaine-l\'Évêque','Morlanwelz','Thuin','Lobbes','Leernes','Courcelles'];

const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const plus=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return iso(x)};
const fmtDate=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'});
const fmtCourt=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'short',day:'numeric',month:'short'});
const telNorm=t=>String(t||'').replace(/\D/g,'');
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const soin=id=>SOINS.find(s=>s.id===id)||SOINS[3];
const uid=()=>Math.random().toString(36).slice(2,9);

function demo(){
  const P=[['Madeleine Dupuis','0471 22 31 40','Rue de la Station 12','Anderlues','hyg','quot',-20,0,'mat'],
    ['Georges Lefèvre','0475 18 44 09','Chaussée de Charleroi 88','Anderlues','pans','jours',-3,10,'mat'],
    ['Simone Verhaegen','0496 30 72 15','Rue Albert Ier 5','Fontaine-l\'Évêque','inj','quot',-12,0,'soir'],
    ['René Ghislain','0478 61 20 33','Place communale 3','Anderlues','hyg','quot',-40,0,'mat'],
    ['Paulette Moreau','0473 09 54 87','Rue des Écoles 41','Binche','pans','jours',-1,7,'midi'],
    ['Jacques Delhaye','0497 44 18 26','Rue de Thuin 17','Lobbes','inj','jours',0,5,'soir'],
    ['Marie-Thérèse Collin','0479 33 61 70','Rue Paul Pastur 60','Anderlues','hyg','quot',-8,0,'soir']];
  const demandes=P.map(([nom,tel,adr,com,s,f,deb,n,mo],i)=>({id:uid(),soin:s,freq:f,nbJours:n||null,debut:jour(deb),moment:mo,nom,tel,adresse:adr,commune:com,
    prescription:'oui',note:'',statut:'ok',cree:Date.now()-(20-i)*864e5}));
  demandes.push({id:uid(),soin:'pans',freq:'jours',nbJours:14,debut:jour(1),moment:'mat',nom:'Christian Bauduin',tel:'0472 85 13 64',adresse:'Rue du Moulin 9',commune:'Anderlues',prescription:'oui',note:'Sortie d\'hôpital vendredi, pansement au genou.',statut:'new',cree:Date.now()-3*36e5});
  demandes.push({id:uid(),soin:'inj',freq:'une',nbJours:null,debut:jour(2),moment:'mat',nom:'Nadine Lambert',tel:'0476 40 92 18',adresse:'Rue Grande 102',commune:'Binche',prescription:'nsp',note:'',statut:'new',cree:Date.now()-26*36e5});
  const faits={};demandes.forEach(d=>{if(d.statut==='ok'&&d.moment==='mat'&&passe(d,jour(0)))faits[d.id+'|'+jour(0)]=true});
  return {demandes,faits};
}
// Ce patient doit-il être vu ce jour-là ?
function passe(d,date){
  if(d.statut!=='ok'||date<d.debut)return false;
  if(d.fin&&date>d.fin)return false;
  if(d.freq==='une')return date===d.debut;
  if(d.freq==='jours')return date<plus(d.debut,d.nbJours||7);
  return true;
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}
