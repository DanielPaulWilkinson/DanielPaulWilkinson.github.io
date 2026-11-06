(function(){
  var k='dw-theme';
  var root=document.documentElement;
  function current(){return root.getAttribute('data-theme')==='dark'?'dark':'light'}
  function system(){try{return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){return 'light'}}
  function apply(t, persist){
    root.setAttribute('data-theme', t);
    root.style.colorScheme=t;
    if(persist){try{localStorage.setItem(k,t)}catch(e){}}
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', t==='dark'?'#0F1724':'#1F3A5F');
    document.querySelectorAll('[data-theme-toggle]').forEach(function(btn){
      var dark=t==='dark';
      btn.setAttribute('aria-pressed', dark?'true':'false');
      btn.setAttribute('aria-label', dark?'Use light theme':'Use dark theme');
      btn.textContent=dark?'Light':'Dark';
    });
  }
  function init(){
    apply(current(), false);
    document.querySelectorAll('[data-theme-toggle]').forEach(function(btn){
      btn.addEventListener('click', function(){
        apply(current()==='dark'?'light':'dark', true);
      });
    });
    try{
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
        var stored=null; try{stored=localStorage.getItem(k)}catch(err){}
        if(stored!=='light'&&stored!=='dark') apply(e.matches?'dark':'light', false);
      });
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
