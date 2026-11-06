(function(){
  try{
    var k='dw-theme', s=localStorage.getItem(k), t;
    if(s==='light'||s==='dark') t=s;
    else t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme=t;
  }catch(e){
    document.documentElement.setAttribute('data-theme','light');
  }
})();
