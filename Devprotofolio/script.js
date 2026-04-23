// script.js - interactions for portfolio

// Helper - select
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', ()=>{
  // theme toggle
  const toggle = $('#theme-toggle');
  const stored = localStorage.getItem('theme');
  if(stored) document.documentElement.setAttribute('data-theme', stored);
  toggle?.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? '' : 'dark';
    if(next) document.documentElement.setAttribute('data-theme', next);
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', next);
  });

  // mobile nav toggle
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');
  navToggle?.addEventListener('click', ()=>{
    const shown = navLinks.style.display === 'flex';
    navLinks.style.display = shown ? '' : 'flex';
  });

  // smooth scroll handled by CSS but add offset for header (if needed)
  const header = document.querySelector('.site-header');
  const offset = header ? header.offsetHeight : 0;
  $$('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset + 8;
      window.scrollTo({top,behavior:'smooth'});
      // hide mobile nav
      if(window.innerWidth <= 900) navLinks.style.display = '';
    });
  });

  // active link highlighting using IntersectionObserver
  const sections = ['home','about','skills','projects','contact'].map(id=>document.getElementById(id)).filter(Boolean);
  const navItems = $$('.nav-link');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navItems.forEach(a=>a.classList.toggle('active', a.getAttribute('href').slice(1) === entry.target.id));
      }
    });
  },{root:null,threshold:0.45});
  sections.forEach(s=>obs.observe(s));

  // reveal animations
  const reveals = $$('.reveal');
  const revObs = new IntersectionObserver((entries,ro)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        ro.unobserve(e.target);
      }
    });
  },{threshold:0.12});
  reveals.forEach(r=>revObs.observe(r));

  // scroll-to-top button
  const topBtn = $('#scroll-top');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 560) topBtn.style.display = 'block';
    else topBtn.style.display = 'none';
  });
  topBtn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

  // form handling & validation
  const form = $('#contact-form');
  const status = $('.form-status');
  const resetBtn = $('#form-reset');
  resetBtn?.addEventListener('click', ()=>form.reset());
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    status.textContent = '';
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    if(!name || !email || !message){
      status.textContent = 'Please fill in all fields.';return;
    }
    // simple email regex
    const re = /^\S+@\S+\.\S+$/;
    if(!re.test(email)){ status.textContent = 'Please enter a valid email.'; return; }

    // POST to Formspree - replace {your_form_id} in HTML with your form id
    const action = form.getAttribute('action');
    if(action.includes('{your_form_id}')){
      status.textContent = 'Form not configured: replace {your_form_id} with your Formspree form id in the HTML form action to enable submissions. As a fallback, an email link will open.';
      // fallback to mailto
      const mailto = `mailto:youremail@example.com?subject=${encodeURIComponent('Portfolio contact from '+name)}&body=${encodeURIComponent(message+'\n\n — '+name+' | '+email)}`;
      window.location.href = mailto;
      return;
    }

    try{
      const formData = new FormData(form);
      const res = await fetch(action, {method:'POST',body:formData,headers:{'Accept':'application/json'}});
      if(res.ok){ status.textContent = 'Thanks — your message was sent!'; form.reset(); }
      else{
        const data = await res.json();
        status.textContent = data?.error || 'Submission failed. Please try again later.';
      }
    }catch(err){ console.error(err); status.textContent = 'Network error. Please try again later.' }
  });

  // set year in footer
  $('#year').textContent = new Date().getFullYear();

});
