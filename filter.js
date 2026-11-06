(function(){
  var root=document.querySelector('[data-filter-root]');
  if(!root) return;
  var list=root.querySelector('[data-filter-list]');
  var items=[].slice.call(root.querySelectorAll('[data-filter-item]'));
  var search=root.querySelector('[data-filter-search]');
  var live=root.querySelector('[data-filter-live]');
  var clearBtn=root.querySelector('[data-filter-clear]');
  var facets=root.querySelectorAll('[data-filter-facet]');
  var total=items.length;

  function params(){
    var u=new URL(location.href);
    return {
      q:(u.searchParams.get('q')||'').trim(),
      phase:u.searchParams.getAll('phase'),
      domain:u.searchParams.getAll('domain'),
      type:u.searchParams.getAll('type')
    };
  }
  function writeParams(state){
    var u=new URL(location.href);
    u.search='';
    if(state.q) u.searchParams.set('q', state.q);
    state.phase.forEach(function(v){u.searchParams.append('phase', v)});
    state.domain.forEach(function(v){u.searchParams.append('domain', v)});
    state.type.forEach(function(v){u.searchParams.append('type', v)});
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
  function selected(facet){
    return [].slice.call(root.querySelectorAll('[data-filter-facet="'+facet+'"][aria-pressed="true"]'))
      .map(function(b){return b.getAttribute('data-filter-value')});
  }
  function syncButtons(state){
    facets.forEach(function(b){
      var facet=b.getAttribute('data-filter-facet');
      var val=b.getAttribute('data-filter-value');
      var on=(state[facet]||[]).indexOf(val)!==-1;
      b.setAttribute('aria-pressed', on?'true':'false');
    });
    if(search && search.value!==state.q) search.value=state.q;
  }
  function match(item, state){
    var hay=((item.getAttribute('data-filter-text')||'')+' '+(item.textContent||'')).toLowerCase();
    if(state.q && hay.indexOf(state.q.toLowerCase())===-1) return false;
    function hasAll(facet){
      var need=state[facet]||[];
      if(!need.length) return true;
      var have=(item.getAttribute('data-'+facet)||'').split(/\s+/).filter(Boolean);
      return need.every(function(v){return have.indexOf(v)!==-1});
    }
    return hasAll('phase') && hasAll('domain') && hasAll('type');
  }
  function apply(state, push){
    syncButtons(state);
    var n=0;
    items.forEach(function(item){
      var ok=match(item, state);
      item.hidden=!ok;
      if(ok) n++;
    });
    // hide empty shelf headings
    root.querySelectorAll('[data-filter-shelf]').forEach(function(shelf){
      var any=[].slice.call(shelf.querySelectorAll('[data-filter-item]')).some(function(i){return !i.hidden});
      shelf.hidden=!any;
    });
    if(live){
      live.textContent = n===total ? (total+' shown') : (n+' of '+total+' shown');
    }
    if(clearBtn) clearBtn.hidden = !(state.q || state.phase.length || state.domain.length || state.type.length);
    if(push!==false) writeParams(state);
  }
  function stateFromUI(){
    return {
      q: search ? search.value.trim() : '',
      phase: selected('phase'),
      domain: selected('domain'),
      type: selected('type')
    };
  }
  facets.forEach(function(b){
    b.addEventListener('click', function(){
      var on=b.getAttribute('aria-pressed')==='true';
      b.setAttribute('aria-pressed', on?'false':'true');
      apply(stateFromUI());
    });
  });
  if(search){
    search.addEventListener('input', function(){ apply(stateFromUI()); });
  }
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      apply({q:'', phase:[], domain:[], type:[]});
      if(search) search.focus();
    });
  }
  var initial=params();
  apply(initial, false);
  // normalize URL if we had params
  if(initial.q || initial.phase.length || initial.domain.length || initial.type.length) writeParams(initial);
})();
