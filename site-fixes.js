(function(){
  'use strict';

  // Always start at the top after a real page load/reload, but preserve hash navigation.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function resetOnLoad(){
    if (!location.hash) window.scrollTo(0, 0);
  }
  window.addEventListener('DOMContentLoaded', function(){ setTimeout(resetOnLoad, 0); });
  window.addEventListener('load', function(){ setTimeout(resetOnLoad, 0); });
  window.addEventListener('pageshow', function(e){
    if (e.persisted && !location.hash) window.scrollTo(0, 0);
  });

  function addHomeButton(){
    var nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('[data-home-link]')) return;
    var links = nav.querySelector('.links, .navlinks');
    var a = document.createElement('a');
    a.href = '/#home';
    a.textContent = 'Home';
    a.setAttribute('data-home-link','');
    if (links) links.insertBefore(a, links.firstChild);
    else nav.appendChild(a);
  }

  // Use the supplied Next Resource logo asset instead of the text placeholder.
  function useLogoAsset(){
    var logo = document.querySelector('.logo');
    if (!logo || logo.dataset.logoApplied === '1') return;
    logo.dataset.logoApplied = '1';
    logo.innerHTML = '<img src="/next-resource-logo.svg" alt="Next Resource" class="next-resource-logo-img">';
    logo.setAttribute('aria-label','Next Resource');
  }

  document.addEventListener('DOMContentLoaded', function(){
    addHomeButton();
    useLogoAsset();
  });
})();
