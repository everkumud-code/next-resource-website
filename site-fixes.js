(function(){
  'use strict';
  // Always begin at the top after a full refresh/reload.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function topOnReload(){
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!nav || nav.type === 'reload' || nav.type === 'navigate') {
      window.scrollTo(0,0);
    }
  }
  window.addEventListener('load', function(){ setTimeout(topOnReload, 0); });
  window.addEventListener('pageshow', function(e){ if (e.persisted) window.scrollTo(0,0); });

  function addHomeButton(){
    var nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-home-link]')) return;
    var links = nav.querySelector('.links');
    var a = document.createElement('a');
    a.href = '/#home';
    a.textContent = 'Home';
    a.setAttribute('data-home-link','');
    a.addEventListener('click', function(){
      if (location.pathname === '/' || location.pathname === '') {
        setTimeout(function(){ window.scrollTo({top:0,left:0,behavior:'smooth'}); }, 0);
      }
    });
    if (links) links.insertBefore(a, links.firstChild);
    else nav.appendChild(a);
  }

  document.addEventListener('DOMContentLoaded', addHomeButton);
})();
