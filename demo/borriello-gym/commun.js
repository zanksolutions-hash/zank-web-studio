// Données partagées entre la page d'inscription et le tableau de bord (maquette : stockage dans le navigateur)
const CLE='borriello-gym-v1';
const STATUTS={ins:'Inscrit',att:'Liste d\'attente',ann:'Annulé',pre:'Présent',abs:'Absent'};
const jour=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const uid=()=>Math.random().toString(36).slice(2,9);
const telNorm=t=>String(t||'').replace(/\D/g,'');

function demo(){
  const noms=['Kevin Dupont','Sarah Lambert','Mehdi Benali','Julie Martin','Thomas Dubois','Lucas Leroy','Enzo Russo','Amandine Petit','Yanis Haddad','Maxime Laurent','Giulia Esposito','Nathan Durant','Camille Hubert','Bryan Gilles','Ilias Amrani','Sophie Bastin','Nicolas Gérard','Dylan Wauters','Marco Taverna','Lisa Coppens','Anthony Lejeune'];
  const tel=i=>'0470 '+String(12+i*3).padStart(2,'0')+' '+String(30+i).padStart(2,'0')+' '+String(40+i*2).padStart(2,'0');
  const p=(n,i,st,paye)=>({id:uid(),nom:n,tel:tel(i),statut:st,paye,ts:Date.now()-((30-i)*36e5)});
  const lieu='Borriello Gym, chaussée de Mariemont 27, Morlanwelz';
  const se=(id,j,cours,h,pl,l)=>({id,cours,date:jour(j),heure:h,lieu,places:pl,prix:0,inscrits:l});
  return {sel:'s1',seances:[
    se('s1',0,'Boxe anglaise','18:30',16,noms.slice(0,13).map((n,i)=>p(n,i,'ins',i%3!==0)).concat([p('Stéphane Masson',21,'ann',false)])),
    se('s2',1,'Boxe enfants','17:00',12,noms.slice(8,20).map((n,i)=>p(n,i+8,'ins',i<6)).concat([p('Noah Lemaire',22,'att',false),p('Léo Collard',23,'att',false)])),
    se('s3',2,'Cardio boxe','19:00',16,noms.slice(3,10).map((n,i)=>p(n,i+3,'ins',false))),
    se('s4',3,'Compétiteurs','19:30',10,noms.slice(4,8).map((n,i)=>p(n,i+4,'ins',true))),
    se('s0',-2,'Boxe anglaise','18:30',16,noms.slice(0,14).map((n,i)=>p(n,i,i===4||i===9?'abs':'pre',true)))
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
