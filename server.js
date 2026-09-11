const http=require('http'),https=require('https'),zlib=require('zlib');
const port=process.env.PORT||3000;
const source='https://raw.githubusercontent.com/everkumud-code/next-resource-website/f09b07aeac25e823d3b46939d6ef2977145f0911/server.js';
const injected='\n<link rel="stylesheet" href="/site-fixes.css?v=fix2"><script src="/site-fixes.js?v=fix2" defer></script>\n';
function get(url){return new Promise((resolve,reject)=>https.get(url,r=>{let d='';r.setEncoding('utf8');r.on('data',c=>d+=c);r.on('end',()=>r.statusCode>=200&&r.statusCode<300?resolve(d):reject(new Error('GitHub '+r.statusCode)));}).on('error',reject));}
async function boot(){
  try{
    const src=await get(source);
    const m=src.match(/Buffer\.from\('([^']+)'\s*,\s*'base64'\)/);
    if(!m) throw new Error('Original visual payload not found');
    const html=zlib.gunzipSync(Buffer.from(m[1],'base64')).toString('utf8');
    const page=html.replace('</head>',injected+'</head>');
    const server=http.createServer((req,res)=>{
      const path=(req.url||'/').split('?')[0];
      if(path==='/site-fixes.css'||path==='/site-fixes.js'){return res.writeHead(404).end();}
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(page);
    });
    server.listen(port,'0.0.0.0',()=>console.log('Next Resource original visual runtime listening on '+port));
  }catch(e){console.error(e);process.exit(1)}
}
boot();
