// SeatWise shared navigation component
(function(){
  const items=[
    ['dashboard.html','▦','Dashboard'],
    ['students.html','♙','Classes & Sections'],
    ['rooms.html','⌂','Rooms'],
    ['subjects-v2.html','◈','Subjects'],
    ['exam-planner.html','◫','Exam Planner'],
    ['exams.html','▤','Exams']
  ];

  function currentFile(){return (location.pathname.split('/').pop()||'index.html').toLowerCase()}
  function isActive(href){return href===currentFile()}

  function render(){
    const nav=document.querySelector('.nav');
    if(!nav)return;
    nav.replaceChildren();

    const label=document.createElement('div');
    label.className='nav-label';
    label.textContent='Main Menu';
    nav.appendChild(label);

    const frag=document.createDocumentFragment();
    items.forEach(([href,icon,text])=>{
      const a=document.createElement('a');
      a.href=href;
      if(isActive(href))a.className='active';
      const span=document.createElement('span');
      span.className='nav-icon';
      span.textContent=icon;
      a.append(span,document.createTextNode(text));
      frag.appendChild(a);
    });

    const settingsWrap=document.createElement('div');
    settingsWrap.className='nav-settings-group';

    const settingsLink=document.createElement('a');
    settingsLink.href='settings.html';
    settingsLink.className='nav-settings-toggle';
    const settingsIcon=document.createElement('span');
    settingsIcon.className='nav-icon';
    settingsIcon.textContent='⚙';
    const settingsText=document.createTextNode('Settings');
    const arrow=document.createElement('span');
    arrow.className='nav-submenu-arrow';
    arrow.textContent='⌄';
    settingsLink.append(settingsIcon,settingsText,arrow);

    const sub=document.createElement('div');
    sub.className='nav-submenu';
    const children=[['user-management.html','♙','User Management'],['history.html','◷','History']];
    children.forEach(([href,icon,text])=>{
      const a=document.createElement('a');
      a.href=href;
      if(isActive(href))a.className='active';
      const span=document.createElement('span');
      span.className='nav-icon';
      span.textContent=icon;
      a.append(span,document.createTextNode(text));
      sub.appendChild(a);
    });

    const settingsIsActive=isActive('settings.html')||children.some(([href])=>isActive(href));
    if(settingsIsActive)settingsWrap.classList.add('open');

    settingsLink.addEventListener('click',function(e){
      // On settings itself, normal navigation is preserved. Otherwise first click
      // opens the submenu; clicking Settings again navigates to the settings page.
      if(!settingsWrap.classList.contains('open')){
        e.preventDefault();
        settingsWrap.classList.add('open');
      }
    });

    settingsWrap.append(settingsLink,sub);
    frag.appendChild(settingsWrap);
    nav.appendChild(frag);
    nav.classList.add('seatwise-nav-ready');
  }

  function init(){
    const style=document.createElement('style');
    style.textContent=`
      .nav-settings-group{margin:0;padding:0}
      .nav-settings-toggle{position:relative}
      .nav-submenu-arrow{margin-left:auto;font-size:14px;line-height:1;transition:transform .18s ease}
      .nav-settings-group.open .nav-submenu-arrow{transform:rotate(180deg)}
      .nav-submenu{display:none;padding:2px 0 8px 0}
      .nav-settings-group.open .nav-submenu{display:block}
      .nav-submenu a{padding-left:58px!important;font-size:14px!important;min-height:40px!important}
      .nav-submenu a .nav-icon{font-size:13px!important}
      .nav-submenu a.active{background:rgba(255,255,255,.16)!important}
      .nav-settings-group>a.active{background:rgba(255,255,255,.16)!important}
    `;
    document.head.appendChild(style);
    render();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
