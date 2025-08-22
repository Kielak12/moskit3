// MoskitoMobil — small JS bundle (≈ 2KB gzipped)
// - IntersectionObserver for reveal animations
// - Lightweight form validation + fetch to Formspree (replace endpoint)
// - Deferred Google Map loading on click

const $$ = (sel, root=document) => root.querySelector(sel);
const $$$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Copyright year
$$('#y').textContent = new Date().getFullYear();

// Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('is-visible');
      observer.unobserve(e.target);
    }
  });
},{threshold:0.15});
$$$('.reveal').forEach(el=>observer.observe(el));

// Form handling
const FORM_ENDPOINT = 'https://formspree.io/f/your-id-here'; // TODO: wstaw swój ID z Formspree
const form = $$('#contactForm');
const msg = $$('#formMsg');

function setError(name, text=''){
  const err = document.querySelector(`.err[data-for="${name}"]`);
  if(err) err.textContent = text;
}

function valid(){
  let ok = true;
  const required = ['name','phone','city','type','qty','date','rodo'];
  required.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    const value = el.type === 'checkbox' ? el.checked : el.value.trim();
    if(!value){
      ok = false;
      setError(id,'To pole jest wymagane.');
    } else {
      setError(id,'');
    }
  });
  const email = document.getElementById('email').value.trim();
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    ok = false;
    setError('email','Podaj poprawny e-mail.');
  } else {
    setError('email','');
  }
  return ok;
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  msg.textContent = '';
  if(!valid()){
    msg.textContent = 'Uzupełnij wymagane pola.';
    msg.style.color = '#b91c1c';
    return;
  }
  const data = new FormData(form);
  try{
    const res = await fetch(FORM_ENDPOINT, {
      method:'POST',
      headers:{'Accept':'application/json'},
      body: data
    });
    if(res.ok){
      form.reset();
      msg.textContent = 'Dziękujemy! Skontaktujemy się, aby potwierdzić termin.';
      msg.style.color = '#065f46';
    }else{
      msg.textContent = 'Ups! Coś poszło nie tak. Napisz na kontakt@moskitomobil.pl lub zadzwoń.';
      msg.style.color = '#b91c1c';
    }
  }catch(err){
    msg.textContent = 'Brak połączenia. Spróbuj ponownie lub zadzwoń.';
    msg.style.color = '#b91c1c';
  }
});

// Lazy map load (on demand to keep page fast)
$$('#loadMap')?.addEventListener('click', ()=>{
  const holder = $$('#mapHolder');
  if(holder && !holder.dataset.loaded){
    const iframe = document.createElement('iframe');
    iframe.title = 'Mapa — MoskitoMobil, Warszawa';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.src = 'https://www.google.com/maps?q=ul.%20Wiosenna%2014%2C%2003-123%20Warszawa&output=embed';
    holder.appendChild(iframe);
    holder.dataset.loaded = '1';
    holder.setAttribute('aria-hidden','false');
  }
});
