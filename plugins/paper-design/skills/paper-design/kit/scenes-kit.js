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
     - prefers-reduced-motion: time stops, scene only answers scroll
     - hidden tab / faded-out canvas: the loop sleeps
     - no WebGL: the canvas stays hidden; the page must be complete
       without it

   Usage (bundler):
     import { mountScene, field } from './scenes-kit.js';
     mountScene(document.getElementById('scene'), field);

   Static sites (no bundler): vendor Three.js and rewrite the three
   imports below to relative paths, e.g. './vendor/three/three.module.min.js',
   and in the vendored add-ons replace `from 'three'` the same way.
   Never load Three from a CDN via an importmap — it forces
   script-src 'unsafe-inline'.
   ============================================================ */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

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
    if (!canvas || !make) return;

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const low = LOW;
    /* "hero" pages fade the scene out as the hero scrolls away and stop
       rendering once it is gone; the rest keep it as a dimmed ground. */
    const fadeMode = canvas.dataset.fade || 'dim';

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true
        });
    } catch (e) {
        return;     // no WebGL: the page is complete without us
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
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);

    const state = {
        hp: 0, sp: 0, px: 0, py: 0,
        rawPX: 0, rawPY: 0, pointerActive: false,
        aspect: 1
    };
    const target = { hp: 0, sp: 0, px: 0, py: 0 };

    const view = make({ THREE, scene, camera, renderer, low, state });

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

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        state.rawPX = (e.clientX / window.innerWidth) * 2 - 1;
        state.rawPY = (e.clientY / window.innerHeight) * 2 - 1;
        target.px = state.rawPX;
        target.py = state.rawPY;
        state.pointerActive = true;
        wake();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { state.pointerActive = false; });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    /* ---- quality ladder: step down only while it actually helps */
    let rung = 0, sampleT = 0, sampleN = 0, sampleSum = 0, lastMean = Infinity, warm = 0;
    function adapt(dtMs) {
        warm += dtMs;
        if (warm < 2500 || rung >= 3) return;
        sampleSum += dtMs; sampleN++; sampleT += dtMs;
        if (sampleT < 1500) return;
        const mean = sampleSum / sampleN;
        sampleT = 0; sampleN = 0; sampleSum = 0;
        if (mean < 24) return;
        if (mean > lastMean * 0.92 && rung > 0) { rung = 3; return; }  // cut did nothing: stop
        lastMean = mean;
        rung++;
        if (rung === 1) dpr = Math.max(1, dpr * 0.75);
        if (rung === 2) {
            renderer.shadowMap.enabled = false;
            scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
            dpr = 1;
        }
        if (rung === 3) dpr = 0.75;
        renderer.setPixelRatio(dpr);
        resize();
    }

    let running = false, last = 0, t = 0, dirty = true, shown = false;

    function wake() {
        dirty = true;
        if (!running && !document.hidden) {
            running = true;
            last = 0;
            requestAnimationFrame(frame);
        }
    }

    function frame(now) {
        if (document.hidden) { running = false; return; }
        const reduced = mqReduced.matches;
        const dtMs = last ? Math.min(100, now - last) : 16;
        last = now;
        const dt = dtMs / 1000;
        if (!reduced) t += dt;

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

        if (opacity > 0.005 && (!reduced || dirty || settling)) {
            view.update(t, reduced ? 0 : dt);
            renderer.render(scene, camera);
            dirty = false;
            if (!shown) {
                shown = true;
                canvas.classList.add('is-ready');
                /* The CSS fade-in owns the first second; after that, the
                   inline opacity above is driven by scroll. */
                setTimeout(() => { canvas.style.transition = 'none'; }, 1300);
            }
            if (!reduced) adapt(dtMs);
        }

        /* Reduced motion, or faded out entirely: sleep until something
           (scroll, pointer, resize) wakes the loop again. */
        if ((reduced && !settling) || (opacity <= 0.005 && !settling)) {
            running = false;
            return;
        }
        requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        canvas.classList.remove('is-ready');
        canvas.style.opacity = '0';
    });
    mqReduced.addEventListener('change', wake);

    readScroll();
    resize();
    wake();
}

export { THREE, LOW, PAPER, PAPER_HI, PAPER_LO, INK, ACCENT, clamp, lerp, smooth, hash, paperMaterial, addLights, addGround, field, RoundedBoxGeometry };
