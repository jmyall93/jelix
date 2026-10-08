const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const err=(msg,status)=>json({error:msg},status);
const kinds=new Set(['lead','customer','quote','milestone','campaign','release','task','product','idea','integration','subscription','entitlement','ticket','onboarding','invoice','setting']);
async function auth(req,env){
 const token=req.headers.get('Cf-Access-Jwt-Assertion');
 if(!token||!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||!env.OWNER_EMAIL)return null;
 try{
 const [a,b,c]=token.split('.');if(!a||!b||!c)return null;
 const decode=x=>JSON.parse(atob(x.replace(/-/g,'+').replace(/_/g,'/')));
 const head=decode(a),claims=decode(b);
 if(head.alg!=='RS256'||!head.kid||claims.aud!==env.ACCESS_AUD&&!(Array.isArray(claims.aud)&&claims.aud.includes(env.ACCESS_AUD)))return null;
 if(claims.iss!==`https://${env.ACCESS_TEAM_DOMAIN}`||claims.exp<=Date.now()/1000||!claims.email||claims.email.toLowerCase()!==env.OWNER_EMAIL.toLowerCase())return null;
 const keys=await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`).then(r=>r.json());
 const key=keys.keys.find(k=>k.kid===head.kid);if(!key)return null;
 const publicKey=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const sig=Uint8Array.from(atob(c.replace(/-/g,'+').replace(/_/g,'/')),v=>v.charCodeAt(0));
 const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,sig,new TextEncoder().encode(a+'.'+b));
 return ok?claims.email:null;
 }catch{return null;}
}
async function log(db,actor,action,kind,id){await db.prepare('INSERT INTO audit (id,actor,action,kind,record_id,at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,kind,id,new Date().toISOString()).run()}
export default {async fetch(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(path==='/api/health')return json({service:'JELIX v3',status:'configured',database:!!env.DB,authentication:'Cloudflare Access JWT required'});
 if(!path.startsWith('/api/')&&!['/owner-hq.html','/owner-hq.js','/owner-hq.css','/quotes.js','/v3.html','/v3.js'].includes(path))return env.ASSETS.fetch(req);
 const actor=await auth(req,env);if(!actor)return path.startsWith('/api/')?err('Owner access required. Configure Cloudflare Access and OWNER_EMAIL.',401):new Response('Owner access required. Configure Cloudflare Access.',{status:401,headers:{'content-type':'text/plain'}});
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(req);
 if(!env.DB)return err('D1 database not configured. See SETUP.md.',503);
 if(path==='/api/me')return json({email:actor,role:'owner'});
 if(path==='/api/audit'&&req.method==='GET'){const r=await env.DB.prepare('SELECT * FROM audit ORDER BY at DESC LIMIT 100').all();return json(r.results)}
 if(path==='/api/integrations'&&req.method==='GET')return json({github:!!env.GITHUB_TOKEN,cloudflare:!!env.CF_API_TOKEN,billing:'not connected',product_telemetry:'not connected'});
 if(path==='/api/github'&&req.method==='GET'){
 if(!env.GITHUB_TOKEN||!env.GITHUB_REPO)return err('GitHub integration not configured',503);
 const r=await fetch('https://api.github.com/repos/'+env.GITHUB_REPO+'/releases?per_page=15',{headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,'User-Agent':'JELIX-OwnerHQ','Accept':'application/vnd.github+json'}});
 return json({status:r.status,data:r.ok?await r.json():null},r.ok?200:502);
 }
 if(path==='/api/cloudflare'&&req.method==='GET'){
 if(!env.CF_API_TOKEN||!env.CF_ACCOUNT_ID||!env.CF_WORKER_NAME)return err('Cloudflare integration not configured',503);
 const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${env.CF_WORKER_NAME}/deployments`,{headers:{Authorization:'Bearer '+env.CF_API_TOKEN}});
 return json({status:r.status,data:r.ok?await r.json():null},r.ok?200:502);
 }
 const m=path.match(/^\/api\/records\/([a-z]+)(?:\/([\w-]+))?$/);if(!m||!kinds.has(m[1]))return err('Not found',404);
 const kind=m[1],id=m[2];
 if(req.method==='GET'){
 if(id){const r=await env.DB.prepare('SELECT * FROM records WHERE kind=? AND id=?').bind(kind,id).first();return r?json({...r,data:JSON.parse(r.data)}):err('Not found',404)}
 const r=await env.DB.prepare('SELECT * FROM records WHERE kind=? ORDER BY updated_at DESC LIMIT 250').bind(kind).all();return json(r.results.map(x=>({...x,data:JSON.parse(x.data)})));
 }
 if(!['POST','PUT','DELETE'].includes(req.method))return err('Method not allowed',405);
 if(req.method==='DELETE'){
 if(!id)return err('ID required',400);
 await env.DB.prepare('DELETE FROM records WHERE kind=? AND id=?').bind(kind,id).run();await log(env.DB,actor,'delete',kind,id);return json({ok:true});
 }
 if(req.method==='PUT'&&!id)return err('ID required',400);
 let body;try{body=await req.json()}catch{return err('Invalid JSON',400)}
 if(!body||typeof body!=='object'||Array.isArray(body)||JSON.stringify(body).length>40000)return err('Invalid record',400);
 const rid=id||crypto.randomUUID(),now=new Date().toISOString(),org=typeof body.org_id==='string'?body.org_id:null;
 if(req.method==='PUT'){
 const found=await env.DB.prepare('SELECT id FROM records WHERE kind=? AND id=?').bind(kind,rid).first();if(!found)return err('Not found',404);
 await env.DB.prepare('UPDATE records SET data=?,org_id=?,updated_at=? WHERE kind=? AND id=?').bind(JSON.stringify(body),org,now,kind,rid).run();
 }else await env.DB.prepare('INSERT INTO records(id,kind,org_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(rid,kind,org,JSON.stringify(body),now,now).run();
 await log(env.DB,actor,req.method==='POST'?'create':'update',kind,rid);return json({id:rid,kind,data:body,updated_at:now},req.method==='POST'?201:200);
 }};
