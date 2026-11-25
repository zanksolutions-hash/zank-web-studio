// Données partagées entre la page d'inscription et le tableau de bord (maquette : stockage dans le navigateur)
const CLE='coach-glory-v1';
const STATUTS={ins:'Inscrit',att:'Liste d\'attente',ann:'Annulé',pre:'Présent',abs:'Absent'};
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const uid=()=>Math.random().toString(36).slice(2,9);
const telNorm=t=>String(t||'').replace(/\D/g,'');

// Mercredis à partir du lancement (6 janvier 2027), ou à partir d'aujourd'hui si on a dépassé cette date
function mercredi(k){
  const d=new Date(Math.max(new Date('2027-01-06T12:00'),new Date()));
  d.setHours(12,0,0,0);while(d.getDay()!==3)d.setDate(d.getDate()+1);d.setDate(d.getDate()+7*k);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function demo(){
  const noms=['Laura Dupont','Kevin Lambert','Julie Martin','Océane Leroy','Thomas Dubois','Chloé Lefèvre','Amandine Petit','Jessica Renard','Élodie Simon','Maxime Laurent','Aurélie Michel','Justine Durant','Camille Hubert','Pauline Gilles','Mélissa Collard','Sophie Bastin','Nicolas Gérard','Sarah Wauters','Céline Hennaut','Marc Delhaye','Lisa Coppens','Anthony Lejeune'];
  const tel=i=>'0470 '+String(12+i*3).padStart(2,'0')+' '+String(30+i).padStart(2,'0')+' '+String(40+i*2).padStart(2,'0');
  const p=(n,i,st,paye)=>({id:uid(),nom:n,tel:tel(i),statut:st,paye,ts:Date.now()-((30-i)*36e5)});
  const ecole='École Saint-Christophe, Fontaine-l\'Évêque';
  const se=(id,k,cours,l)=>({id,cours,date:mercredi(k),heure:'19:30',lieu:ecole,places:20,prix:9,inscrits:l});
  return {sel:'s1',seances:[
    se('s1',0,'Cross training',noms.slice(0,20).map((n,i)=>p(n,i,'ins',i%3!==0)).concat([p(noms[20],20,'att',false),p(noms[21],21,'att',false)])),
    se('s2',1,'Cross training',noms.slice(2,16).map((n,i)=>p(n,i+2,'ins',i<4)).concat([p('Stéphanie Masson',22,'ann',false)])),
    se('s3',2,'Cross training',noms.slice(5,11).map((n,i)=>p(n,i+5,'ins',false))),
    se('s4',3,'Cross training',noms.slice(0,3).map((n,i)=>p(n,i,'ins',false)))
  ]};
}
function charger(){let d;try{d=JSON.parse(localStorage.getItem(CLE)||'null')}catch(e){}return d||demo()}
function enregistrer(d){try{localStorage.setItem(CLE,JSON.stringify(d))}catch(e){}}

const actifs=s=>s.inscrits.filter(i=>i.statut==='ins'||i.statut==='pre'||i.statut==='abs');
const restant=s=>Math.max(0,s.places-actifs(s).length);
const fmtDate=d=>new Date(d+'T12:00').toLocaleDateString('fr-BE',{weekday:'long',day:'numeric',month:'long'});
const fmtHeure=h=>h.replace(':','h');
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Annule une inscription et fait monter la première de la liste d'attente. Renvoie la personne promue.
function annuler(s,i){
  const etait=i.statut;i.statut='ann';
  if(etait!=='ins')return null;
  const suiv=s.inscrits.filter(x=>x.statut==='att').sort((a,b)=>a.ts-b.ts)[0];
  if(suiv)suiv.statut='ins';
  return suiv||null;
}
