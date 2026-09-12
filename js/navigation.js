// SeatWise shared navigation component — single source of truth
(function(){
  const items=[
    ['dashboard.html','▦','Dashboard'],
    ['students.html','♙','Classes & Sections'],
    ['rooms.html','⌂','Rooms'],
    ['subjects.html','◈','Subjects'],
    ['exam-planner.html','◫','Exam Planner'],
    ['exams.html','▤','Exams']
  ];
  const settingsChildren=[
    ['user-management.html','♙','User Management'],
    ['history.html','◷','History']
  ];
  const currentFile=()=>((location.pathname.split('/').pop()||'index.html').toLowerCase());
  const active=href=>href===currentFile();
  function injectStyles(){
    if(document.getElementById('seatwise-navigation-style'))return;
    const style=document.createElement('style');
    style.id='seatwise-navigation-style';
    style.textContent=`
      /* Shared navigation: deliberately overrides page-level/mobile nav rules. */
      .sidebar .nav{display:block!important;visibility:hidden!important;width:100%!important;padding:28px 15px!important;overflow:visible!important;flex-direction:column!important;}
      .sidebar .nav.seatwise-nav-ready{visibility:visible!important;}
      .sidebar .nav-label{display:block!important;font-size:11px!important;line-height:1.2!important;letter-spacing:1px!important;color:rgba(255,255,255,.58)!important;padding:0 13px 12px!important;}
      .sidebar .nav>a,.sidebar .nav .nav-submenu>a{display:flex!important;align-items:center!important;gap:14px!important;width:100%!important;min-height:48px!important;height:auto!important;margin:0 0 6px!important;padding:14px 15px!important;border-radius:10px!important;box-sizing:border-box!important;color:rgba(255,255,255,.88)!important;background:transparent!important;text-decoration:none!important;font-size:16px!important;font-weight:400!important;line-height:1.2!important;white-space:normal!important;}
      .sidebar .nav>a:hover,.sidebar .nav .nav-submenu>a:hover{background:rgba(255,255,255,.08)!important;}
      .sidebar .nav>a.active,.sidebar .nav .nav-submenu>a.active{background:#fff!important;color:#1f5fbf!important;font-weight:700!important;}
      .sidebar .nav .nav-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 24px!important;width:24px!important;height:24px!important;font-size:16px!important;line-height:1!important;}
      .sidebar .nav .nav-settings-group{display:block!important;width:100%!important;margin:0!important;}
      .sidebar .nav .nav-settings-toggle{display:flex!important;align-items:center!important;width:100%!important;min-height:48px!important;margin:0 0 6px!important;padding:14px 15px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:rgba(255,255,255,.88)!important;font:inherit!important;font-size:16px!important;line-height:1.2!important;text-align:left!important;cursor:pointer!important;box-sizing:border-box!important;}
      .sidebar .nav .nav-settings-toggle:hover{background:rgba(255,255,255,.08)!important;}
      .sidebar .nav .nav-settings-group.open>.nav-settings-toggle{background:rgba(255,255,255,.08)!important;}
      .sidebar .nav .nav-settings-arrow{margin-left:auto!important;transition:transform .18s ease!important;}
      .sidebar .nav .nav-settings-group.open .nav-settings-arrow{transform:rotate(180deg)!important;}
      .sidebar .nav .nav-submenu{display:none!important;padding:2px 0 8px!important;margin:0!important;}
      .sidebar .nav .nav-settings-group.open .nav-submenu{display:block!important;}
      .sidebar .nav .nav-submenu>a{padding-left:53px!important;font-size:14px!important;min-height:42px!important;margin-bottom:3px!important;}
      @media(max-width:650px){
        .sidebar{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:270px!important;height:100vh!important;z-index:1000!important;overflow-y:auto!important;}
        .sidebar .nav{display:block!important;overflow:visible!important;padding:28px 15px!important;}
        .sidebar .nav-label{display:block!important;}
        .sidebar>div:last-child{display:block!important;}
        .main{margin-left:270px!important;}
      }
    `;
    document.head.appendChild(style);
  }
  function render(){
    const nav=document.querySelector('.sidebar .nav, .nav');
    if(!nav)return;
    nav.replaceChildren();
    const label=document.createElement('div');
    label.className='nav-label';
    label.textContent='Main Menu';
    nav.appendChild(label);
    items.forEach(([href,icon,text])=>{
      const a=document.createElement('a');
      a.href=href;
      if(active(href))a.className='active';
      const s=document.createElement('span');
      s.className='nav-icon';
      s.textContent=icon;
      a.append(s,document.createTextNode(text));
      nav.appendChild(a);
    });
    const group=document.createElement('div');
    group.className='nav-settings-group';
    const settings=document.createElement('button');
    settings.type='button';
    settings.className='nav-settings-toggle';
    const si=document.createElement('span');si.className='nav-icon';si.textContent='⚙';
    const st=document.createTextNode('Settings');
    const arrow=document.createElement('span');arrow.className='nav-settings-arrow';arrow.textContent='⌄';
    settings.append(si,st,arrow);
    const sub=document.createElement('div');sub.className='nav-submenu';
    settingsChildren.forEach(([href,icon,text])=>{
      const a=document.createElement('a');a.href=href;
      if(active(href))a.className='active';
      const s=document.createElement('span');s.className='nav-icon';s.textContent=icon;
      a.append(s,document.createTextNode(text));sub.appendChild(a);
    });
    if(active('settings.html')||sub.querySelector('.active'))group.classList.add('open');
    settings.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();group.classList.toggle('open');});
    group.append(settings,sub);
    nav.appendChild(group);
    nav.classList.add('seatwise-nav-ready');
    nav.style.visibility='visible';
  }
  function init(){injectStyles();render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
