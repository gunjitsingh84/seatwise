/* SeatWise Navigation - shared, fixed, page-independent navigation component. */
(function(){
  if(window.__seatwiseNavComponent)return;
  window.__seatwiseNavComponent=true;
  if(customElements.get('seatwise-navigation')) return;

  class SeatWiseNavigation extends HTMLElement{
    constructor(){super();this.attachShadow({mode:'open'});this.active=this.dataset.active||this.currentKey();this.settingsOpen=false;}
    currentKey(){
      const f=(location.pathname.split('/').pop()||'dashboard.html').toLowerCase();
      return ({'dashboard.html':'dashboard','dashboard-school.html':'dashboard','students.html':'classes','rooms.html':'rooms','subjects.html':'subjects','exam-planner.html':'planner','exams.html':'exams','settings.html':'settings','user-management.html':'users','history.html':'history'})[f]||'dashboard';
    }
    connectedCallback(){
      document.querySelectorAll('.sidebar').forEach(el=>el.style.setProperty('display','none','important'));
      this.active=this.dataset.active||this.currentKey();
      this.settingsOpen=['settings','users','history'].includes(this.active);
      this.render();
    }
    icon(name){
      const p={
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
      return `<svg viewBox="0 0 18 18" aria-hidden="true">${p[name]||p.dashboard}</svg>`;
    }
    render(){
      const main=[['dashboard','Dashboard','dashboard.html'],['classes','Classes & Sections','students.html'],['rooms','Rooms','rooms.html'],['subjects','Subjects','subjects.html'],['planner','Exam Planner','exam-planner.html'],['exams','Exams','exams.html']];
      const sub=[['users','User Management','user-management.html'],['history','History','history.html']];
      const u=window.getSeatwiseSession?.()||{};
      const name=(u.name||'Administrator').trim(),school=u.school_name||'School Admin';
      const parts=name.split(/\s+/).filter(Boolean);
      const initials=(parts.length>1?parts[0][0]+parts[parts.length-1][0]:(parts[0]?.[0]||'A')).toUpperCase();
      this.shadowRoot.innerHTML=`<style>
        :host{all:initial;position:fixed;left:0;top:0;width:272px;height:100vh;height:100dvh;z-index:2147483000;display:block;contain:strict;font-family:Inter,Arial,sans-serif;color:#fff}
        *{box-sizing:border-box}.sidebar{width:272px;height:100%;display:grid;grid-template-rows:88px minmax(0,1fr) 84px;overflow:hidden;background:linear-gradient(180deg,#2365c4 0%,#174e9f 100%)}
        .brand{height:88px;padding:0 25px;display:flex;align-items:center;gap:13px;border-bottom:1px solid rgba(255,255,255,.14)}.brand-mark{width:46px;height:46px;border:1px solid rgba(255,255,255,.35);border-radius:13px;display:grid;place-items:center;font-size:22px;line-height:1;flex:0 0 46px}.brand-name{font-size:28px;font-weight:800;letter-spacing:-.8px;line-height:1}.brand-name span{color:#dceaff}
        nav{min-height:0;overflow-y:auto;overflow-x:hidden;padding:28px 14px 20px;scrollbar-width:none;overscroll-behavior:contain}nav::-webkit-scrollbar{display:none}
        .item,.settings{width:100%;height:48px;min-height:48px;margin:0 0 5px;padding:0 14px;border:0;border-radius:11px;display:flex;align-items:center;gap:13px;background:transparent;color:rgba(255,255,255,.94);text-decoration:none;font-size:15px;font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;appearance:none;outline:none}.item:hover,.settings:hover{background:rgba(255,255,255,.08)}.item.active{background:#fff;color:#1f5fbf;font-weight:750}.icon{width:21px;height:21px;flex:0 0 21px;display:grid;place-items:center}.icon svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}.settings .chevron{margin-left:auto;width:18px;height:18px;display:grid;place-items:center;font-size:14px}.settings.open .chevron{transform:rotate(180deg)}
        .submenu{display:none;padding:0 0 5px}.submenu.open{display:block}.submenu .item{height:43px;min-height:43px;padding-left:48px;margin-bottom:3px;font-size:14px}.submenu .icon{width:18px;flex-basis:18px}.submenu .icon svg{width:15px;height:15px}
        footer{height:84px;min-height:84px;padding:0 18px;display:flex;align-items:center;gap:11px;border-top:1px solid rgba(255,255,255,.14);background:rgba(8,48,112,.14)}.avatar{width:42px;height:42px;min-width:42px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#2365c4;font-size:13px;font-weight:850}.profile{min-width:0;flex:1}.name,.school{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.name{font-size:14px;font-weight:750;line-height:20px}.school{margin-top:2px;color:rgba(255,255,255,.66);font-size:11px;line-height:17px}.logout{width:34px;height:34px;min-width:34px;padding:0;border:0;border-radius:8px;background:transparent;color:#fff;display:grid;place-items:center;cursor:pointer}.logout svg{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.logout:hover{background:rgba(255,255,255,.08)}
      </style><aside class="sidebar"><div class="brand"><div class="brand-mark">▦</div><div class="brand-name">Seat<span>Wise</span></div></div><nav>${main.map(x=>this.item(x[0],x[1],x[2])).join('')}<button class="settings ${this.settingsOpen?'open':''}" type="button" aria-expanded="${this.settingsOpen}"><span class="icon">${this.icon('settings')}</span><span>Settings</span><span class="chevron">⌄</span></button><div class="submenu ${this.settingsOpen?'open':''}">${sub.map(x=>this.item(x[0],x[1],x[2],true)).join('')}</div></nav><footer><div class="avatar">${initials}</div><div class="profile"><span class="name">${this.esc(name)}</span><span class="school">${this.esc(school)}</span></div><button class="logout" aria-label="Sign out"><svg viewBox="0 0 20 20"><path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8M11 6l4 4-4 4M15 10H7"/></svg></button></footer></aside>`;
      this.bind();
    }
    esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    item(key,label,href){return `<a href="${href}" class="item ${this.active===key?'active':''}" data-key="${key}"><span class="icon">${this.icon(key)}</span><span>${label}</span></a>`}
    bind(){
      const r=this.shadowRoot;
      r.querySelector('.settings').addEventListener('click',()=>{this.settingsOpen=!this.settingsOpen;this.render()});
      r.querySelectorAll('.item').forEach(a=>a.addEventListener('click',()=>{this.active=a.dataset.key;}));
      r.querySelector('.logout').addEventListener('click',()=>{if(typeof clearSeatwiseSession==='function')clearSeatwiseSession();location.replace('index.html')});
    }
  }
  customElements.define('seatwise-navigation',SeatWiseNavigation);
  function mount(){
    if((location.pathname.split('/').pop()||'index.html').toLowerCase()==='index.html')return;
    document.querySelectorAll('.sidebar').forEach(el=>el.style.setProperty('display','none','important'));
    if(!document.querySelector('seatwise-navigation')){
      const n=document.createElement('seatwise-navigation');
      document.body.prepend(n);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
