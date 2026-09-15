/* SeatWise Navigation - single shared implementation. */
(function(){
  if(window.__seatwiseNavLoaded)return;
  window.__seatwiseNavLoaded=true;

  const page=(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
  if(page==='index.html')return;

  const routes={
    'dashboard.html':'dashboard','dashboard-school.html':'dashboard',
    'students.html':'classes','rooms.html':'rooms','subjects.html':'subjects',
    'exam-planner.html':'planner','exams.html':'exams','history.html':'history',
    'settings.html':'settings','user-management.html':'users'
  };
  let active=routes[page]||'dashboard';
  if(page==='import-data.html'){
    const type=new URLSearchParams(location.search).get('type');
    active=type==='rooms'?'rooms':type==='subjects'?'subjects':'classes';
  }
  const icons={
    dashboard:'<rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/>',
    classes:'<path d="M3 5h3l2-2h4l2 2h1v8H3z"/><path d="M6 8h6"/>',
    rooms:'<path d="M3 14V7l6-4 6 4v7"/><path d="M6 14V9h6v5"/>',
    subjects:'<path d="M9 2l2 4 4 .5-3 3 1 4.5-4-2.2L5 14l1-4.5-3-3L7 6z"/>',
    planner:'<rect x="3" y="3" width="12" height="12" rx="1"/><path d="M6 6h6M6 9h6M6 12h3"/>',
    exams:'<rect x="3" y="2" width="12" height="13" rx="1"/><path d="M6 5h6M6 8h6M6 11h4"/>',
    settings:'<circle cx="9" cy="9" r="2.5"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4 4l1.4 1.4M12.6 12.6L14 14M14 4l-1.4 1.4M5.4 12.6L4 14"/>',
    users:'<circle cx="9" cy="6" r="2.2"/><path d="M4.5 14c.4-2.2 1.8-3.3 4.5-3.3s4.1 1.1 4.5 3.3"/>',
    history:'<path d="M3 8a6 6 0 1 0 2-4.4"/><path d="M3 3v4h4M9 5v4l2.5 1.5"/>'
  };
  const main=[['dashboard','Dashboard','dashboard.html'],['classes','Classes & Sections','students.html'],['rooms','Rooms','rooms.html'],['subjects','Subjects','subjects.html'],['planner','Exam Planner','exam-planner.html'],['exams','Exams','exams.html']];
  const sub=[['users','User Management','user-management.html'],['history','History','history.html']];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session=window.getSeatwiseSession?.()||{};
  const name=(session.name||'Administrator').trim()||'Administrator';
  const school=session.school_name||'School Admin';
  const parts=name.split(/\s+/).filter(Boolean);
  const initials=(parts.length>1?parts[0][0]+parts[parts.length-1][0]:parts[0][0]).toUpperCase();
  const icon=k=>`<svg viewBox="0 0 18 18" aria-hidden="true">${icons[k]||icons.dashboard}</svg>`;
  const item=x=>`<a class="sw-item ${active===x[0]?'active':''}" href="${x[2]}" data-key="${x[0]}"><span class="sw-icon">${icon(x[0])}</span><span>${x[1]}</span></a>`;

  function mount(){
    if(!document.body||document.querySelector('[data-seatwise-shared-nav]'))return;
    const host=document.createElement('aside');
    host.setAttribute('data-seatwise-shared-nav','true');
    host.innerHTML=`<style>
      :host{all:initial}*{box-sizing:border-box}
      .sw-sidebar{position:fixed;inset:0 auto 0 0;width:272px;height:100dvh;z-index:2147483000;display:grid;grid-template-rows:88px minmax(0,1fr) 84px;overflow:hidden;background:linear-gradient(180deg,#2365c4 0%,#174e9f 100%);font-family:Inter,Arial,sans-serif;color:#fff}
      .sw-brand{height:88px;padding:0 25px;display:flex;align-items:center;gap:13px;border-bottom:1px solid rgba(255,255,255,.14)}
      .sw-mark{width:46px;height:46px;border:1px solid rgba(255,255,255,.35);border-radius:13px;display:grid;place-items:center;font-size:22px;flex:0 0 46px}.sw-brand-name{font-size:28px;font-weight:800;letter-spacing:-.8px}.sw-brand-name span{color:#dceaff}
      .sw-nav{min-height:0;overflow:auto;padding:28px 14px 20px;scrollbar-width:none}.sw-nav::-webkit-scrollbar{display:none}
      .sw-item,.sw-settings{width:100%;height:48px;min-height:48px;margin:0 0 5px;padding:0 14px;border:0;border-radius:11px;display:flex;align-items:center;gap:13px;background:transparent;color:rgba(255,255,255,.94);text-decoration:none;font-size:15px;font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;appearance:none}
      .sw-item:hover,.sw-settings:hover{background:rgba(255,255,255,.08)}.sw-item.active{background:#fff;color:#1f5fbf;font-weight:750}
      .sw-icon{width:21px;height:21px;flex:0 0 21px;display:grid;place-items:center}.sw-icon svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
      .sw-settings .chevron{margin-left:auto;width:18px;text-align:center;font-size:14px}.sw-settings.open .chevron{transform:rotate(180deg)}
      .sw-submenu{display:none;padding:0 0 5px}.sw-submenu.open{display:block}.sw-submenu .sw-item{height:43px;min-height:43px;padding-left:48px;margin-bottom:3px;font-size:14px}.sw-submenu .sw-icon{width:18px;flex-basis:18px}.sw-submenu .sw-icon svg{width:15px;height:15px}
      .sw-footer{height:84px;min-height:84px;padding:0 18px;display:flex;align-items:center;gap:11px;border-top:1px solid rgba(255,255,255,.14);background:rgba(8,48,112,.14)}
      .sw-avatar{width:42px;height:42px;min-width:42px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#2365c4;font-size:13px;font-weight:850}.sw-profile{min-width:0;flex:1}.sw-name,.sw-school{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sw-name{font-size:14px;font-weight:750;line-height:20px}.sw-school{margin-top:2px;color:rgba(255,255,255,.66);font-size:11px;line-height:17px}
      .sw-logout{width:34px;height:34px;min-width:34px;padding:0;border:0;border-radius:8px;background:transparent;color:#fff;display:grid;place-items:center;cursor:pointer}.sw-logout:hover{background:rgba(255,255,255,.08)}.sw-logout svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      @media(max-width:700px){.sw-sidebar{width:240px}}
    </style><div class="sw-sidebar"><div class="sw-brand"><div class="sw-mark">▦</div><div class="sw-brand-name">Seat<span>Wise</span></div></div><nav class="sw-nav">${main.map(item).join('')}<button class="sw-settings ${['settings','users','history'].includes(active)?'open':''}" type="button" aria-expanded="${['settings','users','history'].includes(active)}"><span class="sw-icon">${icon('settings')}</span><span>Settings</span><span class="chevron">⌄</span></button><div class="sw-submenu ${['settings','users','history'].includes(active)?'open':''}">${sub.map(item).join('')}</div></nav><footer class="sw-footer"><div class="sw-avatar">${esc(initials)}</div><div class="sw-profile"><span class="sw-name">${esc(name)}</span><span class="sw-school">${esc(school)}</span></div><button class="sw-logout" type="button" aria-label="Sign out"><svg viewBox="0 0 20 20"><path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8M11 6l4 4-4 4M15 10H7"/></svg></button></footer></div>`;
    document.body.prepend(host);
    const layout=document.createElement('style');
    layout.id='seatwise-navigation-layout';
    layout.textContent='body{padding-left:272px!important} .main{margin-left:0!important} @media(max-width:700px){body{padding-left:240px!important}.main{margin-left:0!important}}';
    document.head.appendChild(layout);
    host.querySelector('.sw-settings').addEventListener('click',()=>host.querySelector('.sw-submenu').classList.toggle('open'));
    host.querySelector('.sw-logout').addEventListener('click',()=>{if(typeof clearSeatwiseSession==='function')clearSeatwiseSession();location.replace('index.html')});
  }
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount,{once:true});
})();
