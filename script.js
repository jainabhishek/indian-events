const events = [
  {date:'2026-09-29',time:'7:00 PM',name:'Saraswathi Ranganathan & Tzu-Tsen Wu',category:'Music · Carnatic / world',kind:'music',venue:'South Asia Institute',city:'Chicago',note:'Free admission · doors 6:00 PM',free:true,url:'https://www.sangeetcentral.com/concerts/saraswathi-ranganathan-south-asia-institute-2026-09-29'},
  {date:'2026-10-02',time:'10:00 PM doors',name:'Indo Warehouse + Anyasa + HARJI',category:'Music · electronic',kind:'music',venue:'Cermak Hall at Radius',city:'Chicago',note:'Ages 18+',url:'https://www.axs.com/events/1488530/indo-warehouse-tickets'},
  {date:'2026-10-03',time:'Time TBA',name:'Kruthi Bhat',category:'Music · Carnatic classical',kind:'music',venue:'Sri Venkateswara Swami Temple',city:'Aurora',note:'Check organizer for the start time',url:'https://chicagotyagarajautsavam.org/'},
  {date:'2026-10-09',time:'7:00 PM',name:'Sivaangi & Maanasi: Unlimited Aura',category:'Music · Tamil',kind:'music',venue:'Yellow Box',city:'Naperville',note:'All ages',url:'https://events.sulekha.com/unlimited-aura-sivaangi-maanasi-live-chicago_event-in_naperville-il_401960'},
  {date:'2026-10-11',time:'7:00 PM',name:'Kanan Gill: Not This Again',category:'Comedy · stand-up',kind:'comedy',venue:'Park West',city:'Chicago',note:'All ages · doors 6:00 PM',url:'https://www.jamusa.com/events/detail/kanan-gill-1317677'},
  {date:'2026-10-31',time:'8:30 PM',name:'Do The Needful: Live on Halloween',category:'Music · punk Bollywood',kind:'music',venue:'Skylark',city:'Chicago',note:'Free · no cover',free:true,url:'https://www.skylarkchicago.com/events/do-the-needful-live-oct-26'},
  {date:'2026-11-24',time:'6:00 PM & 9:30 PM',name:'Mohini Dey',category:'Music · jazz / fusion',kind:'music',venue:'City Winery Chicago',city:'Chicago',note:'Both shows currently marked sold out by the venue',url:'https://citywinery.com/pages/genre/chicago-blues-jazz'}
];
const list=document.querySelector('#event-list');
function render(filter='all'){
  const today=new Date();today.setHours(0,0,0,0);
  const visible=events.filter(event=>new Date(`${event.date}T00:00:00`)>=today).filter(event=>filter==='all'||(filter==='free'?event.free:event.kind===filter));
  list.replaceChildren();
  if(!visible.length){const p=document.createElement('p');p.className='empty';p.textContent='No upcoming events in this category right now. Check back soon.';list.append(p);return;}
  for(const event of visible){const date=new Date(`${event.date}T12:00:00`);const article=document.createElement('article');article.className='event-card';article.innerHTML=`<div class="date-box"><span>${date.toLocaleString('en-US',{month:'short'}).toUpperCase()}</span><strong>${date.getDate()}</strong></div><div class="event-info"><span class="event-category">${event.category}</span><h3>${event.name}</h3><p class="event-meta">${date.toLocaleString('en-US',{weekday:'long'})}, ${event.time} · ${event.venue}, ${event.city}</p><p class="event-note">${event.note}</p></div><a class="event-link" href="${event.url}" target="_blank" rel="noopener noreferrer" aria-label="View source for ${event.name}">Details & tickets ↗</a>`;list.append(article);}
}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});button.classList.add('active');button.setAttribute('aria-pressed','true');render(button.dataset.filter)}));
render();
