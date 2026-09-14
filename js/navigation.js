/* SeatWise Navigation loader - single shared navigation component. */
(function(){
  if(window.__seatwiseNavComponentLoaded || customElements.get('seatwise-navigation')) return;
  if(window.__seatwiseNavScriptLoading) return;
  window.__seatwiseNavScriptLoading=true;
  function load(){
    if(window.__seatwiseNavComponentLoaded || customElements.get('seatwise-navigation')){
      window.__seatwiseNavScriptLoading=false;
      return;
    }
    const s=document.createElement('script');
    s.src='js/navigation-component.js?v=20260914';
    s.onload=()=>{window.__seatwiseNavComponentLoaded=true;window.__seatwiseNavScriptLoading=false};
    s.onerror=()=>{window.__seatwiseNavScriptLoading=false;console.error('SeatWise navigation component failed to load')};
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
