/* SeatWise navigation compatibility loader.
   The old renderer has been retired. All pages now use navigation-v3.js.
*/
(function(){
  if(window.__seatwiseNavV3Loader)return;
  window.__seatwiseNavV3Loader=true;
  function load(){
    if(document.getElementById('seatwise-navigation-v3-script')||window.__seatwiseNavV3)return;
    const s=document.createElement('script');
    s.id='seatwise-navigation-v3-script';
    s.src='js/navigation-v3.js?v=20260913';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
