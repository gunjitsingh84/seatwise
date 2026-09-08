const SEATWISE_SUPABASE_URL = 'https://axhyzxuclxjojhtispqp.supabase.co';
const SEATWISE_SUPABASE_KEY = 'sb_publishable_6biluj5Hfmtz3tplDaO6qw_ektOIx3h';

const seatwiseDb = supabase.createClient(SEATWISE_SUPABASE_URL, SEATWISE_SUPABASE_KEY);
function setSeatwiseSession(user){sessionStorage.setItem('seatwiseUser',JSON.stringify({id:user.id,name:user.name,phone:user.phone}))}
function getSeatwiseSession(){try{const v=sessionStorage.getItem('seatwiseUser');return v?JSON.parse(v):null}catch(e){return null}}
function clearSeatwiseSession(){sessionStorage.removeItem('seatwiseUser');sessionStorage.removeItem('seatwiseAdmin')}
function requireSeatwiseLogin(){const user=getSeatwiseSession();if(!user){window.location.href='index.html';return null}return user}
async function logActivity(action,details={},userId=null){const user=getSeatwiseSession(),id=userId||user?.id||null;const{error}=await seatwiseDb.from('activity_logs').insert({user_id:id,action,details});if(error)console.error('Activity log error:',error)}
async function findAdminByPhone(phone){const normalizedPhone=phone.replace(/\D/g,'');return await seatwiseDb.from('admin_users').select('id,name,phone,pin,must_change_pin').eq('phone',normalizedPhone).maybeSingle()}
async function changeAdminPin(userId,newPin){return await seatwiseDb.from('admin_users').update({pin:newPin,must_change_pin:false}).eq('id',userId).select('id,name,phone,must_change_pin').single()}
function normalizePhone(value){return value.replace(/\D/g,'')}
function getCurrentAcademicSession(date=new Date()){const month=date.getMonth(),year=date.getFullYear(),startYear=month>=3?year:year-1;return `${startYear}-${startYear+1}`}
async function ensureCurrentAcademicSession(){const sessionName=getCurrentAcademicSession(),startYear=Number(sessionName.slice(0,4));const{error}=await seatwiseDb.from('academic_sessions').upsert({session_name:sessionName,start_date:`${startYear}-04-01`,end_date:`${startYear+1}-03-31`},{onConflict:'session_name'});if(error)console.error('Academic session error:',error);return sessionName}
async function initializeAcademicSessionUI(){const savedHead=document.querySelector('.saved-head');if(!savedHead)return;const sessionName=await ensureCurrentAcademicSession(),description=savedHead.querySelector('p');if(description)description.textContent=`Current Session: ${sessionName}`}
(function setupLoginPhoneKeypad(){function getInputs(){return Array.from(document.querySelectorAll('#loginPhoneDigits .phone-digit'))}function getValue(){return getInputs().map(i=>i.value).join('')}function addDigit(d){const inputs=getInputs(),i=inputs.findIndex(x=>!x.value);if(i===-1)return;inputs[i].value=d;if(i<inputs.length-1)inputs[i+1].focus();else document.querySelector('#pinContainer .pin-box')?.classList.add('ready')}function clear(){getInputs().forEach(i=>i.value='');getInputs()[0]?.focus()}document.addEventListener('click',e=>{const key=e.target.closest('.key[data-number]'),clr=e.target.closest('#clearButton');if(!key&&!clr)return;const phone=getValue();if(key&&phone.length<10){e.preventDefault();e.stopImmediatePropagation();addDigit(key.dataset.number)}else if(clr&&phone.length<10){e.preventDefault();e.stopImmediatePropagation();clear()}},true)})();
(function applySavedClassReferenceLayout(){if(!document.querySelector('.saved-grid'))return;const s=document.createElement('style');s.id='seatwise-saved-class-reference-layout';s.textContent='.saved-grid{display:block!important}.saved-grid .class-card{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));margin:0 0 18px!important;width:100%}.saved-grid .class-card:last-child{margin-bottom:0!important}.saved-grid .class-head{grid-column:1/-1;width:100%}.saved-grid .section-row{min-width:0;border-bottom:1px solid #eef1f5;border-right:1px solid #eef1f5}.saved-grid .section-row:nth-child(3n){border-right:0}@media(max-width:1100px){.saved-grid .class-card{grid-template-columns:repeat(2,minmax(0,1fr))}.saved-grid .section-row:nth-child(3n){border-right:1px solid #eef1f5}.saved-grid .section-row:nth-child(2n){border-right:0}}@media(max-width:650px){.saved-grid .class-card{grid-template-columns:1fr}.saved-grid .section-row,.saved-grid .section-row:nth-child(2n),.saved-grid .section-row:nth-child(3n){border-right:0}}';document.head.appendChild(s)})();
(function initializeGlobalSidebar(){function apply(){const nav=document.querySelector('.nav');if(!nav)return;const file=(window.location.pathname.split('/').pop()||'index.html').toLowerCase();const items=[['dashboard.html','▦','Dashboard'],['students.html','♙','Classes & Sections'],['rooms.html','⌂','Rooms'],['subjects.html','◈','Subjects'],['exam-planner.html','◫','Exam Planner'],['exams.html','▤','Exams'],['#','◧','Seating Plans'],['#','◷','History']];nav.innerHTML='<div class="nav-label">Main Menu</div>'+items.map(([href,icon,label])=>{const active=href!== '#'&&href===file?' class="active"':'';return `<a href="${href}"${active}><span class="nav-icon">${icon}</span>${label}</a>`}).join('')}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply()})();
document.addEventListener('DOMContentLoaded',initializeAcademicSessionUI);

/* SeatWise authentication v2: PIN-only login, six-digit PINs, unique phone/PIN, and mandatory PIN reset after recovery. */
(function seatwiseAuthV2(){
  if(!/index\.html?$/.test((window.location.pathname.split('/').pop()||'index.html').toLowerCase()) && window.location.pathname!=='/' ) return;
  const PIN_LENGTH=6, PHONE_LENGTH=10;
  let loginPin='';
  let signupPhone='';
  let forgotPhone='';

  function digits(value){return String(value||'').replace(/\D/g,'');}
  function showMessage(el,text,type='error'){if(!el)return;el.textContent=text;el.className=(el.className||'message').replace(/\s(show|error|success)/g,'')+' show '+type;}
  function clearMessage(el){if(el){el.textContent='';el.className=(el.className||'message').replace(/\s(show|error|success)/g,'')}}
  function renderPinBoxes(){
    const c=document.getElementById('pinContainer'); if(!c)return;
    c.innerHTML=''; for(let i=0;i<PIN_LENGTH;i++){const b=document.createElement('div');b.className='pin-box';const d=document.createElement('div');d.className='pin-dot';b.appendChild(d);c.appendChild(b)}
    c.querySelectorAll('.pin-box').forEach((b,i)=>{if(i<loginPin.length)b.classList.add('active')});
  }
  function buildPhoneInputs(id,count=PHONE_LENGTH){
    const c=document.getElementById(id);if(!c)return;
    c.innerHTML='';for(let i=0;i<count;i++){const input=document.createElement('input');input.className=id==='loginPhoneDigits'?'phone-digit':'modal-phone-digit';input.type='text';input.inputMode='numeric';input.maxLength=1;input.pattern='[0-9]';input.autocomplete='off';input.setAttribute('aria-label',`Phone digit ${i+1}`);c.appendChild(input)}
    c.querySelectorAll('input').forEach((input,i)=>{input.addEventListener('input',()=>{input.value=digits(input.value).slice(0,1);if(input.value)c.querySelectorAll('input')[i+1]?.focus();updatePhoneState(id)});input.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!input.value)c.querySelectorAll('input')[i-1]?.focus()});input.addEventListener('paste',e=>{e.preventDefault();const v=digits(e.clipboardData.getData('text')).slice(0,count);c.querySelectorAll('input').forEach((x,j)=>x.value=v[j]||'');c.querySelectorAll('input')[Math.min(v.length,count)-1]?.focus();updatePhoneState(id)})});
  }
  function phoneValue(id){return Array.from(document.querySelectorAll(`#${id} input`)).map(x=>x.value).join('')}
  function updatePhoneState(id){const v=phoneValue(id);if(id==='loginPhoneDigits')window.__seatwiseLoginPhone=v;if(id==='signupPhoneDigits')signupPhone=v;if(id==='forgotPhoneDigits')forgotPhone=v}
  function makeSixDigitInput(id){const el=document.getElementById(id);if(!el)return;el.maxLength=PIN_LENGTH;el.minLength=PIN_LENGTH;el.pattern='[0-9]{6}';el.inputMode='numeric';el.addEventListener('input',()=>{el.value=digits(el.value).slice(0,PIN_LENGTH)});}

  async function login(){
    const pin=loginPin;
    const message=document.getElementById('message');clearMessage(message);
    if(pin.length!==PIN_LENGTH){showMessage(message,'Please enter your 6-digit PIN.');return}
    const {data,error}=await seatwiseDb.from('admin_users').select('id,name,phone,pin,must_change_pin').eq('pin',pin).maybeSingle();
    if(error){console.error(error);showMessage(message,'Unable to connect to the login service. Please try again.');return}
    if(!data){showMessage(message,'Incorrect PIN. Please try again.');document.getElementById('pinContainer')?.classList.add('shake');setTimeout(()=>document.getElementById('pinContainer')?.classList.remove('shake'),400);return}
    if(data.must_change_pin){openForcedChangeModal(data);return}
    setSeatwiseSession(data);await logActivity('login',{method:'pin'});window.location.href='dashboard.html';
  }
  function openForcedChangeModal(user){
    const modal=document.getElementById('forgotModal');if(!modal)return;
    const box=modal.querySelector('.modal-box');if(!box)return;
    box.innerHTML=`<div class="modal-head"><h2>Change PIN</h2><button class="close" type="button" id="forcedClose">×</button></div><form id="forcedPinForm"><div class="modal-body"><p>Your PIN must be changed before you can continue.</p><div class="field"><label for="forcedPin">New 6-Digit PIN</label><input class="text-input pin-small" id="forcedPin" type="password" inputmode="numeric" maxlength="6" minlength="6" pattern="[0-9]{6}" autocomplete="new-password" required placeholder="••••••"></div><div class="field"><label for="forcedPinConfirm">Confirm New PIN</label><input class="text-input pin-small" id="forcedPinConfirm" type="password" inputmode="numeric" maxlength="6" minlength="6" pattern="[0-9]{6}" autocomplete="new-password" required placeholder="••••••"></div><div class="modal-message" id="forcedMessage"></div></div><div class="modal-footer"><button type="button" class="btn btn-cancel" id="forcedCancel">Cancel</button><button type="submit" class="btn btn-primary">Change PIN</button></div></form>`;
    modal.classList.add('show');
    document.getElementById('forcedClose').onclick=()=>modal.classList.remove('show');document.getElementById('forcedCancel').onclick=()=>modal.classList.remove('show');
    ['forcedPin','forcedPinConfirm'].forEach(makeSixDigitInput);
    document.getElementById('forcedPinForm').onsubmit=async e=>{e.preventDefault();const a=digits(document.getElementById('forcedPin').value),b=digits(document.getElementById('forcedPinConfirm').value),m=document.getElementById('forcedMessage');if(a.length!==6||a!==b){showMessage(m,'Please enter matching 6-digit PINs.');return}const r=await changeAdminPin(user.id,a);if(r.error){showMessage(m,r.error.code==='23505'?'That PIN is already in use. Please choose another PIN.':'Unable to change PIN. Please try again.');return}await logActivity('pin_changed',{reason:'mandatory_login_change'},user.id);setSeatwiseSession({...user,must_change_pin:false});modal.classList.remove('show');window.location.href='dashboard.html'};
  }
  async function signup(e){
    e.preventDefault();const m=document.getElementById('signupMessage');clearMessage(m);const name=document.getElementById('signupName')?.value.trim(),pin=digits(document.getElementById('signupPin')?.value),confirm=digits(document.getElementById('signupPinConfirm')?.value),phone=signupPhone||phoneValue('signupPhoneDigits');
    if(!name){showMessage(m,'Please enter your name.');return}if(phone.length!==10){showMessage(m,'Please enter a valid 10-digit phone number.');return}if(pin.length!==6||confirm.length!==6){showMessage(m,'PIN must be exactly 6 digits.');return}if(pin!==confirm){showMessage(m,'PIN and confirmation PIN do not match.');return}
    const btn=document.getElementById('signupButton');if(btn)btn.disabled=true;const {data,error}=await seatwiseDb.from('admin_users').insert({name,phone,pin,must_change_pin:false}).select('id,name,phone,must_change_pin').single();if(btn)btn.disabled=false;
    if(error){console.error(error);showMessage(m,error.code==='23505'?(String(error.message).toLowerCase().includes('phone')?'This phone number is already registered.':'This PIN is already in use. Please choose another PIN.'):'Unable to create the account. Please try again.');return}
    await logActivity('account_created',{method:'signup'},data.id);showMessage(m,'Account created successfully. You can now log in with your 6-digit PIN.','success');setTimeout(()=>{document.getElementById('signupModal')?.classList.remove('show')},900);
  }
  async function retrievePin(){
    const m=document.getElementById('forgotModal')?.querySelector('#forgotMessage')||document.getElementById('modalMessage');const phone=forgotPhone||phoneValue('forgotPhoneDigits');if(phone.length!==10){showMessage(m,'Please enter your 10-digit phone number.');return}
    const {data,error}=await findAdminByPhone(phone);if(error||!data){showMessage(m,'No administrator account was found for this phone number.');return}
    const box=document.getElementById('forgotModal')?.querySelector('.modal-box');if(!box)return;
    box.innerHTML=`<div class="modal-head"><h2>Set New PIN</h2><button class="close" type="button" id="resetClose">×</button></div><form id="resetPinForm"><div class="modal-body"><p>Account found for <strong>${String(data.name).replace(/[<>]/g,'')}</strong>. Create a new 6-digit PIN to continue.</p><div class="field"><label for="resetPin">New 6-Digit PIN</label><input class="text-input pin-small" id="resetPin" type="password" inputmode="numeric" maxlength="6" minlength="6" pattern="[0-9]{6}" required placeholder="••••••"></div><div class="field"><label for="resetPinConfirm">Confirm New PIN</label><input class="text-input pin-small" id="resetPinConfirm" type="password" inputmode="numeric" maxlength="6" minlength="6" pattern="[0-9]{6}" required placeholder="••••••"></div><div class="modal-message" id="resetMessage"></div></div><div class="modal-footer"><button type="button" class="btn btn-cancel" id="resetCancel">Cancel</button><button type="submit" class="btn btn-primary">Save New PIN</button></div></form>`;
    document.getElementById('resetClose').onclick=()=>document.getElementById('forgotModal').classList.remove('show');document.getElementById('resetCancel').onclick=()=>document.getElementById('forgotModal').classList.remove('show');['resetPin','resetPinConfirm'].forEach(makeSixDigitInput);
    document.getElementById('resetPinForm').onsubmit=async e=>{e.preventDefault();const a=digits(document.getElementById('resetPin').value),b=digits(document.getElementById('resetPinConfirm').value),rm=document.getElementById('resetMessage');if(a.length!==6||a!==b){showMessage(rm,'Please enter matching 6-digit PINs.');return}const r=await changeAdminPin(data.id,a);if(r.error){showMessage(rm,r.error.code==='23505'?'That PIN is already in use. Please choose another PIN.':'Unable to update PIN. Please try again.');return}await logActivity('pin_changed',{reason:'forgot_pin',phone},data.id);showMessage(rm,'PIN changed successfully. You can now log in.','success');setTimeout(()=>document.getElementById('forgotModal').classList.remove('show'),800)};
  }

  function initialize(){
    const loginPhone=document.querySelector('.phone-wrap');if(loginPhone)loginPhone.style.display='none';
    const heading=document.querySelector('.login-heading p');if(heading)heading.textContent='Enter your 6-digit PIN to continue';
    renderPinBoxes();buildPhoneInputs('signupPhoneDigits');buildPhoneInputs('forgotPhoneDigits');makeSixDigitInput('signupPin');makeSixDigitInput('signupPinConfirm');
    const loginKeys=document.querySelectorAll('.key[data-number]');loginKeys.forEach(k=>k.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(loginPin.length<PIN_LENGTH){loginPin+=k.dataset.number;renderPinBoxes()}},true));
    const clear=document.getElementById('clearButton');if(clear)clear.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();loginPin='';renderPinBoxes()},true);
    const enter=document.getElementById('loginButton');if(enter)enter.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();login()},true);
    document.addEventListener('keydown',e=>{if(e.key>='0'&&e.key<='9'&&loginPin.length<PIN_LENGTH){loginPin+=e.key;renderPinBoxes()}else if(e.key==='Backspace'){loginPin=loginPin.slice(0,-1);renderPinBoxes()}else if(e.key==='Enter')login()});
    document.getElementById('signupForm')?.addEventListener('submit',signup,true);
    document.getElementById('retrievePinButton')?.addEventListener('click',retrievePin,true);
    const forgotForm=document.getElementById('forgotForm');if(forgotForm)forgotForm.addEventListener('submit',e=>{e.preventDefault();retrievePin()},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();
