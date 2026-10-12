'use strict';
document.documentElement.classList.add('js');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window&&!reduceMotion){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}
const menu=document.getElementById('navigation');
const menuButton=document.querySelector('.menu-toggle');
function openDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open');}
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(dialog===menu)menuButton.setAttribute('aria-expanded','false');});dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});});
menuButton.addEventListener('click',()=>{openDialog(menu);menuButton.setAttribute('aria-expanded','true');});
menu.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>menu.close()));
const concepts={garden:{title:'Jardin singulier',description:'Une exploration de site vitrine pour une activité fictive d’architecture paysagère. La direction associe des verts sourds, une typographie éditoriale et des formes inspirées du jardin.',items:['Présenter une démarche et des types d’aménagement.','Donner une place importante aux projets et aux images.','Faciliter une demande de premier échange.']},objects:{title:'Matière douce',description:'Une exploration de boutique fictive dédiée aux objets pour la maison. Des tons terre cuite et des compositions calmes placent la collection au premier plan.',items:['Organiser une collection par usage ou par matière.','Prévoir des fiches produit lisibles et détaillées.','Construire un parcours de commande clair.']},bakery:{title:'Maison Levain',description:'Une exploration pour une boulangerie fictive. Une identité chaleureuse et une typographie généreuse donnent une présence au commerce de quartier.',items:['Présenter le savoir-faire et les produits.','Rendre les horaires et l’adresse faciles à trouver.','Favoriser la découverte du commerce et la prise de contact.']}};
const projectDialog=document.getElementById('project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{const data=concepts[button.dataset.project];document.getElementById('project-title').textContent=data.title;document.getElementById('project-description').textContent=data.description;const details=document.getElementById('project-detail');details.replaceChildren();const heading=document.createElement('h3');heading.textContent='Intentions de conception';const list=document.createElement('ul');data.items.forEach(item=>{const li=document.createElement('li');li.textContent=item;list.append(li);});const note=document.createElement('p');note.textContent='Ce concept ne représente pas une commande client ni une boutique opérationnelle.';details.append(heading,list,note);openDialog(projectDialog);}));
document.getElementById('project-contact').addEventListener('click',()=>projectDialog.close());
const info={privacy:{title:'Confidentialité de cet aperçu',copy:'Cet aperçu ne contient pas d’outil de mesure d’audience, de publicité ou de stockage des réponses du formulaire. Les champs servent uniquement à préparer un e-mail dans votre navigateur. Rien n’est envoyé avant votre action dans votre messagerie. Les polices sont chargées depuis Google Fonts ; leur chargement établit une connexion avec ce fournisseur. Les informations de confidentialité définitives devront être adaptées au site et à son hébergement avant publication.'},legal:{title:'Avant la publication',copy:'Trame Web est un nom de travail pour cette proposition de site, présentée comme une activité de ZANK Solutions. Le nom définitif, le logo, l’identité juridique de l’éditeur, son adresse, son numéro d’entreprise et les informations d’hébergement restent à confirmer. Cet aperçu local n’est pas une version publiée du site.'}};
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>{const data=info[button.dataset.info];document.getElementById('info-title').textContent=data.title;document.getElementById('info-copy').textContent=data.copy;openDialog(document.getElementById('info-dialog'));}));
const form=document.getElementById('project-form');let draft='';
form.addEventListener('submit',event=>{event.preventDefault();const values=Object.fromEntries(new FormData(form));draft=`Bonjour,\n\nJe souhaite vous parler d’un projet de ${values.need.toLowerCase()}.\n\nNom : ${values.name}\nE-mail : ${values.email}\nBesoin : ${values.need}\n\n${values.message}\n\nBudget envisagé : ${values.budget||'À définir'}\nÉchéance souhaitée : ${values.deadline||'À définir'}\n\nBien à vous,\n${values.name}`;document.getElementById('draft-link').href=`mailto:info@zanksolutions.be?subject=${encodeURIComponent('Demande de projet — '+values.need)}&body=${encodeURIComponent(draft)}`;document.getElementById('form-result').hidden=false;document.getElementById('copy-status').textContent='';document.getElementById('form-result').scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'nearest'});});
form.addEventListener('input',()=>{document.getElementById('form-result').hidden=true;draft='';});
document.getElementById('copy-draft').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(draft);status.textContent='Demande copiée. Vous pouvez la coller dans un e-mail à info@zanksolutions.be.';}catch{status.textContent='La copie automatique est indisponible. Utilisez le lien « Ouvrir ma messagerie ».';}});

// A native vertical scroll drives the horizontal portfolio on wide screens.
// Touch screens and reduced-motion preferences keep a conventional document.
const portfolio=document.getElementById('projets');
const projectCards=[...portfolio.querySelectorAll('article.project')];
const runway=document.createElement('div');runway.className='project-runway';
const stage=document.createElement('div');stage.className='project-stage';
const track=document.createElement('div');track.className='project-track';
projectCards.forEach(card=>track.append(card));
portfolio.querySelector('.project-pair').remove();
const progress=document.createElement('div');progress.className='project-progress';progress.setAttribute('aria-hidden','true');
const progressFill=document.createElement('span');progress.append(progressFill);
const hint=document.createElement('p');hint.className='horizontal-hint';hint.textContent='Continuez à défiler pour explorer →';
stage.append(track,hint,progress);runway.append(stage);portfolio.append(runway);
const wideMotion=window.matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)');
let distance=0;let scheduled=false;
function measurePortfolio(){
  portfolio.classList.toggle('horizontal-active',wideMotion.matches);
  if(wideMotion.matches){distance=Math.max(0,track.scrollWidth-stage.clientWidth);runway.style.height=(window.innerHeight+distance)+'px';}
  else{distance=0;runway.style.height='';track.style.transform='';}
  updateScene();
}
function updateScene(){
  scheduled=false;
  if(wideMotion.matches){const offset=Math.min(distance,Math.max(0,-runway.getBoundingClientRect().top));track.style.transform=`translate3d(${-offset}px,0,0)`;progressFill.style.transform=`scaleX(${distance?offset/distance:1})`;}
  if(!reduceMotion){const hero=document.querySelector('.hero');const offset=Math.min(hero.offsetHeight,Math.max(0,window.scrollY));hero.style.setProperty('--hero-drift',`${offset*.15}px`);}
}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScene);}},{passive:true});
window.addEventListener('resize',measurePortfolio);wideMotion.addEventListener('change',measurePortfolio);
track.addEventListener('focusin',event=>{if(!wideMotion.matches)return;const card=event.target.closest('.project');if(!card)return;const top=window.scrollY+runway.getBoundingClientRect().top;window.scrollTo({top:top+Math.min(distance,card.offsetLeft),behavior:'instant'});});
measurePortfolio();document.fonts.ready.then(measurePortfolio);

// Decorative horizontal ribbon: duplicated for a seamless loop.
const heroRibbon=document.createElement('div');heroRibbon.className='hero-horizontal';heroRibbon.setAttribute('aria-hidden','true');
const heroRibbonTrack=document.createElement('div');heroRibbonTrack.className='hero-horizontal-track';
for(let i=0;i<2;i++){const group=document.createElement('span');group.textContent='DESIGN · WEB · EXPÉRIENCE · ';heroRibbonTrack.append(group);}
heroRibbon.append(heroRibbonTrack);document.querySelector('.hero').append(heroRibbon);
