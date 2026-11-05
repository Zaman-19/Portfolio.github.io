// Shakik Zaman portfolio — static build interactions
(function () {
  "use strict";
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* =====================================================================
     CONFIG  —  শুধু এই ব্লকটাই তোমাকে হাত দিতে হবে (আর কিছু না)
     ---------------------------------------------------------------------
     programStartYear : ১ম বর্ষ শুরু করার সাল (session year)
     programYears     : ডিগ্রি কত বছরের
     graduationMonth  : কোন মাসের শেষে গ্র্যাজুয়েট (1–12)। 12 = ডিসেম্বরের শেষে
     skillsCountMode  : "categories" = প্রতিটা skill card (Programming, Database…) গোনে
                        "items"      = ভেতরের প্রতিটা chip গোনে
     projectsSuffix    : "" দিলে "3", "+" দিলে "3+" দেখাবে
     ===================================================================== */
  var CONFIG = {
    programStartYear: 2024,
    programYears: 4,
    graduationMonth: 12,
    skillsCountMode: "categories",
    projectsSuffix: "",
    skillsSuffix: ""
  };

  /* ---- Network canvases (hero interactive, footer faint) ---- */
  document.querySelectorAll("canvas").forEach(function (canvas, idx) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var interactive = idx === 0;
    var faint = idx !== 0;
    var width = 0, height = 0, nodes = [], t = 0;
    var pointer = { x: -9999, y: -9999 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.min(90, Math.round(width * height * 0.00009)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);
      var linkDist = Math.min(160, Math.max(90, width / 8));
      var alphaScale = faint ? 0.4 : 1;
      var i, j, n;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (!reduced) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        if (interactive) {
          var dx = n.x - pointer.x, dy = n.y - pointer.y;
          var d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.01) {
            n.x += (dx / d) * (130 - d) * 0.012;
            n.y += (dy / d) * (130 - d) * 0.012;
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var d2 = Math.hypot(a.x - b.x, a.y - b.y);
          if (d2 > linkDist) continue;
          var strength = 1 - d2 / linkDist;
          var travel = (Math.sin(t * 1.4 + (i + j) * 0.35) + 1) / 2;
          ctx.strokeStyle = "rgba(59, 130, 246, " + strength * 0.28 * alphaScale + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          if (!reduced && strength > 0.55) {
            var px = a.x + (b.x - a.x) * travel;
            var py = a.y + (b.y - a.y) * travel;
            ctx.fillStyle = "rgba(6, 182, 212, " + strength * 0.7 * alphaScale + ")";
            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var pulse = (Math.sin(t * 2 + n.phase) + 1) / 2;
        ctx.fillStyle = "rgba(124, 58, 237, " + (0.35 + pulse * 0.4) * alphaScale + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6 + pulse * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      });
      window.addEventListener("pointerleave", function () {
        pointer.x = -9999;
        pointer.y = -9999;
      });
    }
  });

  /* ---- Role cycler (typing effect) ---- */
  var ROLES = ["ICE Student", "Web Developer", "Frontend Developer", "Database Enthusiast", "Networking Learner"];
  var roleSpan = document.querySelector("span.text-gradient.absolute");
  if (roleSpan) {
    var rIndex = 0, rText = "", rDeleting = false;
    (function tick() {
      var full = ROLES[rIndex % ROLES.length];
      var done = rText === full;
      var delay;
      if (!rDeleting) {
        if (done) { rDeleting = true; delay = 1600; }
        else { rText = full.slice(0, rText.length + 1); delay = 70; }
      } else if (rText === "") {
        rDeleting = false;
        rIndex = (rIndex + 1) % ROLES.length;
        delay = 70;
      } else {
        rText = full.slice(0, rText.length - 1);
        delay = 40;
      }
      roleSpan.textContent = rText;
      setTimeout(tick, reduced ? 1600 : delay);
    })();
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll("[data-visible]");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.setAttribute("data-visible", "true");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.setAttribute("data-visible", "true"); });
  }

  /* =====================================================================
     AUTO CONTENT — সব সংখ্যা DOM + আজকের তারিখ থেকে নিজে নিজে বের হয়
     ===================================================================== */

  /* ---- helpers ---- */
  function ordinalSuffix(n) { return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"; }
  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el && el.textContent !== text) el.textContent = text;
  }

  /* ---- 1. Academic timeline (কোনো ম্যানুয়াল এডিট নেই) ---- */
  var NOW = new Date();
  var GRAD_YEAR = CONFIG.programStartYear + CONFIG.programYears - 1;
  // graduationMonth-এর পরের মাসের ১ তারিখ = গ্র্যাজুয়েশন হয়ে গেছে
  var GRAD_DATE = new Date(GRAD_YEAR, CONFIG.graduationMonth, 1);
  var GRADUATED = NOW >= GRAD_DATE;
  var ACADEMIC_YEAR = Math.min(
    Math.max(NOW.getFullYear() - CONFIG.programStartYear + 1, 1),
    CONFIG.programYears
  );
  var YEAR_LABEL = ACADEMIC_YEAR + ordinalSuffix(ACADEMIC_YEAR);
  var YEAR_WORD = ["", "first", "second", "third", "fourth", "fifth", "sixth"][ACADEMIC_YEAR] || YEAR_LABEL;

  /* ---- 2. Hero-র "I am a third-year ICE student at …" ---- */
  setText(
    "[data-hero-standing]",
    GRADUATED ? "a graduate of the ICE program at"
              : "a " + YEAR_WORD + "-year ICE student at"
  );

  /* ---- 3. Education card ---- */
  setText(
    "[data-edu-status]",
    GRADUATED ? "Graduated · " + GRAD_YEAR : "Current · " + YEAR_LABEL + " Year"
  );
  setText(
    "[data-grad-label]",
    (GRADUATED ? "Graduated: " : "Expected Graduation: ") + GRAD_YEAR
  );

  /* ---- 4. ফুটারের কপিরাইট বছর ---- */
  setText("[data-current-year]", String(NOW.getFullYear()));

  /* ---- 5. Projects / Skills সংখ্যা DOM থেকে গোনা ---- */
  function countProjects() {
    return document.querySelectorAll("#projects article").length ||
           document.querySelectorAll("[data-project-card]").length;
  }
  function countSkills() {
    var grid = document.querySelector("#skills .grid.gap-6");
    if (!grid) return 0;
    if (CONFIG.skillsCountMode === "items") {
      return grid.querySelectorAll("span.rounded-full").length;
    }
    // categories: protita card = 1 skill. "data-no-count" dile oi card bad jabe.
    var n = 0;
    Array.prototype.forEach.call(grid.children, function (card) {
      if (card.hasAttribute("data-no-count")) return;
      if (card.querySelector("h3")) n++;
    });
    return n;
  }

  var PROJECT_COUNT = countProjects();
  var SKILL_COUNT = countSkills();

  /* ---- 6. About stat cards — এখানেই সব একসাথে বসে ---- */
  var STAT_SPEC = {
    projects:   { num: PROJECT_COUNT, suffix: CONFIG.projectsSuffix },
    skills:     { num: SKILL_COUNT,   suffix: CONFIG.skillsSuffix },
    year:       GRADUATED ? { text: "Grad" }
                          : { num: ACADEMIC_YEAR, suffix: ordinalSuffix(ACADEMIC_YEAR) },
    graduation: { text: String(GRAD_YEAR) }
  };

  var statEls = document.querySelectorAll("[data-stat]");
  Array.prototype.forEach.call(statEls, function (el) {
    var spec = STAT_SPEC[el.getAttribute("data-stat")];
    if (!spec) return;
    // JS না চললেও HTML-এ যেটা লেখা আছে সেটাই দেখাবে; চললে এটা জেতে
    el.textContent = spec.text !== undefined ? spec.text : spec.num + spec.suffix;
  });

  /* ---- 7. কাউন্টার অ্যানিমেশন (শুধু scroll-এ দেখা গেলে) ---- */
  function animateCount(el, value, suffix) {
    var raw = String(el.textContent).replace(/[^0-9]/g, "");
    var from = raw ? parseInt(raw, 10) : 0;
    if (typeof requestAnimationFrame !== "function") { el.textContent = value + suffix; return; }
    var start = performance.now(), dur = 900;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var n = Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = n + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var animatable = Array.prototype.filter.call(statEls, function (el) {
    var spec = STAT_SPEC[el.getAttribute("data-stat")];
    return spec && spec.text === undefined && spec.num > 0;
  });

  if (animatable.length && "IntersectionObserver" in window && !reduced) {
    animatable.forEach(function (el) {
      var spec = STAT_SPEC[el.getAttribute("data-stat")];
      el.textContent = "0" + spec.suffix;
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var spec = STAT_SPEC[en.target.getAttribute("data-stat")];
        animateCount(en.target, spec.num, spec.suffix);
      });
    }, { threshold: 0.4 });
    animatable.forEach(function (el) { cio.observe(el); });
  }

  /* ---- 8. CV card: ফাইলের আসল size + last-updated নিজে পড়ে নেয় ---- */
  var cvMeta = document.querySelector("[data-cv-meta]");
  if (cvMeta && window.fetch) {
    fetch("Shakik-Zaman-CV.pdf", { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HEAD failed");
        var out = [];
        var len = parseInt(r.headers.get("content-length") || "", 10);
        if (len > 0) out.push(Math.round(len / 1024) + " KB");
        var lm = r.headers.get("last-modified");
        var d = lm ? new Date(lm) : null;
        if (d && !isNaN(d.getTime())) {
          out.push("updated " + (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear());
        }
        if (out.length) cvMeta.textContent = out.join(" · ");
      })
      .catch(function () { /* offline / file:// হলে HTML-এর লেখাটাই থাকবে */ });
  }

  /* =====================================================================
     9. projects.json → কার্ড
        (add-project.html দিয়ে বা হাতে এডিট করে প্রজেক্ট যোগ করবে)
        ফাইল না পেলে HTML-এ থাকা পুরনো কার্ডগুলোই থাকবে — সাইট ভাঙবে না।
     ===================================================================== */
  var ICON_CODE = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>';
  var ICON_LIVE = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>';
  var LINK_CLS = "inline-flex items-center gap-1.5 text-muted-foreground hover:text-accent";

  function esc(x) {
    return String(x == null ? "" : x)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function projectCardHTML(p, i) {
    var pic = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + ' preview" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"/>'
      : '<div class="grid h-full w-full place-items-center text-[10px] tracking-[0.22em] text-muted-foreground uppercase">No preview</div>';
    var links = "";
    if (p.github) links += '<a href="' + esc(p.github) + '" target="_blank" rel="noreferrer" class="' + LINK_CLS + '">' + ICON_CODE + ' Code</a>';
    if (p.demo)   links += '<a href="' + esc(p.demo)   + '" target="_blank" rel="noreferrer" class="' + LINK_CLS + '">' + ICON_LIVE + ' Live</a>';
    return '<div data-visible="false" style="transition-delay:' + (i * 90) + 'ms" class="reveal h-full">' +
             '<article class="glass h-full overflow-hidden rounded-2xl" style="transition:transform 260ms cubic-bezier(0.22, 1, 0.36, 1)">' +
               '<div class="relative aspect-[16/10] w-full overflow-hidden border-b border-border">' + pic + '</div>' +
               '<div class="p-6">' +
                 '<div class="flex items-start justify-between gap-3"><h3 class="font-display text-lg font-bold">' + esc(p.title) + '</h3></div>' +
                 '<p class="mt-2 text-sm leading-relaxed text-muted-foreground">' + esc(p.description) + '</p>' +
                 (links ? '<div class="mt-5 flex gap-4 text-sm">' + links + '</div>' : '') +
               '</div>' +
             '</article>' +
           '</div>';
  }

  function emptyProjectsHTML() {
    return '<div data-visible="true" class="reveal h-full sm:col-span-2 lg:col-span-3">' +
      '<div class="glass rounded-2xl px-6 py-16 text-center">' +
        '<p class="font-display font-bold">No projects yet</p>' +
        '<p class="mt-1 text-sm text-muted-foreground">projects.json-এ প্রজেক্ট যোগ করলে এখানে দেখাবে।</p>' +
      '</div></div>';
  }

  function refreshProjectCount() {
    var n = countProjects();
    STAT_SPEC.projects.num = n;
    var el = document.querySelector('[data-stat="projects"]');
    if (!el) return;
    if (reduced || typeof requestAnimationFrame !== "function") {
      el.textContent = n + CONFIG.projectsSuffix;
      return;
    }
    animateCount(el, n, CONFIG.projectsSuffix);
  }

  function paintProjects(html, empty) {
    var grid = document.querySelector("#projects .grid.gap-6");
    if (!grid) return;
    grid.innerHTML = empty ? emptyProjectsHTML() : html;
    Array.prototype.forEach.call(grid.children, function (el) {
      if ("IntersectionObserver" in window && !reduced && typeof io !== "undefined" && io) io.observe(el);
      else el.setAttribute("data-visible", "true");
    });
    refreshProjectCount();
  }

  /* projects.json থেকে পড়ে। ফাইলটা না থাকলে HTML-এর পুরনো কার্ডই থাকবে। */
  function loadProjects() {
    if (!window.fetch) return;
    fetch("projects.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) return;
        if (!list.length) { paintProjects("", true); return; }
        paintProjects(list.map(projectCardHTML).join(""), false);
      })
      .catch(function () { /* offline / file:// → HTML-এর কার্ডগুলোই থাকবে */ });
  }
  loadProjects();

  /* achievements.json → কার্ড (admin portal দিয়ে যোগ করলে এখানে দেখাবে) */
  function loadAchievements() {
    var box = document.querySelector("[data-achievements]");
    if (!box || !window.fetch) return;
    fetch("achievements.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) return;   // খালি হলে "No achievements" থাকবে
        box.innerHTML = '<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">' +
          list.map(function (a, i) {
            var link = a.link
              ? '<a href="' + esc(a.link) + '" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">' + ICON_LIVE + ' দেখো</a>'
              : "";
            return '<div data-visible="false" style="transition-delay:' + (i * 90) + 'ms" class="reveal h-full">' +
                     '<div class="glass hover-lift h-full rounded-2xl p-6">' +
                       '<h3 class="font-display text-lg font-bold">' + esc(a.title) + '</h3>' +
                       (a.date ? '<p class="mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">' + esc(a.date) + '</p>' : "") +
                       (a.description ? '<p class="mt-3 text-sm leading-relaxed text-muted-foreground">' + esc(a.description) + '</p>' : "") +
                       link +
                     '</div>' +
                   '</div>';
          }).join("") + '</div>';
        Array.prototype.forEach.call(box.querySelectorAll("[data-visible]"), function (el) {
          if ("IntersectionObserver" in window && !reduced && typeof io !== "undefined" && io) io.observe(el);
          else el.setAttribute("data-visible", "true");
        });
      })
      .catch(function () { /* না থাকলে / offline হলে খালি অবস্থাই থাকবে */ });
  }
  loadAchievements();

  /* ---- Nav: scrollspy, progress bar, mobile menu ---- */
  var LINKS = ["home","about","education","skills","services","projects","achievements","hobbies","cv","contact"];
  var header = document.querySelector("header");
  var progressBar = header && header.querySelector(".h-px");
  var menuBtn = header && header.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]');
  var desktopLinks = header ? header.querySelectorAll("ul.hidden a") : [];
  var mobileList = null;

  function setActive(id) {
    desktopLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.className = "rounded-md px-3 py-2 text-sm transition-colors " + (on ? "text-accent" : "text-muted-foreground hover:text-foreground");
    });
    if (mobileList) {
      mobileList.querySelectorAll("a").forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        a.className = "block py-2.5 text-sm " + (on ? "text-accent" : "text-muted-foreground");
      });
    }
  }

  function onScroll() {
    var max = document.body.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    var offset = window.scrollY + 120;
    var current = "home";
    LINKS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= offset) current = id;
    });
    setActive(current);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = !!mobileList;
      if (open) {
        mobileList.remove();
        mobileList = null;
        menuBtn.setAttribute("aria-label", "Open menu");
        menuBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';
      } else {
        mobileList = document.createElement("ul");
        mobileList.className = "border-t border-border px-5 pb-4 md:hidden";
        LINKS.forEach(function (id) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = "#" + id;
          a.textContent = id === "cv" ? "CV" : id.charAt(0).toUpperCase() + id.slice(1);
          a.className = "block py-2.5 text-sm text-muted-foreground";
          a.addEventListener("click", function () { menuBtn.click(); });
          li.appendChild(a);
          mobileList.appendChild(li);
        });
        menuBtn.parentNode.parentNode.insertBefore(mobileList, progressBar);
        menuBtn.setAttribute("aria-label", "Close menu");
        menuBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
        onScroll();
      }
    });
  }
})();

/* ---- Contact form (static): compose an email ---- */
(function () {
  var form = document.querySelector("#contact form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (sel) { var el = form.querySelector(sel); return el ? el.value.trim() : ""; };
    var name = v('input[name="name"], input[placeholder*="name" i], #name') || v("input");
    var inputs = form.querySelectorAll("input, textarea");
    var vals = Array.prototype.map.call(inputs, function (i) { return i.value.trim(); });
    var n = vals[0] || "", em = vals[1] || "", sub = vals[2] || "", msg = vals[3] || "";
    var body = "Name: " + n + "\nEmail: " + em + "\n\n" + msg;
    window.location.href = "mailto:shakikzaman066@gmail.com?subject=" +
      encodeURIComponent(sub || "Portfolio contact from " + n) + "&body=" + encodeURIComponent(body);
    form.reset();
  });
})();
