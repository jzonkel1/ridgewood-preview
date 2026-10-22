/* Ridgewood AC & Heating site script (bundled by build.py) */
document.documentElement.classList.remove('nj');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---- maps: the Google embed pulls ~300KB, so it waits until it's ~2 screens away (it takes 2-3s to arrive), fades in
   once loaded and retries once if it stalls. First in the file so an error further down can't leave the box empty, and
   no loading="lazy" on the iframe (a second lazy layer on top of this one). Behind it sits an "Open in Google Maps"
   card (map_box in build.py). 10/22: Jeffrey saw the map sometimes not load. ---- */
(function(){var f=document.querySelectorAll('iframe[data-src]');if(!f.length)return;
  function go(i){if(i.getAttribute('src'))return;
    i.addEventListener('load',function(){i.classList.add('ok')});
    i.src=i.dataset.src;setTimeout(function(){if(!i.classList.contains('ok'))i.src=i.dataset.src},12000)}
  if(!('IntersectionObserver' in window)){f.forEach(go);return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){go(e.target);io.unobserve(e.target)}})},{rootMargin:'1500px 0px'});
  f.forEach(function(i){io.observe(i)})})();

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
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
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

/* ---- reviews row (10/22): drifts on its own at the old marquee speed; a finger, a mouse drag or a trackpad moves it, both
   ways. Same handover as the drift rows: the offset moves from --dx into scrollLeft (a full copy behind, so swiping back
   never hits a wall), and 3.5s after the last touch it folds back into --dx. The track holds the cards twice. ---- */
document.querySelectorAll('.marquee').forEach(function(m){
  var tr=m.querySelector('.mq-track'),n=tr&&tr.children.length/2;
  if(!n||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var cs=getComputedStyle(tr).transform,dx=cs&&cs!=='none'?-new DOMMatrixReadOnly(cs).m41:0;
  m.classList.add('mq-js');
  var P=1,v=0,last=0,held=false,hov=false,resume=0,run=false,drag=null,settle=0;
  function per(){P=Math.max(1,tr.children[n].offsetLeft-tr.children[0].offsetLeft);v=P/(parseFloat(m.style.getPropertyValue('--mq'))||90)}
  per();addEventListener('resize',per);
  function set(){m.style.setProperty('--dx',dx.toFixed(2))}
  dx%=P;set();
  function hand(){if(dx){m.scrollLeft=dx<P/2?dx+P:dx;dx=0;set()}}
  function rel(ms){held=false;resume=Math.max(resume,performance.now()+ms)}
  m.addEventListener('touchstart',function(){hand();held=true},{passive:true});
  m.addEventListener('touchend',function(){rel(3500)},{passive:true});
  m.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hand();hov=true}});
  m.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){hov=false;rel(800)}});
  m.addEventListener('pointerdown',function(e){hand();held=true;if(e.pointerType!=='mouse'||e.button)return;
    drag={x:e.clientX,s:m.scrollLeft};m.setPointerCapture(e.pointerId);m.classList.add('dragging')});
  m.addEventListener('pointermove',function(e){if(drag)m.scrollLeft=drag.s-(e.clientX-drag.x)});
  // touch lets go on touchend only: Chrome fires pointercancel the moment a pan starts, with the finger still down
  function up(e){if(e.pointerType!=='mouse')return;if(drag){drag=null;m.classList.remove('dragging')}rel(3500)}
  m.addEventListener('pointerup',up);m.addEventListener('pointercancel',up);
  m.addEventListener('scroll',function(){if(dx)return;resume=Math.max(resume,performance.now()+3500);
    // once it settles, park the position in the middle copy so the next swipe has room either way
    clearTimeout(settle);settle=setTimeout(function(){if(held||drag)return;var x=m.scrollLeft;if(x>0&&x<P/2)m.scrollLeft=x+P;else if(x>P*1.5)m.scrollLeft=x-P},150)},{passive:true});
  function tick(t){if(!run){last=0;return}
    if(!held&&!hov&&t>resume){
      if(m.scrollLeft>0){dx=m.scrollLeft%P;m.scrollLeft=0}
      if(last)dx+=(t-last)/1000*v;if(dx>=P)dx-=P;set()}
    last=t;requestAnimationFrame(tick)}
  new IntersectionObserver(function(es){es.forEach(function(e){var was=run;run=e.isIntersecting;if(run&&!was)requestAnimationFrame(tick)})},{threshold:.2}).observe(m);
});

/* ---- online booking (10/21/26): our screens on Tommy's FieldPulse schedule ----
   Same two public calls his FieldPulse booking portal makes, straight from the browser (no key): GET open slots for a
   service, POST the booking. Days, windows, the 3-hour cutoff and no-double-booking all come from his FieldPulse
   settings. NO prices anywhere. Off the live domain it is a DRY RUN: real open times, never books.
   If FieldPulse can't be reached, the details go through the quote form instead so nothing is lost. */
document.querySelectorAll('.bk').forEach(function(w){
  var API=w.dataset.api,CO=w.dataset.co,DAYS=+w.dataset.days||14,TZ='America/Chicago';
  var LIVE=location.hostname.replace(/^www\./,'')===w.dataset.live;
  var steps=[].slice.call(w.querySelectorAll('.qw-step')),bar=w.querySelector('.qw-bar i'),cnt=w.querySelector('.qw-count');
  var load=w.querySelector('.bk-load'),daysEl=w.querySelector('.bk-days'),timesEl=w.querySelector('.bk-times'),note=w.querySelector('.bk-note'),none=w.querySelector('.bk-none');
  var f=w.querySelector('form'),err=f.querySelector('.send-err'),btn=f.querySelector('button[type=submit]'),done=w.querySelector('.qw-done');
  var tel=w.querySelector('.qw-foot a'),TEL='<a href="'+tel.getAttribute('href')+'">'+esc(tel.textContent)+'</a>',ARROW=w.querySelector('.bk-svc>svg').outerHTML;
  var st={svc:0,label:'',slots:[],byDay:{},day:'',slot:null},cur=0,req=0;
  function fmt(o){o.timeZone=TZ;return new Intl.DateTimeFormat('en-US',o)}
  var fKey=fmt({year:'numeric',month:'2-digit',day:'2-digit'}),fWd=fmt({weekday:'short'}),fNum=fmt({day:'numeric'}),fMon=fmt({month:'short'}),
      fLong=fmt({weekday:'long',month:'long',day:'numeric'}),fShort=fmt({weekday:'short',month:'short',day:'numeric'}),fHr=fmt({hour:'numeric',hourCycle:'h23'}),
      fT=fmt({hour:'numeric',minute:'2-digit'});
  function d(ts){return new Date(ts*1000)}
  function hm(ts){var h='',m='',p='';fT.formatToParts(d(ts)).forEach(function(q){if(q.type==='hour')h=q.value;if(q.type==='minute')m=q.value;if(q.type==='dayPeriod')p=q.value.toUpperCase()});return {t:h+(m!=='00'?':'+m:''),p:p}}
  function win(s){var a=hm(s.start_timestamp),b=hm(s.end_timestamp);
    if(s.end_timestamp-s.start_timestamp<=3600)return a.t+' '+a.p;
    return a.p===b.p?a.t+' to '+b.t+' '+b.p:a.t+' '+a.p+' to '+b.t+' '+b.p}
  function part(s){var h=+fHr.format(d(s.start_timestamp));return h<12?'Morning':h<17?'Afternoon':'Evening'}
  function when(s){return fLong.format(d(s.start_timestamp))+', '+win(s)}
  function show(n){cur=n;steps.forEach(function(s,j){s.hidden=j!==n});bar.style.width=((n+1)/steps.length*100)+'%';cnt.textContent='Step '+(n+1)+' of '+steps.length;
    w.querySelectorAll('.qw-back:not(.bk-club-back)').forEach(function(b){b.style.visibility=n?'visible':'hidden'})}
  function focusTop(el){var h=el.querySelector('h3');if(h)h.focus({preventScroll:true});var r=w.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.6)w.scrollIntoView({behavior:'smooth',block:'start'})}

  function slots(msg){
    var my=++req,now=Math.floor(Date.now()/1000);
    load.hidden=false;daysEl.innerHTML='';timesEl.innerHTML='';note.hidden=true;none.hidden=true;
    fetch(API+'/company/slots/'+CO+'?start='+now+'&end='+(now+DAYS*86400)+'&service_id='+st.svc,{headers:{Accept:'application/json'}})
    .then(function(r){return r.json()})
    .then(function(j){if(my!==req)return;if(!j||j.error||!j.response)throw new Error('slots');
      var list=(j.response.slots||[]).filter(function(s){return s.start_timestamp>now}).sort(function(a,b){return a.start_timestamp-b.start_timestamp});
      var order=[],wkend=false;st.slots=list;st.byDay={};
      list.forEach(function(s,i){var k=fKey.format(d(s.start_timestamp)),wd=fWd.format(d(s.start_timestamp));
        if(!st.byDay[k]){st.byDay[k]=[];order.push(k)}st.byDay[k].push(i);if(wd==='Sat'||wd==='Sun')wkend=true});
      load.hidden=true;note.hidden=wkend;
      if(!order.length){none.querySelector('p').textContent='No open times online in the next two weeks. Call or text and a real person will fit you in.';none.querySelector('.cta-row').hidden=false;none.hidden=false;return}
      daysEl.innerHTML=order.map(function(k){var s=list[st.byDay[k][0]],n=st.byDay[k].length,t=d(s.start_timestamp);
        return '<button type="button" class="bk-day" data-k="'+k+'" aria-pressed="false"><span class="dw">'+fWd.format(t)+'</span><span class="dn">'+fNum.format(t)+'</span><span class="dm">'+fMon.format(t)+'</span><span class="dc">'+n+(n>1?' times':' time')+'</span></button>'}).join('');
      if(msg){none.querySelector('p').textContent=msg;none.querySelector('.cta-row').hidden=true;none.hidden=false}
      pickDay(order.indexOf(st.day)>-1?st.day:order[0]);
    })
    .catch(function(){if(my!==req)return;load.hidden=true;
      none.querySelector('p').textContent='We couldn\'t load open times right now. Call or text and a real person will get you scheduled, or send a quick request.';
      none.querySelector('.cta-row').hidden=false;none.hidden=false});
  }
  function pickDay(k){st.day=k;
    daysEl.querySelectorAll('.bk-day').forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    timesEl.innerHTML=(st.byDay[k]||[]).map(function(i){var s=st.slots[i];
      return '<button type="button" class="opt bk-time'+(st.slot===s?' on':'')+'" data-i="'+i+'"><span><b>'+part(s)+'</b>'+win(s)+'</span>'+ARROW+'</button>'}).join('')}
  function summary(){f.querySelector('.bk-sum-t').innerHTML='<b>'+esc(st.label)+'</b><span>'+esc(fShort.format(d(st.slot.start_timestamp))+', '+win(st.slot))+'</span>'}

  w.addEventListener('click',function(e){
    /* step 1: the "Club member checkup" card opens the first / second visit choice */
    var cm=w.querySelector('.bk-main'),cc=w.querySelector('.bk-club');
    if(e.target.closest('.bk-club-open')){cm.hidden=true;cc.hidden=false;focusTop(steps[0]);return}
    if(e.target.closest('.bk-club-back')){cm.hidden=false;cc.hidden=true;focusTop(steps[0]);return}
    var o=e.target.closest('.bk-svc');
    if(o){w.querySelectorAll('.bk-svc').forEach(function(x){x.classList.toggle('on',x===o)});
      if(st.svc!==+o.dataset.id){st.svc=+o.dataset.id;st.slot=null;st.day=''}st.label=o.dataset.label;
      setTimeout(function(){show(1);focusTop(steps[1]);slots()},200);return}
    var dy=e.target.closest('.bk-day');if(dy){pickDay(dy.dataset.k);return}
    var tm=e.target.closest('.bk-time');
    if(tm){st.slot=st.slots[+tm.dataset.i];timesEl.querySelectorAll('.bk-time').forEach(function(x){x.classList.toggle('on',x===tm)});summary();
      setTimeout(function(){show(2);focusTop(steps[2]);var n=f.elements.full_name;if(!n.value&&matchMedia('(hover:hover)').matches)n.focus({preventScroll:true})},200);return}
    if(e.target.closest('.bk-change')){show(1);focusTop(steps[1]);return}
    if(e.target.closest('.qw-back')){e.preventDefault();if(cur>0){show(cur-1);focusTop(steps[cur])}}
  });

  var E=f.elements;bindPhone(E.phone);
  /* step 3 (10/22): the ZIP fills in the town; an unknown ZIP (or "Not right?") shows the town box */
  var ZIPS={};try{ZIPS=JSON.parse(w.dataset.zips||'{}')}catch(x){}
  var townF=E.city.closest('.fld'),townLine=f.querySelector('.bk-townline'),manual=false;
  function zipTown(){var z=E.zip_code.value,c=ZIPS[z];
    if(manual){townLine.hidden=true;townF.hidden=false;return}
    if(z.length<5){townLine.hidden=true;return}
    if(c){E.city.value=c;townLine.querySelector('span').textContent=c+', TX';townLine.hidden=false;townF.hidden=true;bad(E.city,false)}
    else{townLine.hidden=true;townF.hidden=false}}
  E.zip_code.addEventListener('input',function(){E.zip_code.value=E.zip_code.value.replace(/\D/g,'').slice(0,5);zipTown()});
  E.zip_code.addEventListener('change',zipTown);
  f.querySelector('.bk-town-edit').addEventListener('click',function(){manual=true;zipTown();E.city.focus()});
  f.querySelector('.bk-more').addEventListener('click',function(){this.hidden=true;var x=f.querySelector('.bk-extra');x.hidden=false;x.querySelector('input').focus()});
  function bad(el,isBad){var fl=el.closest('.fld');fl.classList.toggle('bad',isBad);var m=fl.querySelector('.err');if(m)m.hidden=!isBad;return isBad}
  function val(n,max){return String(E[n].value||'').replace(/[ \t]+/g,' ').trim().slice(0,max||120)}

  function finish(kind){
    w.querySelector('.bk-steps').hidden=true;w.querySelector('.qw-top').hidden=true;w.querySelector('.qw-bar').hidden=true;done.hidden=false;
    var h=done.querySelector('h3'),a=done.querySelector('.bk-done-when'),b=done.querySelector('.bk-done-more');
    if(kind==='dry'){h.textContent='Preview only.';a.textContent='Nothing was booked. On the live site this books '+st.label.toLowerCase()+' for '+when(st.slot)+'.';b.textContent=''}
    else if(kind==='request'){h.textContent='Got it. Thank you.';a.textContent='Our online calendar didn\'t answer, so your details came to us as a request for '+when(st.slot)+'.';
      b.innerHTML='A real person will call you to confirm the time. Need us sooner? Call '+TEL+'.'}
    else{a.textContent=st.label+': '+when(st.slot)+'.';
      b.innerHTML='A confirmation email is on its way to <b>'+esc(val('email'))+'</b>. Need to change anything? Call or text '+TEL+'.'}
    focusTop(done);
  }
  function fallback(onFail){
    var addr=[val('address'),val('address_2'),val('city'),'TX',val('zip_code')].filter(Boolean).join(', '),desc=val('description',1500);
    var body=new URLSearchParams({'form-name':'ridgewood-quote',service:'Online booking: '+st.label,timing:'Picked '+when(st.slot)+' (online booking did not go through, please confirm)',
      town:val('city'),where:'Home',name:val('full_name'),phone:E.phone.value,email:val('email'),details:'Address: '+addr+(desc?'\n'+desc:''),page:location.pathname,company:''});
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()})
    .then(function(r){if(!r.ok)throw new Error(r.status);finish('request')}).catch(onFail);
  }
  f.addEventListener('submit',function(e){e.preventDefault();if(!st.slot){show(1);return}
    var p=usPhone(E.phone.value),ok=true;
    if(bad(E.full_name,!val('full_name')))ok=false;
    if(bad(E.phone,!p))ok=false;else E.phone.value=p;
    if(bad(E.email,!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(val('email'))))ok=false;
    if(bad(E.address,val('address').length<4))ok=false;
    if(bad(E.city,!val('city'))){townF.hidden=false;ok=false}
    if(bad(E.zip_code,!/^\d{5}$/.test(val('zip_code'))))ok=false;
    if(!ok){var first=f.querySelector('.fld.bad input');if(first)first.focus();return}
    if(E.company.value)return;  /* honeypot: bots fill it, people never see it */
    var label=btn.innerHTML;err.hidden=true;btn.disabled=true;btn.textContent='Booking…';
    function fail(msg){btn.disabled=false;btn.innerHTML=label;err.innerHTML=msg||('That didn\'t go through. Your answers are still here: try again, or call '+TEL+'.');err.hidden=false}
    if(!LIVE){setTimeout(function(){finish('dry')},500);return}
    var desc=val('description',1500);
    var body={full_name:val('full_name'),email:val('email'),phone:p,description:(desc?desc+'\n\n':'')+'Booked on '+location.hostname.replace(/^www\./,''),
      timezone:TZ,address:val('address'),city:val('city'),state:'TX',zip_code:val('zip_code'),address_2:val('address_2'),booking_portal_consent:false,
      start_date_time:st.slot.start_timestamp,end_date_time:st.slot.end_timestamp,service_id:st.svc,attach_invoice:true};
    if(st.slot.user_combinations)body.user_combinations=st.slot.user_combinations;
    fetch(API+'/request/'+CO,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){return r.json().catch(function(){return {error:true}}).then(function(j){j._status=r.status;return j})})
    .then(function(j){
      if(!j.error){finish('booked');return}
      if(j._status>=500||!j.errors){fallback(function(){fail()});return}
      var m=(j.errors||[]).join(' ');
      if(/slot|time|avail|book/i.test(m)){btn.disabled=false;btn.innerHTML=label;show(1);focusTop(steps[1]);slots('That time was just taken. Please pick another one.');return}
      fail(esc(m)+' Fix that and try again, or call '+TEL+'.');
    })
    .catch(function(){fallback(function(){fail()})});
  });
  show(0);
});
