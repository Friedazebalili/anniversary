(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const mobileQuery = window.matchMedia("(max-width: 640px)");

  gsap.registerPlugin(ScrollTrigger);

  const lenis = prefersReducedMotion
    ? null
    : new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        anchors: true
      });

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .set([".hero__content", ".portrait-stage", ".scroll-cue"], { autoAlpha: 0 })
    .fromTo(".portrait-stage", { autoAlpha: 0, scale: 0.9, y: 35 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.45 }, 0.15)
    .fromTo(".eyebrow", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.45)
    .fromTo(".chrome-title__line", { autoAlpha: 0, y: -42 }, { autoAlpha: 1, y: 0, duration: 1.15, stagger: 0.12 }, 0.5)
    .fromTo(".hero__subtitle", { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.9)
    .to(".hero__content", { autoAlpha: 1, duration: 0.01 }, 0.4)
    .to(".scroll-cue", { autoAlpha: 1, duration: 0.8 }, 1.45);

  if (!prefersReducedMotion) {
    gsap.to(".portrait-stage", {
      yPercent: -8,
      scale: 0.94,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".hero__content", {
      yPercent: -24,
      autoAlpha: 0.18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "18% top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".scroll-cue", {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: ".hero",
        start: "8% top",
        end: "18% top",
        scrub: true
      }
    });

    gsap.utils.toArray(".reveal-block").forEach((element) => {
      gsap.from(element, {
        y: 70,
        autoAlpha: 0,
        duration: 1.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 82%",
          once: true
        }
      });
    });

    gsap.from(".reveal-card", {
      y: 70,
      autoAlpha: 0,
      rotateX: 7,
      stagger: 0.12,
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".story-grid",
        start: "top 80%",
        once: true
      }
    });
  }

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  if (isFinePointer && !prefersReducedMotion) {
    document.body.classList.add("has-pointer");
    const glow = document.querySelector(".cursor-glow");
    const frame = document.querySelector(".portrait-frame");
    const xTo = gsap.quickTo(glow, "x", { duration: 0.42, ease: "power3" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.42, ease: "power3" });

    window.addEventListener("pointermove", (event) => {
      xTo(event.clientX);
      yTo(event.clientY);

      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      gsap.to(frame, {
        rotateY: nx * 4.5,
        rotateX: ny * -4.5,
        x: nx * 10,
        y: ny * 8,
        duration: 1,
        ease: "power3.out",
        overwrite: "auto"
      });
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      gsap.to(frame, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 1.2, ease: "power3.out" });
    });
  }

  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particles = [];
  let rafId = 0;
  let lastTime = performance.now();

  const palette = [
    "255,226,236",
    "247,180,205",
    "255,244,248",
    "218,157,179"
  ];

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  };

  const createParticles = () => {
    const mobile = mobileQuery.matches;
    const sparkleCount = mobile ? 24 : 58;
    const petalCount = mobile ? 10 : 24;
    const total = sparkleCount + petalCount;

    particles = Array.from({ length: total }, (_, index) => {
      const isPetal = index >= sparkleCount;
      return {
        type: isPetal ? "petal" : "sparkle",
        x: Math.random() * width,
        y: Math.random() * height,
        size: isPetal ? 2.5 + Math.random() * 4.5 : 0.5 + Math.random() * 1.8,
        speedY: isPetal ? 10 + Math.random() * 18 : 2 + Math.random() * 8,
        speedX: isPetal ? -5 + Math.random() * 10 : -1 + Math.random() * 2,
        drift: Math.random() * Math.PI * 2,
        alpha: isPetal ? 0.16 + Math.random() * 0.34 : 0.16 + Math.random() * 0.44,
        twinkle: 0.5 + Math.random() * 1.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.35 + Math.random() * 0.7,
        color: palette[Math.floor(Math.random() * palette.length)]
      };
    });
  };

  const drawSparkle = (p, time) => {
    const pulse = 0.45 + Math.sin(time * p.twinkle + p.drift) * 0.35;
    ctx.save();
    ctx.globalAlpha = Math.max(0.06, p.alpha * pulse);
    ctx.fillStyle = `rgb(${p.color})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${p.color}, .85)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPetal = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `rgba(${p.color}, .9)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${p.color}, .35)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.62, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const animateParticles = (now) => {
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const time = now / 1000;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.speedY * delta;
      p.x += (p.speedX + Math.sin(time * 0.7 + p.drift) * (p.type === "petal" ? 6 : 1.2)) * delta;
      p.rotation += p.rotationSpeed * delta;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;

      if (p.type === "petal") drawPetal(p);
      else drawSparkle(p, time);
    });

    rafId = requestAnimationFrame(animateParticles);
  };

  if (!prefersReducedMotion) {
    resizeCanvas();
    rafId = requestAnimationFrame(animateParticles);
    window.addEventListener("resize", resizeCanvas, { passive: true });
  } else {
    canvas.remove();
  }

  document.addEventListener("visibilitychange", () => {
    if (prefersReducedMotion) return;
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastTime = performance.now();
      rafId = requestAnimationFrame(animateParticles);
    }
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  }, { once: true });
})();
