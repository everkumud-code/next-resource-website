(function(){
  const root=document.getElementById('post-content');
  if(!root)return;
  const q=new URLSearchParams(location.search).get('post');
  const path=location.pathname.replace(/\/+$/,'');
  const slug=q || (path.match(/^\/blog\/([^/]+)$/)||[])[1];
  if(!slug){root.innerHTML='<h1>Article unavailable.</h1><p>Please return to the blog.</p><p><a class="text-link" href="/blog.html">← Back to blog</a></p>';return;}
  fetch('/blogs.json').then(r=>{if(!r.ok)throw new Error('blogs');return r.json()}).then(data=>{
    const posts=Array.isArray(data)?data:(data.posts||[]);
    const p=posts.find(x=>x.slug===slug);
    if(!p)throw new Error('post');
    const title=p.metaTitle||p.title+' | Next Resource';
    const desc=p.metaDescription||p.excerpt||'';
    document.title=title;
    const set=(selector,attr,value)=>{const el=document.querySelector(selector);if(el)el.setAttribute(attr,value)};
    set('meta[name="description"]','content',desc);
    set('meta[property="og:title"]','content',title);set('meta[property="og:description"]','content',desc);set('meta[property="og:url"]','content',p.canonical||location.href);
    set('meta[name="twitter:title"]','content',title);set('meta[name="twitter:description"]','content',desc);
    let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c)}c.href=p.canonical||location.href;
    let schema=document.querySelector('script[type="application/ld+json"]');
    if(schema){try{const s=JSON.parse(schema.textContent);s.headline=p.title;s.description=desc;s.datePublished=p.date;s.dateModified=p.updatedAt||p.date;s.mainEntityOfPage=p.canonical||location.href;schema.textContent=JSON.stringify(s)}catch(e){}}
    const raw=Array.isArray(p.content)?p.content.join(''):String(p.content||'');
    const content=raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>x.startsWith('## ')?'<h2>'+x.slice(3)+'</h2>':x.startsWith('### ')?'<h3>'+x.slice(4)+'</h3>':'<p>'+x.replace(/\n/g,' ')+'</p>').join('');
    root.innerHTML='<span class="label">'+(p.category||'DIGITAL GROWTH')+' · NEXT RESOURCE</span><h1>'+p.title+'</h1><p class="lead">'+(p.excerpt||'')+'</p><div class="post-body">'+content+'</div><p><a class="text-link" href="/blog.html">← Back to all articles</a></p>';
  }).catch(()=>{root.innerHTML='<h1>Article unavailable.</h1><p>We could not load this article right now.</p><p><a class="text-link" href="/blog.html">← Back to blog</a></p>'});
})();
