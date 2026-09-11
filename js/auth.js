const SEATWISE_SUPABASE_URL='https://axhyzxuclxjojhtispqp.supabase.co';
const SEATWISE_SUPABASE_KEY='sb_publishable_6biluj5Hfmtz3tplDaO6qw_ektOIx3h';
const seatwiseDb=supabase.createClient(SEATWISE_SUPABASE_URL,SEATWISE_SUPABASE_KEY);
function setSeatwiseSession(user){sessionStorage.setItem('seatwiseUser',JSON.stringify({id:user.id,name:user.name,phone:user.phone,school_id:user.school_id||null,school_name:user.school_name||null,school_logo_url:user.school_logo_url||null}))}
function getSeatwiseSession(){try{return JSON.parse(sessionStorage.getItem('seatwiseUser')||'null')}catch(e){return null}}
function clearSeatwiseSession(){sessionStorage.removeItem('seatwiseUser');sessionStorage.removeItem('seatwiseAdmin')}
function requireSeatwiseLogin(){const u=getSeatwiseSession();if(!u){location.href='index.html';return null}return u}
async function logActivity(action,details={},userId=null){const u=getSeatwiseSession(),id=userId||u?.id||null;const{error}=await seatwiseDb.from('activity_logs').insert({user_id:id,action,details});if(error)console.error('Activity log error:',error)}
async function findAdminByPhone(phone){return seatwiseDb.from('admin_users').select('id,name,phone,school_id').eq('phone',String(phone).replace(/\D/g,'')).maybeSingle()}
function getCurrentAcademicSession(date=new Date()){const y=date.getFullYear(),m=date.getMonth(),s=m>=3?y:y-1;return `${s}-${s+1}`}
async function ensureCurrentAcademicSession(){const n=getCurrentAcademicSession(),y=+n.slice(0,4);const{error}=await seatwiseDb.from('academic_sessions').upsert({session_name:n,start_date:`${y}-04-01`,end_date:`${y+1}-03-31`},{onConflict:'session_name'});if(error)console.error('Academic session error:',error);return n}
async function initializeAcademicSessionUI(){const h=document.querySelector('.saved-head');if(!h)return;const d=h.querySelector('p');if(d)d.textContent=`Current Session: ${await ensureCurrentAcademicSession()}`}
(function(){function apply(){const nav=document.querySelector('.nav');if(!nav)return;const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();const items=[['dashboard.html','▦','Dashboard'],['students.html','♙','Classes & Sections'],['rooms.html','⌂','Rooms'],['subjects.html','◈','Subjects'],['exam-planner.html','◫','Exam Planner'],['exams.html','▤','Exams'],['#','◷','History']];nav.innerHTML='<div class="nav-label">Main Menu</div>'+items.map(x=>`<a href="${x[0]}"${x[0]!=='#'&&x[0]===file?' class="active"':''}><span class="nav-icon">${x[1]}</span>${x[2]}</a>`).join('')}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply):apply()})();
(function(){if(!document.querySelector('.saved-grid'))return;const s=document.createElement('style');s.textContent='.saved-grid{display:block!important}.saved-grid .class-card{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 0 18px!important;width:100%}.saved-grid .class-head{grid-column:1/-1;width:100%}.saved-grid .section-row{min-width:0;border-bottom:1px solid #eef1f5;border-right:1px solid #eef1f5}.saved-grid .section-row:nth-child(3n){border-right:0}@media(max-width:1100px){.saved-grid .class-card{grid-template-columns:repeat(2,minmax(0,1fr))}.saved-grid .section-row:nth-child(3n){border-right:1px solid #eef1f5}.saved-grid .section-row:nth-child(2n){border-right:0}}@media(max-width:650px){.saved-grid .class-card{grid-template-columns:1fr}.saved-grid .section-row{border-right:0}}';document.head.appendChild(s)})();
document.addEventListener('DOMContentLoaded',initializeAcademicSessionUI);

document.addEventListener('submit',async function(e){
  const form=e.target;
  if(!form||form.id!=='signupForm')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const schoolName=(document.getElementById('signupSchoolName')?.value||'').trim();
  const adminName=(document.getElementById('signupName')?.value||'').trim();
  const phone=typeof getPhone==='function'?getPhone('signupPhoneDigits'):Array.from(document.querySelectorAll('#signupPhoneDigits input')).map(i=>i.value).join('');
  const msg=document.getElementById('signupMessage');
  const btn=document.getElementById('signupButton');
  const show=(text,type='error')=>{if(msg){msg.textContent=text;msg.className='modal-message show '+type;}};
  if(!schoolName){show('Please enter the school name.');return;}
  if(!adminName){show('Please enter the administrator name.');return;}
  if(!/^\d{10}$/.test(phone)){show('Please enter a valid 10-digit phone number.');return;}
  try{
    if(btn){btn.disabled=true;btn.textContent='Creating...';}
    const existing=await seatwiseDb.from('admin_users').select('id').eq('phone',phone).maybeSingle();
    if(existing.error)throw existing.error;
    if(existing.data){show('This phone number is already registered. Please use another number.');return;}
    const schoolId=crypto.randomUUID();
    let schoolLogo=null;
    if(typeof readLogoFile==='function')schoolLogo=await readLogoFile();
    const schoolPayload={id:schoolId,school_name:schoolName,school_logo_url:schoolLogo};
    const schoolResult=await seatwiseDb.from('schools').insert(schoolPayload);
    if(schoolResult.error)throw schoolResult.error;
    const adminResult=await seatwiseDb.from('admin_users').insert({name:adminName,phone,school_id:schoolId});
    if(adminResult.error)throw adminResult.error;
    setSeatwiseSession({id:null,name:adminName,phone,school_id:schoolId,school_name:schoolName,school_logo_url:schoolLogo});
    show('Account created successfully. Opening SeatWise...','success');
    setTimeout(()=>{location.href='dashboard.html'},500);
  }catch(err){
    console.error('School signup error:',err);
    show(err?.message||'Unable to create the school account. Please try again.');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Create Account';}
  }
},true);

async function securePhoneLogin(){
  const phone=typeof getPhone==='function'?getPhone('loginPhoneDigits'):'';
  if(phone.length!==10){alert('Please enter the complete 10-digit phone number.');return}
  const btn=document.getElementById('loginButton');
  if(btn)btn.disabled=true;
  try{
    const {data,error}=await seatwiseDb.rpc('login_admin_by_phone',{p_phone:phone});
    if(error){console.error('Phone login RPC error:',error);alert('Unable to connect to the account database. Please try again.');return}
    const user=Array.isArray(data)?data[0]:data;
    if(!user){alert('No administrator account was found for this phone number.');document.getElementById('loginPhoneDigits')?.classList.add('shake');setTimeout(()=>document.getElementById('loginPhoneDigits')?.classList.remove('shake'),350);return}
    if(user.is_active===false){alert('This school account is inactive. Please contact the administrator.');return}
    if(!user.school_id){alert('This administrator is not associated with a school. Please contact the administrator.');return}
    setSeatwiseSession({id:user.id,name:user.name,phone:user.phone,school_id:user.school_id,school_name:user.school_name,school_logo_url:user.school_logo_url});
    sessionStorage.setItem('seatwiseAdmin','authenticated');
    await logActivity('LOGIN_SUCCESS',{method:'phone'},user.id);
    window.location.href='dashboard.html';
  }catch(err){
    console.error('Phone login error:',err);
    alert(err?.message||'Unable to log in. Please try again.');
  }finally{
    if(btn)btn.disabled=false;
  }
}

document.addEventListener('click',function(e){
  if(e.target?.closest?.('#loginButton')){
    e.preventDefault();
    e.stopImmediatePropagation();
    securePhoneLogin();
  }
},true);
document.addEventListener('keydown',function(e){
  if(e.key==='Enter' && !e.target.matches?.('input,textarea') && !document.getElementById('signupModal')?.classList.contains('show')){
    e.preventDefault();
    e.stopImmediatePropagation();
    securePhoneLogin();
  }
},true);

// Import Data tabs: honor ?type=rooms|subjects and ensure the tabs remain clickable.
document.addEventListener('DOMContentLoaded',function(){
  if(!location.pathname.toLowerCase().endsWith('import-data.html'))return;
  const valid=['classes','rooms','subjects'];
  const requested=new URLSearchParams(location.search).get('type');
  const requestedType=valid.includes(requested)?requested:'classes';
  const tabs=document.querySelectorAll('.tab[data-type]');
  tabs.forEach(tab=>{
    tab.disabled=false;
    tab.removeAttribute('disabled');
    tab.style.pointerEvents='auto';
    tab.style.cursor='pointer';
  });
  if(typeof window.setType==='function')window.setType(requestedType);
  tabs.forEach(tab=>tab.addEventListener('click',function(){
    const next=tab.dataset.type;
    if(valid.includes(next))history.replaceState(null,'',`import-data.html?type=${encodeURIComponent(next)}`);
  },true));
});
