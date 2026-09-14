/* SeatWise authentication + session utilities. */
const SUPABASE_URL='https://vupjynmbeqjvukqfksup.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cGp5bm1iZXFqdnVrY3N1cCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjIwMjAwMDAwMDB9.placeholder';
const seatwiseDb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const SEATWISE_SESSION_KEY='seatwise_session';
const SEATWISE_SESSION_TIMEOUT=30*60*1000;
function setSeatwiseSession(user){const payload={...user,last_activity:Date.now()};sessionStorage.setItem(SEATWISE_SESSION_KEY,JSON.stringify(payload));return payload}
function getSeatwiseSession(){try{const raw=sessionStorage.getItem(SEATWISE_SESSION_KEY);if(!raw)return null;const s=JSON.parse(raw);if(!s?.last_activity||Date.now()-Number(s.last_activity)>SEATWISE_SESSION_TIMEOUT){clearSeatwiseSession();return null}return s}catch(e){clearSeatwiseSession();return null}}
function touchSeatwiseSession(){const s=getSeatwiseSession();if(!s)return null;s.last_activity=Date.now();sessionStorage.setItem(SEATWISE_SESSION_KEY,JSON.stringify(s));return s}
function clearSeatwiseSession(){sessionStorage.removeItem(SEATWISE_SESSION_KEY)}
function requireSeatwiseLogin(){const s=getSeatwiseSession();if(!s){location.replace('index.html');return null}touchSeatwiseSession();return s}
function seatwiseLogout(){clearSeatwiseSession();location.replace('index.html')}
function getCurrentAcademicSession(now=new Date()){const y=now.getFullYear(),m=now.getMonth()+1;return m>=4?`${y}-${y+1}`:`${y-1}-${y}`}
async function ensureCurrentAcademicSession(){return getCurrentAcademicSession()}
async function logActivity(action,details={}){try{const s=getSeatwiseSession();if(!s?.school_id)return;await seatwiseDb.from('activity_logs').insert({school_id:s.school_id,admin_user_id:s.id,action,details})}catch(e){console.error('SeatWise activity log failed',e)}}
if((location.pathname.split('/').pop()||'index.html').toLowerCase()==='index.html')clearSeatwiseSession();
(function(){const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();if(file==='index.html'||window.__seatwiseAuthNavLoader||window.__seatwiseNavLoaded)return;window.__seatwiseAuthNavLoader=true;const script=document.createElement('script');script.src='js/navigation.js?v=20260914';script.onload=()=>{window.__seatwiseAuthNavLoader=false};script.onerror=()=>{window.__seatwiseAuthNavLoader=false;console.error('SeatWise navigation failed to load')};document.head.appendChild(script)})();