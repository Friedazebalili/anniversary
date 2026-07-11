(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const mobileQuery = window.matchMedia("(max-width: 640px)");

  gsap.registerPlugin(ScrollTrigger);

  const lenis = reduceMotion ? null : new Lenis({ duration: 1.12, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1, anchors: true });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .set([".hero__content", ".collage-stage", ".scroll-cue"], { autoAlpha: 0 })
    .fromTo(".collage-stage", { autoAlpha: 0, scale: .88, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.5 }, .12)
    .fromTo(".eyebrow", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .75 }, .42)
    .fromTo(".chrome-title__line", { autoAlpha: 0, y: -36 }, { autoAlpha: 1, y: 0, duration: 1.05, stagger: .12 }, .5)
    .fromTo(".hero__subtitle", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .9 }, .86)
    .fromTo(".hero__copy", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .8 }, 1.02)
    .to(".hero__content", { autoAlpha: 1, duration: .01 }, .36)
    .to(".scroll-cue", { autoAlpha: 1, duration: .7 }, 1.35);

  if (!reduceMotion) {
    gsap.to(".collage-frame", {
      scale: 1.13,
      yPercent: -5,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__backdrop", {
      yPercent: 10,
      scale: 1.18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__content", {
      yPercent: -34,
      autoAlpha: .08,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "15% top", end: "70% top", scrub: true }
    });
    gsap.to(".scroll-cue", {
      autoAlpha: 0,
      scrollTrigger: { trigger: ".hero", start: "8% top", end: "18% top", scrub: true }
    });

    gsap.utils.toArray(".reveal-block").forEach(el => {
      gsap.from(el, { y: 68, autoAlpha: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    });

    gsap.utils.toArray(".memory-card").forEach((card, index) => {
      gsap.from(card, {
        y: 80,
        autoAlpha: 0,
        scale: .96,
        duration: 1.15,
        delay: (index % 3) * .08,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%", once: true }
      });
      gsap.to(card, {
        yPercent: index % 2 ? -5 : 5,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 }
      });
    });
  }

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const musicButton = document.querySelector(".music-toggle");
  const audio = document.getElementById("anniversary-audio");
  musicButton?.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        musicButton.classList.add("is-playing");
        musicButton.setAttribute("aria-pressed", "true");
        musicButton.querySelector(".music-toggle__text").textContent = "Pause our song";
      } else {
        audio.pause();
        musicButton.classList.remove("is-playing");
        musicButton.setAttribute("aria-pressed", "false");
        musicButton.querySelector(".music-toggle__text").textContent = "Play our song";
      }
    } catch {
      musicButton.querySelector(".music-toggle__text").textContent = "Add anniversary-song.mp3";
      musicButton.classList.remove("is-playing");
    }
  });
  audio?.addEventListener("error", () => {
    if (musicButton) musicButton.querySelector(".music-toggle__text").textContent = "Add anniversary-song.mp3";
  });

  if (finePointer && !reduceMotion) {
    document.body.classList.add("has-pointer");
    const glow = document.querySelector(".cursor-glow");
    const frame = document.querySelector(".collage-frame");
    const xTo = gsap.quickTo(glow, "x", { duration: .42, ease: "power3" });
    const yTo = gsap.quickTo(glow, "y", { duration: .42, ease: "power3" });

    window.addEventListener("pointermove", event => {
      xTo(event.clientX);
      yTo(event.clientY);
      const nx = event.clientX / window.innerWidth - .5;
      const ny = event.clientY / window.innerHeight - .5;
      gsap.to(frame, { rotateY: nx * 5, rotateX: ny * -5, x: nx * 11, y: ny * 9, duration: 1, ease: "power3.out", overwrite: "auto" });
    }, { passive: true });

    document.addEventListener("mouseleave", () => gsap.to(frame, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 1.1, ease: "power3.out" }));
  }

  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas?.getContext("2d", { alpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = innerWidth;
  let height = innerHeight;
  let particles = [];
  let rafId = 0;
  let lastTime = performance.now();

  const colors = ["255,226,236", "247,180,205", "255,244,248", "218,157,179"];
  const makeParticles = () => {
    const mobile = mobileQuery.matches;
    const sparkleCount = mobile ? 22 : 54;
    const petalCount = mobile ? 9 : 22;
    const heartCount = mobile ? 3 : 7;
    const butterflyCount = mobile ? 1 : 3;
    const counts = { sparkle: sparkleCount, petal: petalCount, heart: heartCount, butterfly: butterflyCount };
    particles = Object.entries(counts).flatMap(([type, count]) => Array.from({ length: count }, () => ({
      type,
      x: Math.random() * width,
      y: Math.random() * height,
      size: type === "sparkle" ? .6 + Math.random() * 1.7 : type === "petal" ? 2.5 + Math.random() * 4.5 : type === "heart" ? 4 + Math.random() * 6 : 5 + Math.random() * 6,
      speedY: type === "heart" ? -(6 + Math.random() * 10) : type === "butterfly" ? -3 + Math.random() * 6 : type === "petal" ? 10 + Math.random() * 18 : 2 + Math.random() * 7,
      speedX: type === "butterfly" ? 12 + Math.random() * 14 : -5 + Math.random() * 10,
      drift: Math.random() * Math.PI * 2,
      alpha: .12 + Math.random() * .38,
      twinkle: .5 + Math.random() * 1.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -.35 + Math.random() * .7,
      color: colors[Math.floor(Math.random() * colors.length)]
    })));
  };

  const resize = () => {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    makeParticles();
  };

  const drawSparkle = (p, t) => {
    const pulse = .45 + Math.sin(t * p.twinkle + p.drift) * .35;
    ctx.save(); ctx.globalAlpha = Math.max(.05,p.alpha * pulse); ctx.fillStyle = `rgb(${p.color})`; ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${p.color},.85)`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.restore();
  };
  const drawPetal = p => {
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.alpha; ctx.fillStyle = `rgba(${p.color},.9)`; ctx.beginPath(); ctx.ellipse(0,0,p.size*1.45,p.size*.62,.4,0,Math.PI*2); ctx.fill(); ctx.restore();
  };
  const drawHeart = p => {
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation); ctx.scale(p.size/10,p.size/10); ctx.globalAlpha = p.alpha; ctx.fillStyle = `rgba(${p.color},.7)`; ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${p.color},.5)`; ctx.beginPath(); ctx.moveTo(0,3); ctx.bezierCurveTo(-8,-2,-5,-10,0,-5); ctx.bezierCurveTo(5,-10,8,-2,0,3); ctx.fill(); ctx.restore();
  };
  const drawButterfly = (p,t) => {
    const flap = .65 + Math.sin(t*5+p.drift)*.35;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.sin(t+p.drift)*.25); ctx.globalAlpha = p.alpha; ctx.fillStyle = `rgba(${p.color},.7)`; ctx.beginPath(); ctx.ellipse(-p.size*.35,0,p.size*.45,p.size*.22,-.45*flap,0,Math.PI*2); ctx.ellipse(p.size*.35,0,p.size*.45,p.size*.22,.45*flap,0,Math.PI*2); ctx.fill(); ctx.restore();
  };

  const animate = now => {
    const delta = Math.min((now-lastTime)/1000,.05); lastTime = now; const t = now/1000; ctx.clearRect(0,0,width,height);
    particles.forEach(p => {
      p.y += p.speedY * delta;
      p.x += (p.speedX + Math.sin(t*.7+p.drift)*(p.type === "petal" ? 6 : p.type === "butterfly" ? 8 : 1.2)) * delta;
      p.rotation += p.rotationSpeed * delta;
      if (p.type === "heart" && p.y < -30) { p.y = height+30; p.x = Math.random()*width; }
      else if (p.y > height+30) { p.y = -30; p.x = Math.random()*width; }
      if (p.x < -40) p.x = width+40; if (p.x > width+40) p.x = -40;
      if (p.type === "sparkle") drawSparkle(p,t); else if (p.type === "petal") drawPetal(p); else if (p.type === "heart") drawHeart(p); else drawButterfly(p,t);
    });
    rafId = requestAnimationFrame(animate);
  };

  if (!reduceMotion && canvas && ctx) {
    resize(); rafId = requestAnimationFrame(animate); addEventListener("resize", resize, { passive: true });
  } else canvas?.remove();

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion || !canvas) return;
    if (document.hidden) cancelAnimationFrame(rafId); else { lastTime = performance.now(); rafId = requestAnimationFrame(animate); }
  });

  addEventListener("load", () => {
    document.body.classList.remove("is-loading");
    ScrollTrigger.refresh();
  }, { once: true });
})();
