const fs=require('fs'),path=require('path'),crypto=require('crypto'),authConfig=require('./cms-auth');
const db=path.join(__dirname,'blogs.json'),siteDb=path.join(__dirname,'site-content.json'),mediaDir=path.join(__dirname,'uploads'),sessions=new Map();
if(!fs.existsSync(mediaDir))fs.mkdirSync(mediaDir,{recursive:true});
const read=()=>{try{return JSON.parse(fs.readFileSync(db,'utf8'))}catch{return[]}};
const write=v=>fs.writeFileSync(db,JSON.stringify(v,null,2));
const readSite=()=>{try{return JSON.parse(fs.readFileSync(siteDb,'utf8'))}catch{return{heroImage:'/visuals/hero-clean.svg',sections:{}}}};
const writeSite=v=>fs.writeFileSync(siteDb,JSON.stringify(v,null,2));
const json=(res,s,d)=>{res.writeHead(s,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(d))};
const cookie=req=>{const m=(req.headers.cookie||'').match(/(?:^|; )nr_cms=([^;]+)/);return m?decodeURIComponent(m[1]):''};
const auth=req=>sessions.has(cookie(req));
const body=req=>new Promise((ok,no)=>{let s='';req.on('data',c=>{s+=c;if(s.length>5e6)req.destroy()});req.on('end',()=>{try{ok(JSON.parse(s||'{}'))}catch(e){no(e)}});req.on('error',no)});
const slug=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
const clean=(v,n=100000)=>String(v??'').trim().slice(0,n);
const normalize=(b,o={})=>{const title=clean(b.title,180),sl=slug(b.slug||title);return{id:o.id||crypto.randomUUID(),title,slug:sl,category:clean(b.category,80)||'Digital Growth',author:clean(b.author,80)||'Next Resource',excerpt:clean(b.excerpt,500),content:clean(b.content),metaTitle:clean(b.metaTitle,70)||title.slice(0,60),metaDescription:clean(b.metaDescription,170)||clean(b.excerpt,160)||title,keywords:clean(b.keywords,300),canonical:clean(b.canonical,300)||('/blog/'+sl),ogImage:clean(b.ogImage,500),date:clean(b.date,30)||new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString()}};
async function route(req,res,p){
if(p==='/api/cms/login'&&req.method==='POST'){const b=await body(req);if(!authConfig.valid(b.email,b.password))return json(res,401,{error:'Invalid credentials'});const t=crypto.randomBytes(32).toString('hex');sessions.set(t,Date.now()+86400000);res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`nr_cms=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`});return res.end('{"ok":true}')}
if(p==='/api/cms/logout'){sessions.delete(cookie(req));res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':'nr_cms=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'});return res.end('{"ok":true}')}
if(p==='/api/cms/me')return auth(req)?json(res,200,{ok:true}):json(res,401,{error:'Unauthorized'});
if(p==='/api/cms/site'&&req.method==='GET')return auth(req)?json(res,200,{site:readSite()}):json(res,401,{error:'Unauthorized'});
if(p==='/api/cms/site'&&req.method==='PUT'){if(!auth(req))return json(res,401,{error:'Unauthorized'});const b=await body(req);if(!b||typeof b!=='object')return json(res,400,{error:'Invalid site data'});writeSite(b);return json(res,200,{site:b})}
if(p==='/api/cms/media'&&req.method==='POST'){if(!auth(req))return json(res,401,{error:'Unauthorized'});const b=await body(req),data=String(b.data||'');const m=data.match(/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,(.+)$/);if(!m)return json(res,400,{error:'Unsupported image'});const ext=m[1]==='jpeg'||m[1]==='jpg'?'jpg':m[1]==='svg+xml'?'svg':m[1];const name=Date.now()+'-'+crypto.randomBytes(4).toString('hex')+'.'+ext;fs.writeFileSync(path.join(mediaDir,name),Buffer.from(m[2],'base64'));return json(res,201,{url:'/uploads/'+name})}
if(p==='/api/cms/posts'&&req.method==='GET')return auth(req)?json(res,200,{posts:read()}):json(res,401,{error:'Unauthorized'});
if(p==='/api/cms/posts'&&req.method==='POST'){if(!auth(req))return json(res,401,{error:'Unauthorized'});const b=await body(req),ps=read(),post=normalize(b);if(!post.title||!post.content)return json(res,400,{error:'Title and content are required'});if(ps.some(x=>x.slug===post.slug))return json(res,409,{error:'Slug already exists'});ps.unshift(post);write(ps);return json(res,201,{post})}
const m=p.match(/^\/api\/cms\/posts\/([^/]+)$/);if(m&&auth(req)){const id=decodeURIComponent(m[1]),ps=read(),i=ps.findIndex(x=>x.id===id);if(i<0)return json(res,404,{error:'Article not found'});if(req.method==='GET')return json(res,200,{post:ps[i]});if(req.method==='DELETE'){ps.splice(i,1);write(ps);return json(res,200,{ok:true})}if(req.method==='PUT'){const post=normalize(await body(req),ps[i]);if(ps.some((x,j)=>j!==i&&x.slug===post.slug))return json(res,409,{error:'Slug already exists'});ps[i]=post;write(ps);return json(res,200,{post})}}
return false}
module.exports={route,read,readSite};
