/* ============================================================
   YEEMS214.XYZ — shared page behaviour
   No dependencies. Everything here is progressive: without it the
   pages are complete and readable, just static. The 3D layer lives
   in scenes.js (an ES module) and never depends on this file.
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    root.classList.add('js');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ---------- nav: scrolled state + mobile sheet ---------- */
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');

    function onScroll() {
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setOpen(open) {
        if (!nav || !toggle) return;
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('nav-locked', open);
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            setOpen(!nav.classList.contains('is-open'));
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
        /* In-page links close the sheet; the scroll itself is native. */
        nav.querySelectorAll('.nav__links a').forEach(function (a) {
            a.addEventListener('click', function () { setOpen(false); });
        });
        /* Rotating a phone to landscape can cross the breakpoint with the
           sheet open, which would leave the body scroll-locked. */
        window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) {
            if (m.matches) setOpen(false);
        });
    }

    /* ---------- reveal on scroll ---------- */
    var revealables = document.querySelectorAll('[data-reveal], .meters');

    if ('IntersectionObserver' in window && !reduced.matches) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-in');
                io.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        revealables.forEach(function (el) { io.observe(el); });
    } else {
        revealables.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------- meters read their width from data-pct ---------- */
    document.querySelectorAll('.meter__fill[data-pct]').forEach(function (el) {
        el.style.setProperty('--pct', el.dataset.pct + '%');
    });

    /* ---------- counters ----------
       The real number is in the markup, so no-JS and screen readers get
       it straight away. JS only animates towards the value it already
       holds, once, when it scrolls into view. */
    var counters = document.querySelectorAll('[data-count]');

    function runCounter(el) {
        var target = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var dur = 1400;
        var t0 = performance.now();
        function tick(now) {
            var p = Math.min(1, (now - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 4);
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window && !reduced.matches) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                runCounter(e.target);
                cio.unobserve(e.target);
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { cio.observe(el); });
    }

    /* ---------- footer year ---------- */
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* ---------- loaded flag drives the hero title rise ---------- */
    function loaded() { document.body.classList.add('is-loaded'); }
    if (document.fonts && document.fonts.ready) {
        /* Never wait on fonts for more than a beat — a slow font CDN must
           not hold the headline hostage. */
        var done = false;
        var go = function () { if (!done) { done = true; loaded(); } };
        document.fonts.ready.then(go);
        setTimeout(go, 700);
    } else {
        loaded();
    }
})();
