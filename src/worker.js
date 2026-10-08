const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const err=(msg,status)=>json({error:msg},status);
const kinds=new Set(['lead','customer','quote','milestone','campaign','release','task','product','idea','integration','subscription','entitlement','ticket','onboarding','invoice','setting']);
const encoder=new TextEncoder();
const cookieName='jelix_owner_session';
function b64url(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64(str){return Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-str.length%4)%4)),c=>c.charCodeAt(0))}
async function hmac(key,value){const k=await crypto.subtle.importKey('raw',encoder.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',k,encoder.encode(value))))}
async function passwordDigest(password,salt){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return b64url(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:310000,hash:'SHA-256'},key,256)))}
function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
function secureHeaders(extra={}){return {'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY',...extra}}
async function auth(req,env){
 if(!env.SESSION_SECRET||!env.OWNER_EMAIL)return null;
 const match=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)jelix_owner_session=([^;]+)/);if(!match)return null;
 try{const [payload,sig]=match[1].split('.');if(!payload||!sig||!constantEqual(sig,await hmac(env.SESSION_SECRET,payload)))return null;
 const session=JSON.parse(new TextDecoder().decode(unb64(payload)));
 if(session.exp<Date.now()||session.exp>Date.now()+86400000||session.email.toLowerCase()!==env.OWNER_EMAIL.toLowerCase())return null;
 return session.email;
 }catch{return null}
}
const protectedFiles=new Set(['/owner-hq.html','/owner-hq.js','/owner-hq.css','/quotes.js','/v3.html','/v3.js']);
async function login(req,env){
 if(!env.DB||!env.OWNER_EMAIL||!env.OWNER_PASSWORD_HASH||!env.OWNER_PASSWORD_SALT||!env.SESSION_SECRET)return err('Administrator login is not configured.',503);
 let body;try{body=await req.json()}catch{return err('Invalid request',400)}
 const email=String(body.email||'').trim().toLowerCase(), password=String(body.password||'');
 if(password.length>1024||email.length>254)return err('Invalid credentials',401);
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const ipKey=b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(ip+'|'+env.SESSION_SECRET))));
 const windowStart=Date.now()-15*60*1000;
 await env.DB.prepare('DELETE FROM login_attempts WHERE at < ?').bind(windowStart).run();
 const row=await env.DB.prepare('SELECT COUNT(*) AS attempts FROM login_attempts WHERE ip_hash=? AND at>=?').bind(ipKey,windowStart).first();
 if(row.attempts>=10)return err('Too many attempts. Try again in 15 minutes.',429);
 const digest=await passwordDigest(password,env.OWNER_PASSWORD_SALT);
 if(email!==env.OWNER_EMAIL.toLowerCase()||!constantEqual(digest,env.OWNER_PASSWORD_HASH)){
  await env.DB.prepare('INSERT INTO login_attempts(ip_hash,at) VALUES (?,?)').bind(ipKey,Date.now()).run();
  return err('Invalid email or password',401);
 }
 await env.DB.prepare('DELETE FROM login_attempts WHERE ip_hash=?').bind(ipKey).run();
 const payload=b64url(encoder.encode(JSON.stringify({email:env.OWNER_EMAIL,exp:Date.now()+8*60*60*1000,nonce:crypto.randomUUID()})));
 const sig=await hmac(env.SESSION_SECRET,payload);
 return new Response(JSON.stringify({ok:true,email:env.OWNER_EMAIL}),{headers:secureHeaders({'content-type':'application/json','set-cookie':`${cookieName}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`})});
}
async function log(db,actor,action,kind,id){await db.prepare('INSERT INTO audit (id,actor,action,kind,record_id,at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,kind,id,new Date().toISOString()).run()}
export default {async fetch(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(path==='/api/health')return json({service:'JELIX v3',status:'configured',database:!!env.DB,authentication:'Built-in administrator session'});
 if(path==='/api/auth/login'&&req.method==='POST')return login(req,env);
 if(path==='/api/auth/logout'&&req.method==='POST')return new Response(JSON.stringify({ok:true}),{headers:secureHeaders({'content-type':'application/json','set-cookie':`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`})});
 if(!path.startsWith('/api/')&&!protectedFiles.has(path))return env.ASSETS.fetch(req);
 const actor=await auth(req,env);
 if(!actor){if(path.startsWith('/api/'))return err('Administrator login required',401);
 return Response.redirect(new URL('/owner-login.html',req.url).toString(),302)}
 if(path.startsWith('/api/')&&!['GET','HEAD','OPTIONS'].includes(req.method)){
  const origin=req.headers.get('Origin');if(!origin||origin!==url.origin)return err('Invalid request origin',403);
 }
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
