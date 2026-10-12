/* Ridgewood AC & Heating site script (bundled by build.py) */
document.documentElement.classList.remove('nj');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---- mobile menu + touch dropdowns ---- */
(function(){
  var b=document.querySelector('.burger');
  if(b)b.addEventListener('click',function(){var o=document.body.classList.toggle('menu-open');b.setAttribute('aria-expanded',o)});
  document.querySelectorAll('.mnav a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open')})});
  document.querySelectorAll('.dd>button').forEach(function(btn){
    btn.addEventListener('click',function(e){var d=btn.parentNode,o=d.classList.toggle('open');btn.setAttribute('aria-expanded',o);
      document.querySelectorAll('.dd.open').forEach(function(x){if(x!==d)x.classList.remove('open')});e.stopPropagation()});
  });
  document.addEventListener('click',function(){document.querySelectorAll('.dd.open').forEach(function(x){x.classList.remove('open')})});
  addEventListener('keydown',function(e){if(e.key==='Escape'){document.body.classList.remove('menu-open');document.querySelectorAll('.dd.open').forEach(function(x){x.classList.remove('open')})}});
})();

/* ---- sticky call bar: only after the hero has scrolled out of view ---- */
(function(){
  var bar=document.querySelector('.callbar'),h=document.querySelector('.hero,.phero');if(!bar)return;
  if(!h||!('IntersectionObserver' in window)){bar.classList.add('on');return}
  new IntersectionObserver(function(es){es.forEach(function(e){bar.classList.toggle('on',!e.isIntersecting&&e.boundingClientRect.top<0)})},{threshold:0}).observe(h);
})();

/* ---- reveal ---- */
(function(){
  var els=document.querySelectorAll('.reveal');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  els.forEach(function(e){io.observe(e)});
})();

/* ---- gallery: swipe dots + lightbox (drag follows the finger) ---- */
(function(){
  var P=window.GAL||[],lb=document.getElementById('lb');if(!P.length||!lb)return;
  var lt=document.getElementById('lbt'),lc=document.getElementById('lbc'),cur=0,sx=0,dx=0,down=false;
  lt.innerHTML=P.map(function(p){return '<div class="lb-slide"><img loading="lazy" src="'+p.big+'" alt="'+esc(p.alt)+'"></div>'}).join('');
  function go(i,anim){cur=(i+P.length)%P.length;lt.style.transition=anim===false?'none':'';lt.style.transform='translateX('+(-cur*100)+'%)';lc.textContent=(cur+1)+' / '+P.length}
  function open(i){lb.classList.add('on');document.body.style.overflow='hidden';go(i,false)}
  function close(){lb.classList.remove('on');document.body.style.overflow=''}
  document.querySelectorAll('.gal').forEach(function(g){
    g.addEventListener('click',function(e){var b=e.target.closest('button[data-i]');if(b)open(+b.dataset.i)});
    var d=g.nextElementSibling;if(!d||!d.classList.contains('gal-dots'))return;var dots=[].slice.call(d.children);
    g.addEventListener('scroll',function(){var w=g.firstElementChild.getBoundingClientRect().width+11;var k=Math.round(g.scrollLeft/w);dots.forEach(function(x,j){x.classList.toggle('on',j===k)})},{passive:true});
  });
  document.getElementById('lbx').onclick=close;document.getElementById('lbp').onclick=function(){go(cur-1)};document.getElementById('lbn').onclick=function(){go(cur+1)};
  addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')go(cur-1);if(e.key==='ArrowRight')go(cur+1)});
  lt.addEventListener('pointerdown',function(e){down=true;sx=e.clientX;dx=0;lt.style.transition='none'});
  lt.addEventListener('pointermove',function(e){if(!down)return;dx=e.clientX-sx;lt.style.transform='translateX(calc('+(-cur*100)+'% + '+dx+'px))'});
  function end(e){if(!down)return;down=false;if(dx<-60)go(cur+1);else if(dx>60)go(cur-1);else if(Math.abs(dx)<6&&!e.target.closest('img'))close();else go(cur)}
  lt.addEventListener('pointerup',end);lt.addEventListener('pointercancel',end);
})();

/* ---- US phone check (structural NANP rules only, no area-code list) ---- */
function usPhone(raw){
  var s=String(raw||'').trim();if(/^\+/.test(s)&&!/^\+1/.test(s))return null;
  var d=s.replace(/\D/g,'');if(d.length===11&&d[0]==='1')d=d.slice(1);if(d.length!==10)return null;
  var a=d.slice(0,3),n=d.slice(3,6);
  if(!/^[2-9]/.test(a)||!/^[2-9]/.test(n))return null;if(/^[2-9]11$/.test(a)||/^[2-9]11$/.test(n))return null;
  if(a[1]==='9')return null;if(/^(\d)\1{9}$/.test(d))return null;if(n==='555'&&/^01/.test(d.slice(6)))return null;
  return '('+a+') '+n+'-'+d.slice(6);
}
function bindPhone(el){el.addEventListener('input',function(){
  if(el.selectionStart!==el.value.length||/^\+/.test(el.value))return;var d=el.value.replace(/\D/g,'');if(d.length>10)return;
  var o=d;if(d.length>6)o='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>3)o='('+d.slice(0,3)+') '+d.slice(3);el.value=o})}

/* ---- Netlify POST; confirmation ONLY on 2xx ---- */
function send(form,btn,onOk){
  var label=btn.innerHTML,err=form.querySelector('.send-err');btn.disabled=true;btn.textContent='Sending…';if(err)err.hidden=true;
  fetch('/ridgewood-preview/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
  .then(function(r){if(!r.ok)throw new Error(r.status);onOk()})
  .catch(function(){btn.disabled=false;btn.innerHTML=label;if(err)err.hidden=false});
}

/* ---- quote wizard: what -> how soon -> where -> contact ---- */
document.querySelectorAll('form.qw').forEach(function(f){
  if(f.elements.page)f.elements.page.value=location.pathname;
  var steps=[].slice.call(f.querySelectorAll('.qw-step')),bar=f.querySelector('.qw-bar i'),cnt=f.querySelector('.qw-count'),i=0;
  var skip={};['service','town'].forEach(function(k){if(f.dataset['pre'+k[0].toUpperCase()+k.slice(1)]){f.elements[k].value=f.dataset['pre'+k[0].toUpperCase()+k.slice(1)];skip[k]=1}});
  var live=steps.filter(function(s){return !skip[s.dataset.field]});
  steps.forEach(function(s){s.hidden=live.indexOf(s)!==0});
  function show(n){i=n;live.forEach(function(s,j){s.hidden=j!==n});bar.style.width=((n+1)/live.length*100)+'%';cnt.textContent='Step '+(n+1)+' of '+live.length;
    var urg=f.querySelector('.urgent');if(urg)urg.hidden=!(f.elements.timing.value==='Today, it\'s urgent'&&live[n].dataset.field==='contact');
    f.querySelectorAll('.qw-back').forEach(function(b){b.style.visibility=n?'visible':'hidden'})}
  f.addEventListener('click',function(e){
    var o=e.target.closest('.opt');if(o&&o.dataset.v!==undefined){var st=o.closest('.qw-step,.seg');
      st.querySelectorAll('.opt').forEach(function(x){x.classList.toggle('on',x===o)});f.elements[o.dataset.k].value=o.dataset.v;
      if(o.closest('.qw-step')&&!o.closest('.seg')){setTimeout(function(){if(i<live.length-1)show(i+1)},230)}}
    if(e.target.closest('.qw-back')){e.preventDefault();if(i>0)show(i-1)}
  });
  var ph=f.elements.phone;bindPhone(ph);
  f.addEventListener('submit',function(e){e.preventDefault();
    var ok=true,nm=f.elements.name,pf=ph.closest('.fld'),nf=nm.closest('.fld');
    nf.classList.toggle('bad',!nm.value.trim());if(!nm.value.trim())ok=false;
    var p=usPhone(ph.value);pf.classList.toggle('bad',!p);pf.querySelector('.err').hidden=!!p;if(!p)ok=false;else ph.value=p;
    if(!ok)return;
    send(f,f.querySelector('button[type=submit]'),function(){f.querySelector('.qw-steps').hidden=true;f.querySelector('.qw-top').hidden=true;f.querySelector('.qw-bar').hidden=true;f.querySelector('.qw-done').hidden=false});
  });
  show(0);
});

/* ---- club signup ---- */
document.querySelectorAll('form.club-form').forEach(function(f){
  var ph=f.elements.phone;bindPhone(ph);
  f.addEventListener('click',function(e){var o=e.target.closest('.opt');if(!o)return;o.parentNode.querySelectorAll('.opt').forEach(function(x){x.classList.toggle('on',x===o)});f.elements[o.dataset.k].value=o.dataset.v});
  f.addEventListener('submit',function(e){e.preventDefault();var ok=true;
    var nf=f.elements.name.closest('.fld');nf.classList.toggle('bad',!f.elements.name.value.trim());if(!f.elements.name.value.trim())ok=false;
    var p=usPhone(ph.value),pf=ph.closest('.fld');pf.classList.toggle('bad',!p);pf.querySelector('.err').hidden=!!p;if(!p)ok=false;else ph.value=p;
    if(!ok)return;
    send(f,f.querySelector('button[type=submit]'),function(){f.querySelector('.cf-body').hidden=true;f.querySelector('.qw-done').hidden=false});
  });
});

/* ---- drift rows (phones): clones + rAF on a CSS var, native swipe takes over on touch ---- */
(function(){
  if(!matchMedia('(max-width:760px)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  document.querySelectorAll('[data-drift]').forEach(function(row){
    var kids=[].slice.call(row.children);if(kids.length<3)return;
    kids.forEach(function(k){var c=k.cloneNode(true);c.classList.add('is-clone');c.classList.add('in');c.setAttribute('aria-hidden','true');c.tabIndex=-1;c.querySelectorAll('a,button').forEach(function(x){x.tabIndex=-1});row.appendChild(c)});
    row.classList.add('drift');
    var dx=0,last=0,held=false,resume=0,period=1,run=false;
    function per(){var fc=row.querySelector('.is-clone');period=Math.max(1,fc.offsetLeft-row.firstElementChild.offsetLeft)}
    per();addEventListener('resize',per);
    function set(){row.style.setProperty('--dx',dx.toFixed(2))}
    function hand(){if(dx){row.scrollLeft+=dx;dx=0;set()}held=true}
    function rel(){held=false;resume=performance.now()+3500}
    row.addEventListener('touchstart',hand,{passive:true});row.addEventListener('pointerdown',hand);
    row.addEventListener('touchend',rel,{passive:true});row.addEventListener('pointerup',rel);row.addEventListener('pointercancel',rel);
    row.addEventListener('scroll',function(){if(!dx)resume=performance.now()+3500},{passive:true});
    function tick(t){if(!run){last=0;return}
      if(!held&&t>resume){
        if(row.scrollLeft>0){dx=row.scrollLeft%period;row.scrollLeft=0}
        if(last)dx+=(t-last)/1000*18;if(dx>=period)dx-=period;set()}
      last=t;requestAnimationFrame(tick)}
    new IntersectionObserver(function(es){es.forEach(function(e){var was=run;run=e.isIntersecting;if(run&&!was)requestAnimationFrame(tick)})},{threshold:.3}).observe(row);
  });
})();

/* maps: the Google embed pulls ~300KB of script, so it only loads when scrolled near (10/12 speed pass) */
(function(){var f=document.querySelectorAll("iframe[data-src]");if(!f.length)return;function go(i){if(!i.getAttribute("src"))i.src=i.dataset.src}if(!("IntersectionObserver" in window)){f.forEach(go);return}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){go(e.target);io.unobserve(e.target)}})},{rootMargin:"400px 0px"});f.forEach(function(i){io.observe(i)})})();
