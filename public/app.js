const modals=[...document.querySelectorAll('.modal')];
function closeAll(){modals.forEach(m=>m.classList.remove('open'))}
document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',e=>{const id=el.dataset.open;const m=document.getElementById(id);if(m){e.preventDefault();closeAll();m.classList.add('open')}}));
document.querySelectorAll('.close,.close2').forEach(b=>b.addEventListener('click',closeAll));
modals.forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeAll()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');
menu.addEventListener('click',()=>{nav.style.display=nav.style.display==='flex'?'none':'flex';if(nav.style.display==='flex'){Object.assign(nav.style,{position:'absolute',top:'76px',left:'0',right:'0',padding:'24px 6vw',background:'#0a0d0f',flexDirection:'column',borderBottom:'1px solid #273034'})}});
