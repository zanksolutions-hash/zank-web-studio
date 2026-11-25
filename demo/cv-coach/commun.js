// Données partagées entre la page d'inscription et le tableau de bord (maquette : stockage dans le navigateur)
const CLE='cv-coach-v1';
const STATUTS={ins:'Inscrit',att:'Liste d\'attente',ann:'Annulé',pre:'Présent',abs:'Absent'};
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const uid=()=>Math.random().toString(36).slice(2,9);
const telNorm=t=>String(t||'').replace(/\D/g,'');

function demo(){
  const noms=['Laura Dupont','Kevin Lambert','Julie Martin','Océane Leroy','Thomas Dubois','Chloé Lefèvre','Amandine Petit','Jessica Renard','Élodie Simon','Maxime Laurent','Aurélie Michel','Justine Durant','Camille Hubert','Pauline Gilles','Mélissa Collard','Sophie Bastin','Nicolas Gérard'];
  const tel=i=>'0470 '+String(12+i*3).padStart(2,'0')+' '+String(30+i).padStart(2,'0')+' '+String(40+i*2).padStart(2,'0');
  const p=(n,i,st,paye)=>({id:uid(),nom:n,tel:tel(i),statut:st,paye,ts:Date.now()-((30-i)*36e5)});
  const se=(id,j,cours,h,pl,l)=>({id,cours,date:jour(j),heure:h,lieu:'Celles (Hainaut)',places:pl,prix:0,inscrits:l});
  return {sel:'s1',seances:[
    se('s1',0,'Circuit training','19:00',14,noms.slice(0,11).map((n,i)=>p(n,i,'ins',i%3!==0)).concat([p('Stéphanie Masson',17,'ann',false)])),
    se('s2',2,'Fitness en piscine','18:30',10,noms.slice(4,14).map((n,i)=>p(n,i+4,'ins',i<5)).concat([p('Nathalie Bastin',18,'att',false),p('Virginie Lemaire',19,'att',false)])),
    se('s3',4,'Renforcement musculaire','10:00',12,noms.slice(2,8).map((n,i)=>p(n,i+2,'ins',false))),
    se('s4',7,'Circuit training','19:00',14,noms.slice(0,3).map((n,i)=>p(n,i,'ins',false))),
    se('s0',-3,'Fitness en piscine','18:30',10,noms.slice(0,10).map((n,i)=>p(n,i,i===4?'abs':'pre',true)))
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
