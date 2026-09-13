/* SeatWise Navigation v3 - isolated, fixed, page-independent sidebar */
(function(){
  if(window.__seatwiseNavV3)return;
  window.__seatwiseNavV3=true;
  const items=[
    ['dashboard.html','▦','Dashboard'],
    ['students.html','♙','Classes & Sections'],
    ['rooms.html','⌂','Rooms'],
    ['subjects.html','◈','Subjects'],
    ['exam-planner.html','▣','Exam Planner'],
    ['exams.html','▤','Exams']
  ];
  const settings=[
    ['user-management.html','♙','User Management'],
    ['history.html','◷','History']
  ];
  const file=()=>((location.pathname.split('/').pop()||'index.html').toLowerCase());
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    if(!document.body||document.getElementById('seatwise-nav-v3'))return;
    document.querySelectorAll('.sidebar').forEach(el=>el.style.setProperty('display','none','important'));
    const host=document.createElement('div');host.id='seatwise-nav-v3';
    const root=host.attachShadow({mode:'open'});document.body.prepend(host);
    const u=typeof getSeatwiseSession==='function'?getSeatwiseSession():null;
    const name=u?.name||'Administrator',school=u?.school_name||'School Admin';
    const p=name.trim().split(/\s+/).filter(Boolean),initials=(p.length>1?p[0][0]+p[p.length-1][0]:(p[0]?.[0]||'A')).toUpperCase();
    const current=file(),settingsOpen=current==='settings.html'||settings.some(x=>x[0]===current);
    root.innerHTML=`<style>
      :host{all:initial;position:fixed;left:0;top:0;width:270px;height:100vh;height:100dvh;z-index:2147483000;display:block;contain:strict;font-family:Inter,Arial,sans-serif}
      *{box-sizing:border-box}
      aside{width:270px;height:100%;display:grid;grid-template-rows:92px minmax(0,1fr) 84px;overflow:hidden;color:#fff;background:linear-gradient(180deg,#1f5fbf,#174c9e)}
      .brand{height:92px;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid rgba(255,255,255,.14)}
      .mark{width:44px;height:44px;flex:0 0 44px;border:1px solid rgba(255,255,255,.38);border-radius:12px;display:grid;place-items:center;font-size:21px}.logo{font-size:27px;line-height:1;font-weight:800;letter-spacing:-.6px}.logo span{color:#dceaff}
      nav{min-height:0;overflow-y:auto;overflow-x:hidden;padding:25px 14px 18px;scrollbar-width:none;overscroll-behavior:contain}nav::-webkit-scrollbar{display:none}
      .label{height:18px;margin:0 13px 12px;font-size:10px;font-weight:700;line-height:18px;letter-spacing:1.1px;text-transform:uppercase;color:rgba(255,255,255,.56)}
      a,button{font-family:inherit}.item,.settings{width:100%;height:48px;min-height:48px;margin:0 0 5px;padding:0 14px;border:0;border-radius:10px;display:flex;align-items:center;gap:13px;background:transparent;color:rgba(255,255,255,.9);text-decoration:none;font-size:15px;font-weight:400;line-height:1;white-space:nowrap;cursor:pointer}
      .item:hover,.settings:hover{background:rgba(255,255,255,.09)}.item.active{background:#fff;color:#1f5fbf;font-weight:700}
      .icon{width:22px;height:22px;flex:0 0 22px;display:grid;place-items:center;font-size:17px}.settings .arrow{margin-left:auto;font-size:14px}.settings.open .arrow{transform:rotate(180deg)}
      .submenu{display:none;padding:1px 0 6px}.submenu.open{display:block}.submenu .item{height:42px;min-height:42px;padding-left:49px;margin-bottom:3px;font-size:14px}.submenu .icon{width:18px;flex-basis:18px;font-size:15px}
      footer{height:84px;min-height:84px;display:flex;align-items:center;gap:11px;padding:0 18px;border-top:1px solid rgba(255,255,255,.14);background:rgba(12,57,125,.16)}
      .avatar{width:42px;height:42px;min-width:42px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#1f5fbf;font-size:13px;font-weight:800}.profile{min-width:0;flex:1}.name,.school{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.name{font-size:14px;font-weight:700;line-height:20px}.school{margin-top:2px;color:rgba(255,255,255,.66);font-size:11px;line-height:17px}.logout{width:34px;height:34px;min-width:34px;padding:0;border:0;border-radius:8px;background:transparent;color:#fff;font-size:20px;cursor:pointer}.logout:hover{background:rgba(255,255,255,.1)}
    </style>
    <aside>
      <div class="brand"><div class="mark">▦</div><div class="logo">Seat<span>Wise</span></div></div>
      <nav><div class="label">Main Menu</div>
        ${items.map(x=>`<a class="item ${x[0]===current?'active':''}" href="${x[0]}"><span class="icon">${x[1]}</span><span>${x[2]}</span></a>`).join('')}
        <div><button class="settings ${settingsOpen?'open':''}" type="button" aria-expanded="${settingsOpen}"><span class="icon">⚙</span><span>Settings</span><span class="arrow">⌄</span></button>
          <div class="submenu ${settingsOpen?'open':''}">${settings.map(x=>`<a class="item ${x[0]===current?'active':''}" href="${x[0]}"><span class="icon">${x[1]}</span><span>${x[2]}</span></a>`).join('')}</div>
        </div>
      </nav>
      <footer><div class="avatar">${initials}</div><div class="profile"><span class="name">${esc(name)}</span><span class="school">${esc(school)}</span></div><button class="logout" type="button" aria-label="Sign out">↪</button></footer>
    </aside>`;
    const sb=root.querySelector('.settings'),sub=root.querySelector('.submenu');
    sb.addEventListener('click',()=>{const open=!sub.classList.contains('open');sub.classList.toggle('open',open);sb.classList.toggle('open',open);sb.setAttribute('aria-expanded',String(open))});
    root.querySelector('.logout').addEventListener('click',()=>{if(typeof clearSeatwiseSession==='function')clearSeatwiseSession();location.replace('index.html')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
