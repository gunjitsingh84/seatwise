(() => {
  class SeatWiseNavigation extends HTMLElement {
    constructor(){
      super();
      this.attachShadow({mode:'open'});
      this.active='dashboard';
      this.settingsOpen=false;
    }

    connectedCallback(){ this.render(); }

    icon(name){
      const paths={
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
      return `<svg viewBox="0 0 18 18" aria-hidden="true">${paths[name]||paths.dashboard}</svg>`;
    }

    render(){
      const main=[
        ['dashboard','Dashboard','dashboard'],
        ['classes','Classes & Sections','classes'],
        ['rooms','Rooms','rooms'],
        ['subjects','Subjects','subjects'],
        ['planner','Exam Planner','planner'],
        ['exams','Exams','exams']
      ];
      const sub=[['users','User Management','users'],['history','History','history']];
      this.shadowRoot.innerHTML=`
        <style>
          :host{position:fixed;inset:0 auto 0 0;width:272px;height:100dvh;display:block;z-index:1000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;contain:layout style paint}
          *{box-sizing:border-box}
          .sidebar{width:272px;height:100%;display:grid;grid-template-rows:88px minmax(0,1fr) 84px;overflow:hidden;background:linear-gradient(180deg,#2365c4 0%,#174e9f 100%)}
          .brand{height:88px;padding:0 25px;display:flex;align-items:center;gap:13px;border-bottom:1px solid rgba(255,255,255,.14)}
          .brand-mark{width:46px;height:46px;border:1px solid rgba(255,255,255,.35);border-radius:13px;display:grid;place-items:center;font-size:22px;line-height:1;flex:0 0 46px}
          .brand-name{font-size:28px;font-weight:800;letter-spacing:-.8px;line-height:1}.brand-name span{color:#dceaff}
          nav{min-height:0;overflow-y:auto;overflow-x:hidden;padding:28px 14px 20px;scrollbar-width:none;overscroll-behavior:contain}nav::-webkit-scrollbar{display:none}
          .section-title{height:18px;margin:0 13px 13px;color:rgba(255,255,255,.57);font-size:10px;line-height:18px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase}
          .item,.settings{width:100%;height:48px;min-height:48px;margin:0 0 5px;padding:0 14px;border:0;border-radius:11px;display:flex;align-items:center;gap:13px;background:transparent;color:rgba(255,255,255,.94);text-decoration:none;font-size:15px;font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;appearance:none;outline:none}
          .item:hover,.settings:hover{background:rgba(255,255,255,.08)}.item.active{background:#fff;color:#1f5fbf;font-weight:750}
          .icon{width:21px;height:21px;flex:0 0 21px;display:grid;place-items:center}.icon svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
          .settings .chevron{margin-left:auto;width:18px;height:18px;display:grid;place-items:center;font-size:14px}.settings.open .chevron{transform:rotate(180deg)}
          .submenu{display:none;padding:0 0 5px}.submenu.open{display:block}.submenu .item{height:43px;min-height:43px;padding-left:48px;margin-bottom:3px;font-size:14px}.submenu .icon{width:18px;flex-basis:18px}.submenu .icon svg{width:15px;height:15px}
          footer{height:84px;min-height:84px;padding:0 18px;display:flex;align-items:center;gap:11px;border-top:1px solid rgba(255,255,255,.14);background:rgba(8,48,112,.14)}
          .avatar{width:42px;height:42px;min-width:42px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#2365c4;font-size:13px;font-weight:850}.profile{min-width:0;flex:1}.name,.school{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.name{font-size:14px;font-weight:750;line-height:20px}.school{margin-top:2px;color:rgba(255,255,255,.66);font-size:11px;line-height:17px}
          .logout{width:34px;height:34px;min-width:34px;padding:0;border:0;border-radius:8px;background:transparent;color:#fff;display:grid;place-items:center;cursor:pointer}.logout svg{width:20px;height:20px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.logout:hover{background:rgba(255,255,255,.08)}
          @media(max-width:700px){:host{position:absolute;width:100%;height:100dvh}.sidebar{width:272px}}
        </style>
        <aside class="sidebar">
          <div class="brand"><div class="brand-mark">▦</div><div class="brand-name">Seat<span>Wise</span></div></div>
          <nav><div class="section-title">Main Menu</div>
            ${main.map(x=>this.item(x[0],x[1],x[2],false)).join('')}
            <button class="settings ${this.settingsOpen?'open':''}" type="button" aria-expanded="${this.settingsOpen}"><span class="icon">${this.icon('settings')}</span><span>Settings</span><span class="chevron">⌄</span></button>
            <div class="submenu ${this.settingsOpen?'open':''}">${sub.map(x=>this.item(x[0],x[1],x[2],true)).join('')}</div>
          </nav>
          <footer><div class="avatar">GS</div><div class="profile"><span class="name">Gunjit Singh</span><span class="school">Chitkara</span></div><button class="logout" aria-label="Sign out"><svg viewBox="0 0 20 20"><path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8M11 6l4 4-4 4M15 10H7"/></svg></button></footer>
        </aside>`;
      this.bind();
    }

    item(key,label,icon,sub){
      return `<a href="#${key}" class="item ${this.active===key?'active':''}" data-key="${key}" data-sub="${sub?'1':'0'}"><span class="icon">${this.icon(icon)}</span><span>${label}</span></a>`;
    }

    bind(){
      const root=this.shadowRoot;
      root.querySelector('.settings').addEventListener('click',()=>{this.settingsOpen=!this.settingsOpen;this.render()});
      root.querySelectorAll('.item').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();this.active=a.dataset.key;if(a.dataset.sub==='1')this.settingsOpen=true;this.render();this.dispatchEvent(new CustomEvent('seatwise:navigate',{bubbles:true,composed:true,detail:{key:this.active}}))}));
      root.querySelector('.logout').addEventListener('click',()=>this.dispatchEvent(new CustomEvent('seatwise:logout',{bubbles:true,composed:true})));
    }
  }
  customElements.define('seatwise-navigation',SeatWiseNavigation);
})();
