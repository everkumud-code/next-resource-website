(function(){
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function resetOnLoad(){ if(!location.hash) window.scrollTo(0,0); }
  window.addEventListener('DOMContentLoaded',function(){setTimeout(resetOnLoad,0);});
  window.addEventListener('load',function(){setTimeout(resetOnLoad,0);});
  window.addEventListener('pageshow',function(e){if(e.persisted&&!location.hash)window.scrollTo(0,0);});
  function addHomeButton(){
    var nav=document.querySelector('.nav');
    if(!nav||nav.querySelector('[data-home-link]'))return;
    var links=nav.querySelector('.links,.navlinks');
    var a=document.createElement('a');
    a.href='/#home'; a.textContent='Home'; a.setAttribute('data-home-link','');
    if(links)links.insertBefore(a,links.firstChild); else nav.appendChild(a);
  }
  document.addEventListener('DOMContentLoaded',addHomeButton);
})();
