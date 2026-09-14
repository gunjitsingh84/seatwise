/* SeatWise Navigation loader - single shared navigation component. */
(function(){
  if(window.__seatwiseNavLoader)return;
  window.__seatwiseNavLoader=true;
  function load(){
    if(window.__seatwiseNavComponentLoaded)return;
    const s=document.createElement('script');
    s.src='js/navigation-component.js?v=20260914';
    s.onload=()=>window.__seatwiseNavComponentLoaded=true;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
