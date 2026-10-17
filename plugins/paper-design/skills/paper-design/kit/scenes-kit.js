/* ============================================================
   PAPER / SCENES KIT — Three.js on paper
   ============================================================
   The runtime and furniture every paper 3D background shares:
     - renderer cleared to the page's paper colour, NeutralToneMapping,
       RoomEnvironment PMREM, soft-shadowed key light, and a
       ShadowMaterial ground so shadows fall on the page itself
     - device tier (LOW): phones / coarse pointers / <=4 cores get
       MeshStandardMaterial, 1024 shadow maps, DPR cap 1.5
     - quality ladder that stops descending when a cut does not help
     - prefers-reduced-motion and data-paper-motion="reduce": a still
       frame. Time and the scroll camera stay put. The canvas still fades in
     - data-scene="hero" (hero and login): the scene keeps moving while
       its hero section is on screen. Other scenes sleep 1.2s after input
     - the hero section leaving the viewport, a hidden tab, or a faded
       canvas pauses the loop. It resumes when the hero comes back
     - data-paper-effects="reduce": shadows off, canvas hidden in CSS
     - large frame deltas are clamped to 50ms so a backgrounded tab
       cannot jump the camera
     - a second WebGL context on the page is refused
     - hidden tab / faded-out canvas: the loop sleeps
     - no WebGL or a lost context: the canvas stays hidden; the page
       must be complete without it. dispose() releases the GPU resources

   Usage:
     import { mountScene, field, desk } from './scenes-kit.js';
     mountScene(canvas, canvas.dataset.sceneKind === 'desk' ? desk : field);
   field is the hero banner. desk is the sign-in still life.
   data-fade="hero" fades the canvas across one viewport of scroll.

   Three.js is vendored next to this file (vendor/three.module.min.js,
   MIT). Hero and login pages import this module directly. No CDN and
   no inline import map.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const PAPER = new THREE.Color('#f5f2eb');
const PAPER_HI = new THREE.Color('#fbf9f4');
const PAPER_LO = new THREE.Color('#e7e1d4');
const INK = new THREE.Color('#2a2824');
const ACCENT = new THREE.Color('#d2462f');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
};
/* Deterministic, so a reload composes the same picture. */
function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
}

/* ------------------------------------------------------------
   Shared furniture
   ------------------------------------------------------------ */

/* Device tier, decided once. Phones and small GPUs get the standard
   material (no clearcoat or sheen lobes), half the shadow map and fewer
   instances — the composition is the same, the per-pixel cost is not. */
const LOW = window.matchMedia('(max-width: 760px)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    (navigator.hardwareConcurrency || 8) <= 4;

function paperMaterial(color, opts = {}) {
    if (LOW) {
        const { clearcoat, clearcoatRoughness, sheen, sheenRoughness, sheenColor, ...rest } = opts;
        void clearcoat; void clearcoatRoughness; void sheen; void sheenRoughness; void sheenColor;
        return new THREE.MeshStandardMaterial({
            color, roughness: 0.6, metalness: 0, envMapIntensity: 0.6, ...rest
        });
    }
    return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.58,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.5,
        sheen: 0.4,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color('#fff4e0'),
        envMapIntensity: 0.45,
        ...opts
    });
}

function addLights(scene, low, extent) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d0bd, 0.5));

    const key = new THREE.DirectionalLight(0xfff3e2, 2.7);
    key.position.set(-extent * 0.55, extent * 1.1, extent * 0.45);
    key.castShadow = true;
    key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
    const c = key.shadow.camera;
    c.left = -extent; c.right = extent; c.top = extent; c.bottom = -extent;
    c.near = 1; c.far = extent * 4;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.03;
    scene.add(key);
    scene.add(key.target);

    const rim = new THREE.DirectionalLight(0xe8eeff, 0.5);
    rim.position.set(extent, extent * 0.4, -extent);
    scene.add(rim);
    return key;
}

/* The ground is a shadow catcher, not a surface: it draws nothing but
   the shadow, so the sheet under the objects is the page itself. */
function addGround(scene, y = 0, opacity = 0.16) {
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(600, 600),
        new THREE.ShadowMaterial({ color: 0x3a3024, opacity })
    );
    g.rotation.x = -Math.PI / 2;
    g.position.y = y;
    g.receiveShadow = true;
    scene.add(g);
    return g;
}

/* ------------------------------------------------------------
   FIELD — landing page. A city of columns breathing in slow
   waves; the pointer drops a ripple into it. Scroll lifts the
   camera towards plan view and calms the surface, so below the
   hero it settles into a quiet ground for the text.
   ------------------------------------------------------------ */
function field({ scene, camera, low, state }) {
    const N = low ? 26 : 44;
    const count = N * N;
    const half = (N - 1) / 2;

    const geo = new RoundedBoxGeometry(0.84, 1, 0.84, 2, 0.05);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(geo, paperMaterial(0xffffff), count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    const col = new THREE.Color();
    const cells = new Float32Array(count * 3);   // x, z, radial falloff
    for (let i = 0; i < count; i++) {
        const ix = i % N, iz = (i / N) | 0;
        const x = ix - half, z = iz - half;
        const edge = smooth(half + 0.5, half - 7, Math.max(Math.abs(x), Math.abs(z)));
        cells[i * 3] = x; cells[i * 3 + 1] = z; cells[i * 3 + 2] = edge;

        const r = hash(i + 7);
        if (r < 0.009) col.copy(ACCENT);
        else if (r < 0.022) col.copy(INK);
        else col.copy(PAPER_HI).lerp(PAPER_LO, hash(i * 3.1) * 0.8);
        mesh.setColorAt(i, col);
    }
    scene.add(mesh);

    /* A few larger sheets sit in the banner, beside the type on desktop.
       Phones keep the field alone. */
    const sheets = [];
    if (!low) {
        const specs = [
            { size: [2.6, 0.07, 3.4], at: [8.4, 1.15, -1.4], rot: 0.18, color: PAPER_HI },
            { size: [1.9, 0.07, 2.5], at: [9.6, 1.4, 1.15], rot: -0.22, color: PAPER },
            { size: [0.7, 0.45, 0.7], at: [7.1, 0.85, 2.2], rot: 0.4, color: INK }
        ];
        specs.forEach((spec) => {
            const sheet = new THREE.Mesh(
                new RoundedBoxGeometry(spec.size[0], spec.size[1], spec.size[2], 2, 0.04),
                paperMaterial(spec.color)
            );
            sheet.position.set(spec.at[0], spec.at[1], spec.at[2]);
            sheet.rotation.y = spec.rot;
            sheet.castShadow = true;
            sheet.receiveShadow = true;
            scene.add(sheet);
            sheets.push({ mesh: sheet, base: spec.at[1] });
        });
        const seal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24),
            paperMaterial(ACCENT, { roughness: 0.4 })
        );
        seal.position.set(8.7, 1.62, 0.15);
        seal.castShadow = true;
        scene.add(seal);
        sheets.push({ mesh: seal, base: 1.62 });
    }

    addGround(scene, 0, 0.14);
    const key = addLights(scene, low, 30);
    key.position.set(-18, 34, 14);

    scene.fog = new THREE.Fog(PAPER, 40, 95);

    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const target = new THREE.Vector3();
    let rx = 999, rz = 999, rAmp = 0, rT = 0;
    let lastPX = 0, lastPY = 0;

    return {
        update(t, dt) {
            const hp = state.hp;
            const narrow = state.aspect < 1;

            /* ---- camera: oblique over the field, rising to plan view on scroll */
            const az = 0.72 + hp * 0.5 + state.px * 0.06;
            const pol = lerp(narrow ? 0.95 : 1.02, 0.42, smooth(0, 1, hp)) - state.py * 0.04;
            const dist = lerp(narrow ? 46 : 40, 58, hp);
            target.set(narrow ? 0 : -5.5, 0, narrow ? 4 : 2.5);
            camera.position.set(
                target.x + dist * Math.sin(pol) * Math.cos(az),
                dist * Math.cos(pol),
                target.z + dist * Math.sin(pol) * Math.sin(az)
            );
            camera.lookAt(target);

            /* ---- pointer ripple: a fresh drop whenever the pointer moves */
            if (state.pointerActive && (Math.abs(state.rawPX - lastPX) + Math.abs(state.rawPY - lastPY)) > 0.01) {
                ray.setFromCamera({ x: state.rawPX, y: -state.rawPY }, camera);
                if (ray.ray.intersectPlane(plane, hit)) {
                    rx = lerp(rx === 999 ? hit.x : rx, hit.x, 0.35);
                    rz = lerp(rz === 999 ? hit.z : rz, hit.z, 0.35);
                    rAmp = Math.min(1.6, rAmp + 0.12);
                    rT = t;
                }
                lastPX = state.rawPX; lastPY = state.rawPY;
            }
            rAmp *= Math.exp(-dt * 0.9);

            const amp = lerp(1, 0.28, smooth(0, 1, hp));
            const m = mesh.instanceMatrix.array;
            for (let i = 0; i < count; i++) {
                const x = cells[i * 3], z = cells[i * 3 + 1], edge = cells[i * 3 + 2];
                let h = 0.9
                    + 0.85 * Math.sin(x * 0.21 + t * 0.55) * Math.cos(z * 0.17 - t * 0.42)
                    + 0.45 * Math.sin((x + z) * 0.11 + t * 0.31)
                    + 0.25 * Math.sin(x * 0.63 - z * 0.47 + t * 0.9);
                h = 0.2 + amp * Math.max(0, h) * 2.1;
                if (rAmp > 0.01) {
                    const d = Math.hypot(x - rx, z - rz);
                    h += rAmp * Math.sin(d * 0.9 - (t - rT) * 4.5) * Math.exp(-d * 0.16) * 0.9;
                }
                h = Math.max(0.06, h * edge + 0.06);
                const o = i * 16;
                m[o] = 1; m[o + 1] = 0; m[o + 2] = 0; m[o + 3] = 0;
                m[o + 4] = 0; m[o + 5] = h; m[o + 6] = 0; m[o + 7] = 0;
                m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = 1; m[o + 11] = 0;
                m[o + 12] = x; m[o + 13] = 0; m[o + 14] = z; m[o + 15] = 1;
            }
            mesh.instanceMatrix.needsUpdate = true;
            sheets.forEach((sheet, index) => {
                sheet.mesh.position.y = sheet.base + Math.sin(t * 0.45 + index) * 0.05;
            });
        }
    };
}

/* ------------------------------------------------------------
   DESK — sign-in. A short stack of sheets and one vermilion seal.
   It sits to the left on a wide screen so the form card stays clear.
   ------------------------------------------------------------ */
function desk({ scene, camera, low, state }) {
    const group = new THREE.Group();
    const specs = [
        { size: [3.1, 0.08, 4.1], at: [0.2, 0.16, 0], rot: -0.42, color: PAPER_HI },
        { size: [2.7, 0.08, 3.5], at: [0.55, 0.34, 0.15], rot: -0.12, color: PAPER },
        { size: [2.1, 0.08, 2.7], at: [0.15, 0.52, -0.1], rot: 0.22, color: PAPER_LO }
    ];
    specs.forEach((spec) => {
        const sheet = new THREE.Mesh(
            new RoundedBoxGeometry(spec.size[0], spec.size[1], spec.size[2], 2, 0.03),
            paperMaterial(spec.color)
        );
        sheet.position.set(spec.at[0], spec.at[1], spec.at[2]);
        sheet.rotation.y = spec.rot;
        sheet.castShadow = true;
        sheet.receiveShadow = true;
        group.add(sheet);
    });
    const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.06, low ? 12 : 28),
        paperMaterial(ACCENT, { roughness: 0.38 })
    );
    seal.position.set(0.85, 0.66, 0.35);
    seal.castShadow = true;
    group.add(seal);
    const clip = new THREE.Mesh(
        new RoundedBoxGeometry(0.16, 0.42, 1.05, 2, 0.04),
        paperMaterial(INK)
    );
    clip.position.set(-1.15, 0.42, 0.7);
    clip.rotation.y = 0.3;
    clip.castShadow = true;
    group.add(clip);
    scene.add(group);
    addGround(scene, 0, 0.18);
    const key = addLights(scene, low, 10);
    key.position.set(-5, 9, 5);
    scene.fog = new THREE.Fog(PAPER, 14, 36);
    const look = new THREE.Vector3();

    return {
        update(t) {
            const narrow = state.aspect < 1;
            const bob = Math.sin(t * 0.5) * 0.03;
            group.rotation.y = Math.sin(t * 0.32) * 0.12;
            /* Wide: park the stack in the open left column. Narrow: drop it
               into the stage band under the copy. */
            group.position.set(narrow ? 0 : -2.8, (narrow ? -0.85 : 0) + bob, narrow ? 0.4 : 0);
            look.set(narrow ? 0.15 : -0.4, narrow ? 1.35 : 0.45, 0);
            const dist = narrow ? 14.5 : 11;
            camera.position.set(look.x + dist * 0.18, narrow ? 6.4 : 4.4, dist);
            camera.lookAt(look);
        }
    };
}

/* ------------------------------------------------------------
   Runtime
   ------------------------------------------------------------ */
/**
 * Mount a paper scene on a fixed background canvas.
 *   canvas: <canvas class="scene" aria-hidden="true" [data-fade="hero"]>
 *   make:   ({ THREE, scene, camera, renderer, low, state }) => { update(t, dt) }
 *           state = { hp (hero progress 0-1), sp (page progress 0-1),
 *                     px/py (smoothed pointer -1..1), rawPX/rawPY,
 *                     pointerActive, aspect }
 */
export function mountScene(canvas, make) {
    const idle = { dispose() {}, wake() {} };
    function showFallback() {
        if (!canvas) return;
        canvas.classList.remove('is-ready');
        canvas.dataset.sceneState = 'unavailable';
        const fallback = document.querySelector('[data-scene-fallback]');
        if (fallback) fallback.hidden = false;
    }
    if (!canvas || !make) return idle;

    const host = window;
    host.__paperWebGL = host.__paperWebGL || { n: 0 };
    if (host.__paperWebGL.n >= 1) {
        canvas.dataset.sceneState = 'skipped';
        return idle;
    }
    host.__paperWebGL.n += 1;

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const low = LOW;
    const rootEl = document.documentElement;
    /* "hero" pages fade the scene out as the hero scrolls away and stop
       rendering once it is gone; the rest keep it as a dimmed ground. */
    const fadeMode = canvas.dataset.fade || 'dim';
    const heroScene = canvas.dataset.scene === 'hero';

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true
        });
    } catch (e) {
        host.__paperWebGL.n = Math.max(0, host.__paperWebGL.n - 1);
        showFallback();
        return idle;     // no WebGL: the page is complete without us
    }

    const dprCap = low ? 1.5 : 2;
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(PAPER, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = PAPER;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);

    const state = {
        hp: 0, sp: 0, px: 0, py: 0,
        rawPX: 0, rawPY: 0, pointerActive: false,
        aspect: 1
    };
    const target = { hp: 0, sp: 0, px: 0, py: 0 };

    let view;
    try {
        view = make({ THREE, scene, camera, renderer, low, state });
    } catch (e) {
        renderer.dispose();
        if (envTex) envTex.dispose();
        host.__paperWebGL.n = Math.max(0, host.__paperWebGL.n - 1);
        showFallback();
        return idle;
    }

    let disposed = false;
    let running = false;
    let frameId = 0;
    let last = 0;
    let t = 0;
    let dirty = true;
    let shown = false;
    let lastActivity = 0;
    let ro = null;
    let heroVisible = true;
    let heroObserver = null;
    const IDLE_GRACE = 1200;

    function motionOff() {
        return mqReduced.matches || rootEl.dataset.paperMotion === 'reduce';
    }
    function effectsOff() {
        return rootEl.dataset.paperEffects === 'reduce';
    }
    function setQuality(label) {
        canvas.dataset.sceneQuality = label;
        const note = document.querySelector('[data-scene-quality-note]');
        if (note) note.textContent = label === 'full' ? '' : 'Simplified graphics';
    }
    setQuality('full');

    function shadowsOn(rungNow) {
        const on = !effectsOff() && rungNow < 2;
        if (renderer.shadowMap.enabled !== on) {
            renderer.shadowMap.enabled = on;
            scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
        }
    }

    function stopLoop() {
        running = false;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        last = 0;
    }

    function wake() {
        if (disposed || document.hidden || effectsOff() || !heroVisible) return;
        dirty = true;
        lastActivity = performance.now();
        if (!running) {
            running = true;
            last = 0;
            frameId = requestAnimationFrame(frame);
        }
    }

    /* ---- sizing: measure the canvas, which CSS pins to the large
       viewport so a mobile URL bar sliding in and out never resizes the
       drawing buffer mid-scroll. */
    function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        state.aspect = camera.aspect;
        camera.fov = camera.aspect < 1 ? 44 : 30;
        camera.updateProjectionMatrix();
        wake();
    }

    function readScroll() {
        const vh = window.innerHeight || 1;
        const max = Math.max(1, document.documentElement.scrollHeight - vh);
        target.hp = clamp(window.scrollY / vh, 0, 1);
        target.sp = clamp(window.scrollY / max, 0, 1);
        wake();
    }

    function onPointerMove(e) {
        if (e.pointerType === 'touch') return;
        state.rawPX = (e.clientX / window.innerWidth) * 2 - 1;
        state.rawPY = (e.clientY / window.innerHeight) * 2 - 1;
        target.px = state.rawPX;
        target.py = state.rawPY;
        state.pointerActive = true;
        wake();
    }
    function onPointerLeave() { state.pointerActive = false; }
    function onVisibility() {
        if (document.hidden) stopLoop();
        else wake();
    }
    function onContextLost(e) {
        e.preventDefault();
        stopLoop();
        canvas.style.opacity = '0';
        showFallback();
    }
    let rung = 0;
    function onPreference() {
        stopLoop();
        shadowsOn(rung);
        wake();
    }
    const attrObserver = new MutationObserver(onPreference);

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    if ('ResizeObserver' in window) {
        ro = new ResizeObserver(resize);
        ro.observe(canvas);
    } else {
        window.addEventListener('resize', resize);
    }
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);
    mqReduced.addEventListener('change', onPreference);
    attrObserver.observe(rootEl, { attributes: true, attributeFilter: ['data-paper-motion', 'data-paper-effects'] });

    const hero = document.querySelector('.page-hero, .hero');
    if (hero && 'IntersectionObserver' in window) {
        heroObserver = new IntersectionObserver((entries) => {
            heroVisible = entries.some((entry) => entry.isIntersecting);
            canvas.dataset.sceneVisible = heroVisible ? 'true' : 'false';
            if (!heroVisible) stopLoop();
            else wake();
        }, { threshold: 0 });
        heroObserver.observe(hero);
    }

    /* ---- quality ladder: step down when frames stay slower than 33ms
       across a 2s window, and stop if a cut does not help. */
    let sampleT = 0, sampleN = 0, sampleSum = 0, lastMean = Infinity, warm = 0;
    function adapt(dtMs) {
        if (motionOff() || effectsOff()) return;
        warm += dtMs;
        if (warm < 2000 || rung >= 3) return;
        sampleSum += dtMs; sampleN++; sampleT += dtMs;
        if (sampleT < 2000) return;
        const mean = sampleSum / sampleN;
        sampleT = 0; sampleN = 0; sampleSum = 0;
        if (mean < 33) return;
        if (mean > lastMean * 0.92 && rung > 0) { rung = 3; return; }  // cut did nothing: stop
        lastMean = mean;
        rung++;
        if (rung === 1) {
            dpr = Math.max(1, dpr * 0.75);
            setQuality('reduced');
        }
        if (rung === 2) {
            dpr = 1;
            setQuality('reduced');
        }
        if (rung === 3) {
            dpr = 0.75;
            setQuality('minimal');
        }
        shadowsOn(rung);
        renderer.setPixelRatio(dpr);
        resize();
    }

    function frame(now) {
        frameId = 0;
        if (disposed || document.hidden || effectsOff()) { running = false; return; }
        const reduced = motionOff();
        const dtMs = last ? Math.min(50, now - last) : 16;
        last = now;
        const dt = dtMs / 1000;
        if (!reduced) t += dt;
        /* A reduced-motion scene is a still frame at the rest camera.
           Scroll and the pointer do not travel it. */
        if (reduced) {
            target.hp = 0;
            target.sp = 0;
            target.px = 0;
            target.py = 0;
        }

        const k = 1 - Math.exp(-dt * (reduced ? 30 : 4));
        state.hp += (target.hp - state.hp) * k;
        state.sp += (target.sp - state.sp) * k;
        state.px += (target.px - state.px) * (1 - Math.exp(-dt * 2.5));
        state.py += (target.py - state.py) * (1 - Math.exp(-dt * 2.5));

        let opacity = 1;
        if (fadeMode === 'hero') {
            opacity = clamp(1 - state.hp * 1.25, 0, 1);
            /* A phone has no free band beside the copy; keep it quieter. */
            if (state.aspect < 1) opacity *= 0.6;
        }
        else opacity = 1 - (state.aspect < 1 ? 0.55 : 0.4) * smooth(0, 1, state.hp);
        if (shown) canvas.style.opacity = opacity.toFixed(3);

        const settling = Math.abs(target.hp - state.hp) + Math.abs(target.sp - state.sp) +
            Math.abs(target.px - state.px) + Math.abs(target.py - state.py) > 0.0005;
        const since = now - lastActivity;
        /* Hero and login scenes stay in motion while the tab is visible.
           Every other scene settles, then sleeps. Reduced motion never
           travels: the canvas fade is CSS opacity. */
        const decorate = !reduced && (heroScene || since < IDLE_GRACE);

        if (opacity > 0.005 && (dirty || settling || decorate)) {
            view.update(t, reduced ? 0 : dt);
            renderer.render(scene, camera);
            dirty = false;
            if (!shown) {
                shown = true;
                canvas.classList.add('is-ready');
                canvas.dataset.sceneState = 'ready';
                /* CSS fade is --dur-enter (480ms). Taking over sooner
                   would clip it, including the reduced-motion fade. */
                const FADE_HOLD = 520;
                setTimeout(() => { if (!disposed) canvas.style.transition = 'none'; }, FADE_HOLD);
            }
            if (!reduced) adapt(dtMs);
        }

        /* Sleep once the camera has settled and nobody is interacting.
           Reduced motion never keeps a decorative loop alive. */
        if ((reduced && !settling && !dirty) || (opacity <= 0.005 && !settling) || (!decorate && !settling && !dirty)) {
            running = false;
            return;
        }
        frameId = requestAnimationFrame(frame);
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        stopLoop();
        window.removeEventListener('scroll', readScroll);
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        mqReduced.removeEventListener('change', onPreference);
        if (ro) ro.disconnect();
        if (heroObserver) heroObserver.disconnect();
        attrObserver.disconnect();
        scene.traverse((o) => {
            if (o.geometry && o.geometry.dispose) o.geometry.dispose();
            if (!o.material) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => { if (m && m.dispose) m.dispose(); });
        });
        if (envTex && envTex.dispose) envTex.dispose();
        renderer.dispose();
        host.__paperWebGL.n = Math.max(0, host.__paperWebGL.n - 1);
    }

    shadowsOn(0);
    readScroll();
    resize();
    wake();
    return { dispose, wake };
}

export { THREE, LOW, PAPER, PAPER_HI, PAPER_LO, INK, ACCENT, clamp, lerp, smooth, hash, paperMaterial, addLights, addGround, field, desk, RoundedBoxGeometry };
