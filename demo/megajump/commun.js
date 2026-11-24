// Données partagées entre la page d'inscription et le tableau de bord (maquette : stockage dans le navigateur)
const CLE='megajump-v1';
const STATUTS={ins:'Inscrite',att:'Liste d\'attente',ann:'Annulée',pre:'Présente',abs:'Absente'};
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const uid=()=>Math.random().toString(36).slice(2,9);
const telNorm=t=>String(t||'').replace(/\D/g,'');

function demo(){
  const noms=['Laura Dupont','Sarah Lambert','Julie Martin','Océane Leroy','Manon Dubois','Chloé Lefèvre','Amandine Petit','Jessica Renard','Élodie Simon','Marine Laurent','Aurélie Michel','Justine Durant','Camille Hubert','Pauline Gilles','Mélissa Collard'];
  const tel=i=>'0470 '+String(12+i*3).padStart(2,'0')+' '+String(30+i).padStart(2,'0')+' '+String(40+i*2).padStart(2,'0');
  const p=(n,i,st,paye)=>({id:uid(),nom:n,tel:tel(i),statut:st,paye,ts:Date.now()-((20-i)*36e5)});
  const ecole='École Saint François, Fontaine-l\'Évêque';
  return {sel:'s1',seances:[
    {id:'s1',cours:'Aérostep',date:jour(0),heure:'18:00',lieu:ecole,places:16,prix:8,
      inscrits:noms.slice(0,13).map((n,i)=>p(n,i,'ins',i%3!==0)).concat([p('Stéphanie Masson',13,'ann',false)])},
    {id:'s2',cours:'Jumping',date:jour(3),heure:'19:00',lieu:ecole,places:12,prix:10,
      inscrits:noms.slice(3,15).map((n,i)=>p(n,i,'ins',i<5)).concat([p('Nathalie Bastin',14,'att',false),p('Virginie Lemaire',15,'att',false)])},
    {id:'s3',cours:'Aérostep',date:jour(7),heure:'18:00',lieu:'Salle communale, Forchies-la-Marche',places:16,prix:8,
      inscrits:noms.slice(6,10).map((n,i)=>p(n,i,'ins',false))},
    {id:'s0',cours:'Aérostep',date:jour(-7),heure:'18:00',lieu:ecole,places:16,prix:8,
      inscrits:noms.slice(0,14).map((n,i)=>p(n,i,i===4||i===9?'abs':'pre',true))}
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
