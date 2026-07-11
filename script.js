(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const mobile = window.matchMedia("(max-width: 640px)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .set([".hero__content", ".collage-stage", ".scroll-cue"], { autoAlpha: 0 })
    .fromTo(".collage-stage", { autoAlpha: 0, scale: .94, y: 22 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.05 }, .08)
    .fromTo(".eyebrow", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .55 }, .28)
    .fromTo(".chrome-title__line", { autoAlpha: 0, y: -22 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .08 }, .34)
    .fromTo(".hero__subtitle", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .65 }, .58)
    .fromTo(".hero__copy", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .55 }, .68)
    .to(".hero__content", { autoAlpha: 1, duration: .01 }, .24)
    .to(".scroll-cue", { autoAlpha: 1, duration: .45 }, .9);

  if (!reduceMotion && window.ScrollTrigger) {
    gsap.to(".collage-frame", {
      scale: 1.045,
      yPercent: -2,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: .35
      }
    });

    gsap.to(".hero__content", {
      yPercent: -18,
      autoAlpha: .16,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "12% top",
        end: "68% top",
        scrub: .35
      }
    });

    gsap.to(".scroll-cue", {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: ".hero",
        start: "6% top",
        end: "14% top",
        scrub: .25
      }
    });

    gsap.utils.toArray(".reveal-block").forEach((el) => {
      gsap.from(el, {
        y: 42,
        autoAlpha: 0,
        duration: .85,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });

    gsap.utils.toArray(".memory-card").forEach((card, index) => {
      gsap.from(card, {
        y: 44,
        autoAlpha: 0,
        scale: .985,
        duration: .75,
        delay: (index % 3) * .05,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 90%", once: true }
      });
    });
  }

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const label = musicButton?.querySelector(".music-toggle__text");
    if (label) label.textContent = "Add anniversary-song.mp3";
  });

  if (finePointer && !reduceMotion) {
    document.body.classList.add("has-pointer");
    const glow = document.querySelector(".cursor-glow");
    const frame = document.querySelector(".collage-frame");
    const glowX = gsap.quickTo(glow, "x", { duration: .28, ease: "power2.out" });
    const glowY = gsap.quickTo(glow, "y", { duration: .28, ease: "power2.out" });
    const rotateX = gsap.quickTo(frame, "rotateX", { duration: .55, ease: "power3.out" });
    const rotateY = gsap.quickTo(frame, "rotateY", { duration: .55, ease: "power3.out" });
    const moveX = gsap.quickTo(frame, "x", { duration: .55, ease: "power3.out" });
    const moveY = gsap.quickTo(frame, "y", { duration: .55, ease: "power3.out" });
    let pointerRaf = 0;
    let latestX = 0;
    let latestY = 0;

    window.addEventListener("pointermove", (event) => {
      latestX = event.clientX;
      latestY = event.clientY;
      if (pointerRaf) return;
      pointerRaf = requestAnimationFrame(() => {
        glowX(latestX);
        glowY(latestY);
        const nx = latestX / innerWidth - .5;
        const ny = latestY / innerHeight - .5;
        rotateY(nx * 3.2);
        rotateX(ny * -3.2);
        moveX(nx * 6);
        moveY(ny * 5);
        pointerRaf = 0;
      });
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      rotateX(0);
      rotateY(0);
      moveX(0);
      moveY(0);
    });
  }

  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas?.getContext("2d", { alpha: true });
  let width = innerWidth;
  let height = innerHeight;
  let particles = [];
  let rafId = 0;
  let lastFrame = 0;
  const targetFrame = mobile ? 1000 / 24 : 1000 / 30;
  const colors = ["255,226,236", "247,180,205", "255,244,248", "218,157,179"];

  const makeParticles = () => {
    const counts = mobile
      ? { sparkle: 10, petal: 5, heart: 1, butterfly: 0 }
      : { sparkle: 24, petal: 10, heart: 3, butterfly: 1 };

    particles = Object.entries(counts).flatMap(([type, count]) =>
      Array.from({ length: count }, () => ({
        type,
        x: Math.random() * width,
        y: Math.random() * height,
        size: type === "sparkle" ? .7 + Math.random() * 1.2 : type === "petal" ? 2.5 + Math.random() * 3.2 : type === "heart" ? 4 + Math.random() * 4 : 5 + Math.random() * 4,
        speedY: type === "heart" ? -(5 + Math.random() * 7) : type === "butterfly" ? -2 + Math.random() * 4 : type === "petal" ? 8 + Math.random() * 12 : 1 + Math.random() * 4,
        speedX: type === "butterfly" ? 8 + Math.random() * 8 : -3 + Math.random() * 6,
        drift: Math.random() * Math.PI * 2,
        alpha: .1 + Math.random() * .24,
        twinkle: .5 + Math.random() * 1.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -.2 + Math.random() * .4,
        color: colors[Math.floor(Math.random() * colors.length)]
      }))
    );
  };

  const resizeCanvas = () => {
    width = innerWidth;
    height = innerHeight;
    const dpr = 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeParticles();
  };

  const drawParticle = (p, t) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `rgba(${p.color},.9)`;

    if (p.type === "sparkle") {
      const pulse = .55 + Math.sin(t * p.twinkle + p.drift) * .3;
      ctx.globalAlpha *= pulse;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "petal") {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.35, p.size * .58, .4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "heart") {
      ctx.scale(p.size / 10, p.size / 10);
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-8, -2, -5, -10, 0, -5);
      ctx.bezierCurveTo(5, -10, 8, -2, 0, 3);
      ctx.fill();
    } else {
      const flap = .7 + Math.sin(t * 4 + p.drift) * .3;
      ctx.beginPath();
      ctx.ellipse(-p.size * .32, 0, p.size * .4, p.size * .2, -.4 * flap, 0, Math.PI * 2);
      ctx.ellipse(p.size * .32, 0, p.size * .4, p.size * .2, .4 * flap, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const animate = (now) => {
    if (now - lastFrame < targetFrame) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    const delta = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    const t = now / 1000;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.speedY * delta;
      p.x += (p.speedX + Math.sin(t * .6 + p.drift) * (p.type === "petal" ? 3 : p.type === "butterfly" ? 5 : .7)) * delta;
      p.rotation += p.rotationSpeed * delta;

      if (p.type === "heart" && p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      } else if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;
      drawParticle(p, t);
    });

    rafId = requestAnimationFrame(animate);
  };

  if (!reduceMotion && canvas && ctx) {
    resizeCanvas();
    rafId = requestAnimationFrame(animate);
    let resizeTimer;
    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    }, { passive: true });
  } else {
    canvas?.remove();
  }

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion || !canvas) return;
    if (document.hidden) cancelAnimationFrame(rafId);
    else {
      lastFrame = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  });

  addEventListener("load", () => {
    document.body.classList.remove("is-loading");
    ScrollTrigger?.refresh();
  }, { once: true });
})();
