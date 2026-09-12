// SeatWise shared navigation component
(function(){
  const items=[['dashboard.html','▦','Dashboard'],['students.html','♙','Classes & Sections'],['rooms.html','⌂','Rooms'],['subjects.html','◈','Subjects'],['exam-planner.html','◫','Exam Planner'],['exams.html','▤','Exams']];
  function currentFile(){return(location.pathname.split('/').pop()||'index.html').toLowerCase()}
  function isActive(href){return href===currentFile() || (href==='subjects.html' && currentFile()==='subjects-v2.html')}
  function render(){
    const nav=document.querySelector('.nav');if(!nav)return;
    nav.replaceChildren();
    const label=document.createElement('div');label.className='nav-label';label.textContent='Main Menu';nav.appendChild(label);
    const frag=document.createDocumentFragment();
    items.forEach(([href,ic,txt])=>{const a=document.createElement('a');a.href=href;if(isActive(href))a.className='active';const s=document.createElement('span');s.className='nav-icon';s.textContent=ic;a.append(s,document.createTextNode(txt));frag.appendChild(a)});
    const wrap=document.createElement('div');wrap.className='nav-settings-group';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='nav-settings-toggle';
    const si=document.createElement('span');si.className='nav-icon';si.textContent='⚙';const st=document.createTextNode('Settings');const ar=document.createElement('span');ar.className='nav-submenu-arrow';ar.textContent='⌄';toggle.append(si,st,ar);
    const sub=document.createElement('div');sub.className='nav-submenu';
    [['user-management.html','♙','User Management'],['history.html','◷','History']].forEach(([href,ic,txt])=>{const a=document.createElement('a');a.href=href;if(isActive(href))a.className='active';const s=document.createElement('span');s.className='nav-icon';s.textContent=ic;a.append(s,document.createTextNode(txt));sub.appendChild(a)});
    if(isActive('settings.html')||sub.querySelector('.active'))wrap.classList.add('open');
    toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();wrap.classList.toggle('open')});
    wrap.append(toggle,sub);frag.appendChild(wrap);nav.appendChild(frag);nav.classList.add('seatwise-nav-ready');
  }
  function init(){
    if(!document.getElementById('seatwise-navigation-style')){const style=document.createElement('style');style.id='seatwise-navigation-style';style.textContent='.nav{visibility:hidden}.nav.seatwise-nav-ready{visibility:visible}.nav-settings-group{margin:0}.nav-settings-toggle{position:relative;width:100%;border:0;background:transparent;color:inherit;text-align:left;font:inherit;display:flex;align-items:center;cursor:pointer;padding:0 20px;min-height:48px;border-radius:10px}.nav-settings-toggle:hover{background:rgba(255,255,255,.08)}.nav-submenu-arrow{margin-left:auto;transition:transform .18s ease}.nav-settings-group.open .nav-submenu-arrow{transform:rotate(180deg)}.nav-submenu{display:none;padding:2px 0 8px}.nav-settings-group.open .nav-submenu{display:block}.nav-submenu a{padding-left:58px!important;font-size:14px!important;min-height:40px!important}.nav-submenu a.active{background:rgba(255,255,255,.16)!important}';document.head.appendChild(style)}
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
