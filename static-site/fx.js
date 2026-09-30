// Digital Pragati animation layer.
// index.html loads this after the page's load event, together with the
// libraries in vendor/, and only when the visitor hasn't asked for reduced
// motion. The page is complete without it.
//   GSAP + ScrollTrigger: a reading-progress bar, section headings that rise
//     in word by word, sections that reveal as they scroll into view, service
//     icons that draw themselves, and the hero ridge drifting on scroll.
//   Motion: spring hover and press feedback, magnetic main buttons, a 3D tilt
//     on the concept phones, and a spring for the "Request received" panel.
// Only opacity and transforms are animated, so nothing shifts the layout.
(()=>{
  const {gsap,ScrollTrigger,Motion}=window;
  if(!gsap||!ScrollTrigger||!Motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.registerPlugin(ScrollTrigger);
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const below=el=>el.getBoundingClientRect().top>innerHeight;
  const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Reading progress: a thin accent bar along the top edge, tied to scroll.
  // It ignores the pointer, so it never sits in front of anything clickable.
  const bar=document.createElement('div');
  bar.setAttribute('aria-hidden','true');
  bar.style.cssText='position:fixed;left:0;right:0;top:0;height:3px;z-index:60;background:var(--accent);transform:scaleX(0);transform-origin:0 50%;pointer-events:none';
  document.body.append(bar);
  gsap.to(bar,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});

  // Header shadow once the page has scrolled.
  ScrollTrigger.create({start:24,end:'max',onToggle:s=>gsap.to('.top',{boxShadow:s.isActive?'0 8px 28px rgba(12,17,34,.10)':'0 0 0 rgba(12,17,34,0)',duration:.35})});

  // Scroll reveals. Anything already on screen or above it when this runs is
  // left alone, so nothing the visitor has seen blinks out and back in. Each
  // group fades up as it enters; jumping past a group (a menu link to #contact)
  // reveals it too, so scrolling back never finds blank space.
  const reveal=(targets,from,{stagger=.08,duration=.8,then}={})=>{
    const els=(typeof targets==='string'?$$(targets):targets).filter(below);
    if(!els.length)return;
    gsap.set(els,{opacity:0,...from});
    const show=batch=>{
      gsap.to(batch,{opacity:1,x:0,y:0,scale:1,rotate:0,duration,ease:'power3.out',stagger,overwrite:true,clearProps:'opacity,transform'});
      if(then)then(batch);
    };
    ScrollTrigger.batch(els,{start:'top 90%',once:true,onEnter:show,onLeave:show});
  };

  // Section headings rise in word by word. Words become inline-block spans
  // separated by the original spaces, so the text reads and wraps as before.
  $$('.sec-head h2, #contact-title').filter(below).forEach(h=>{
    const words=h.textContent.trim().split(/\s+/);
    h.textContent='';
    words.forEach((w,i)=>{
      const s=document.createElement('span');s.textContent=w;s.style.display='inline-block';
      h.append(s);if(i<words.length-1)h.append(' ');
    });
    reveal([...h.children],{y:'0.5em',rotate:4},{stagger:.04,duration:.7});
  });
  reveal('.sec-head .eyebrow, .sec-head .lede, .contact .eyebrow, .contact .lede',{y:20});
  reveal('.switch',{y:20});

  // Service cards, then their icons draw their outlines.
  const draw=cards=>cards.forEach((card,i)=>card.querySelectorAll('svg :is(path,rect,circle)').forEach(p=>{
    const len=p.getTotalLength();
    gsap.fromTo(p,{strokeDasharray:len,strokeDashoffset:len},{strokeDashoffset:0,duration:1.1,delay:.25+i*.1,ease:'power2.inOut',clearProps:'strokeDasharray,strokeDashoffset'});
  }));
  reveal('.svc',{y:44,scale:.97},{stagger:.1,then:draw});

  reveal('.carousel',{y:40});
  reveal('.pledge-wrap tbody tr',{x:-20},{stagger:.06});
  reveal('.pledge-note',{y:16});
  reveal('.steps li',{x:-28},{stagger:.1});
  reveal('.faq details',{y:18},{stagger:.05});
  reveal('.contact .promise li',{x:-20});
  reveal('#quote',{y:36});
  reveal('footer .wrap>*',{y:16});

  // Hero parallax: the mountain ridge sinks and fades a little as the hero
  // scrolls out, tied to the scroll position.
  gsap.to('.ridge',{y:48,opacity:.55,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6}});

  // Motion. Hover and press use the individual `translate` and `scale`
  // properties so they never fight GSAP's `transform` or the CSS hover lift.
  const {animate,hover,press,spring}=Motion;
  const soft={type:spring,stiffness:420,damping:26};
  hover('.svc, .pledge-wrap tbody tr, .steps li',el=>{
    animate(el,{translate:'0 -4px'},soft);
    return ()=>animate(el,{translate:'0 0'},soft);
  });
  press('.btn, .arrow, .dot, .switch button, .dock a',el=>{
    animate(el,{scale:.95},{type:spring,stiffness:600,damping:30});
    return ()=>animate(el,{scale:1},{type:spring,stiffness:500,damping:14});
  });

  if(fine){
    // Magnetic main buttons: they lean a little towards the mouse pointer.
    $$('#hero-cta, .top-cta, #submit').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        animate(el,{translate:`${(e.clientX-r.left-r.width/2)*.22}px ${(e.clientY-r.top-r.height/2)*.3}px`},{type:spring,stiffness:300,damping:18});
      });
      el.addEventListener('pointerleave',()=>animate(el,{translate:'0 0'},{type:spring,stiffness:300,damping:12}));
    });

    // Concept phones tilt in 3D with the pointer over the coloured stage.
    $$('.carousel .case-vis').forEach(stage=>{
      const phone=stage.querySelector('.phone');
      stage.addEventListener('pointermove',e=>{
        const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        animate(phone,{transform:`perspective(700px) rotateX(${(-y*12).toFixed(2)}deg) rotateY(${(x*16).toFixed(2)}deg)`},soft);
      });
      stage.addEventListener('pointerleave',()=>animate(phone,{transform:'perspective(700px) rotateX(0deg) rotateY(0deg)'},{type:spring,stiffness:260,damping:14}));
    });
  }

  // "Request received": the panel springs in when the form succeeds.
  const ok=$('#form-ok');
  if(ok)new MutationObserver(()=>{
    if(ok.hidden)return;
    animate(ok,{opacity:[0,1],scale:[.92,1]},{type:spring,stiffness:320,damping:20});
  }).observe(ok,{attributes:true,attributeFilter:['hidden']});
})();
