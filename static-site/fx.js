// Digital Pragati animation layer.
// index.html loads this after the page's load event, together with the
// libraries in vendor/, and only when the visitor hasn't asked for reduced
// motion. The page is complete without it.
//   GSAP + ScrollTrigger: sections reveal as they scroll into view, and the
//     hero ridge drifts as the hero scrolls away.
//   Motion: spring feedback when buttons and cards are hovered or pressed.
// Only opacity and transforms are animated, so nothing shifts the layout.
(()=>{
  const {gsap,ScrollTrigger,Motion}=window;
  if(!gsap||!ScrollTrigger||!Motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.registerPlugin(ScrollTrigger);
  const $$=s=>[...document.querySelectorAll(s)];

  // Scroll reveals. Anything already on screen or above it when this runs is
  // left alone, so nothing the visitor has seen blinks out and back in. Each
  // group fades up as it enters; jumping past a group (a menu link to #contact)
  // reveals it too, so scrolling back never finds blank space.
  const reveal=(selector,from,stagger=.08)=>{
    const els=$$(selector).filter(el=>el.getBoundingClientRect().top>innerHeight);
    if(!els.length)return;
    gsap.set(els,{opacity:0,...from});
    const show=batch=>gsap.to(batch,{opacity:1,x:0,y:0,scale:1,duration:.8,ease:'power3.out',stagger,overwrite:true,clearProps:'opacity,transform'});
    ScrollTrigger.batch(els,{start:'top 90%',once:true,onEnter:show,onLeave:show});
  };
  reveal('.sec-head>*',{y:28});
  reveal('.switch',{y:20});
  reveal('.svc',{y:44,scale:.97},.1);
  reveal('.carousel',{y:40});
  reveal('.pledge-wrap tbody tr',{x:-20},.06);
  reveal('.pledge-note',{y:16});
  reveal('.steps li',{x:-28},.1);
  reveal('.faq details',{y:18},.05);
  reveal('.contact .promise li',{x:-20},.08);
  reveal('#quote',{y:36});
  reveal('footer .wrap>*',{y:16});

  // Hero parallax: the mountain ridge sinks and fades a little as the hero
  // scrolls out, tied to the scroll position.
  gsap.to('.ridge',{y:48,opacity:.55,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6}});

  // Hover and press feedback. Uses the individual `translate` and `scale`
  // properties so it never fights GSAP's `transform` or the CSS hover lift.
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
})();
