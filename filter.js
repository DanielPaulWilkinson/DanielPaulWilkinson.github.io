(function(){
  var PAGE=12;
  var root=document.querySelector('[data-filter-root]');
  if(!root) return;
  var items=[].slice.call(root.querySelectorAll('[data-filter-item]'));
  var search=root.querySelector('[data-filter-search]');
  var live=root.querySelector('[data-filter-live]');
  var clearBtn=root.querySelector('[data-filter-clear]');
  var facets=root.querySelectorAll('[data-filter-facet]');
  var total=items.length;
  var limit=PAGE;

  var moreBtn=document.createElement('button');
  moreBtn.type='button';
  moreBtn.className='show-more';
  moreBtn.textContent='Show more';
  moreBtn.setAttribute('aria-label','Show more');
  moreBtn.hidden=true;
  root.appendChild(moreBtn);

  function params(){
    var u=new URL(location.href);
    return {
      q:(u.searchParams.get('q')||'').trim(),
      phase:u.searchParams.getAll('phase'),
      domain:u.searchParams.getAll('domain'),
      type:u.searchParams.getAll('type'),
      show:u.searchParams.get('show')||''
    };
  }
  function writeParams(state, shown, matched){
    var u=new URL(location.href);
    u.search='';
    if(state.q) u.searchParams.set('q', state.q);
    state.phase.forEach(function(v){u.searchParams.append('phase', v)});
    state.domain.forEach(function(v){u.searchParams.append('domain', v)});
    state.type.forEach(function(v){u.searchParams.append('type', v)});
    if(shown>=matched && matched>PAGE) u.searchParams.set('show','all');
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
  function apply(state, push, opts){
    opts=opts||{};
    syncButtons(state);
    var matched=[];
    items.forEach(function(item){
      if(match(item, state)) matched.push(item);
      else item.hidden=true;
    });
    var visibleLimit = (state.show==='all') ? matched.length : Math.min(limit, matched.length);
    var firstNew=null;
    var prevVisible=opts.prevVisible||0;
    matched.forEach(function(item, i){
      var show=i<visibleLimit;
      item.hidden=!show;
      if(show && i>=prevVisible && !firstNew) firstNew=item;
    });
    root.querySelectorAll('[data-filter-shelf]').forEach(function(shelf){
      var any=[].slice.call(shelf.querySelectorAll('[data-filter-item]')).some(function(i){return !i.hidden});
      shelf.hidden=!any;
    });
    var shown=visibleLimit;
    var left=matched.length-shown;
    if(live){
      if(shown===total && matched.length===total) live.textContent=total+' shown';
      else if(matched.length===total) live.textContent=shown+' of '+total+' shown';
      else live.textContent=shown+' of '+matched.length+' matching ('+total+' total)';
    }
    if(left>0){
      moreBtn.hidden=false;
      moreBtn.textContent='Show more ('+left+' left)';
      moreBtn.setAttribute('aria-label','Show more, '+left+' remaining');
    } else {
      moreBtn.hidden=true;
      moreBtn.textContent='Show more';
      moreBtn.setAttribute('aria-label','Show more');
    }
    if(clearBtn) clearBtn.hidden = !(state.q || state.phase.length || state.domain.length || state.type.length);
    if(push!==false) writeParams(state, shown, matched.length);
    if(opts.focusNew && firstNew){
      firstNew.setAttribute('tabindex','-1');
      firstNew.focus();
    }
  }
  function stateFromUI(show){
    return {
      q: search ? search.value.trim() : '',
      phase: selected('phase'),
      domain: selected('domain'),
      type: selected('type'),
      show: show||''
    };
  }
  function onFilterChange(){
    limit=PAGE;
    apply(stateFromUI());
  }
  facets.forEach(function(b){
    b.addEventListener('click', function(){
      var on=b.getAttribute('aria-pressed')==='true';
      b.setAttribute('aria-pressed', on?'false':'true');
      onFilterChange();
    });
  });
  if(search) search.addEventListener('input', onFilterChange);
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      limit=PAGE;
      apply({q:'', phase:[], domain:[], type:[], show:''});
      if(search) search.focus();
    });
  }
  moreBtn.addEventListener('click', function(){
    var s=stateFromUI();
    var matched=items.filter(function(item){return match(item, s)}).length;
    var prev=Math.min(limit, matched);
    limit=Math.min(limit+PAGE, matched);
    if(limit>=matched) s.show='all';
    apply(s, true, {focusNew:true, prevVisible:prev});
  });

  var initial=params();
  limit = (initial.show==='all') ? total : PAGE;
  apply(initial, !!(initial.q || initial.phase.length || initial.domain.length || initial.type.length || initial.show));
})();
