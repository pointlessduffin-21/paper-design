import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    PHASE_LABEL,
    clampFrameDeltaMs,
    compareCell,
    decorativeLoopShouldSleep,
    motionReduced,
    parseStrictNumber,
    staggerDelayMs
} from '../plugins/paper-design/skills/paper-design/kit/paper-policy.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const kit = join(root, 'plugins/paper-design/skills/paper-design/kit');
const read = (path) => readFileSync(join(root, path), 'utf8');
const paperCss = read('plugins/paper-design/skills/paper-design/kit/paper.css');
const toolCss = read('plugins/paper-design/skills/paper-design/kit/tool.css');
const paperJs = read('plugins/paper-design/skills/paper-design/kit/paper.js');
const scenes = read('plugins/paper-design/skills/paper-design/kit/scenes-kit.js');
const preset = read('plugins/paper-design/skills/paper-design/kit/tailwind-preset.js');
const template = read('plugins/paper-design/skills/paper-design/kit/template.html');
const login = read('plugins/paper-design/skills/paper-design/kit/login.html');
const fixture = read('plugins/paper-design/skills/paper-design/kit/fixture.html');
const mainJs = read('plugins/paper-design/skills/paper-design/kit/main.js');
const skill = read('plugins/paper-design/skills/paper-design/SKILL.md');
const guidelines = read('plugins/paper-design/skills/paper-design/GUIDELINES.md');
const readme = read('README.md');
const claude = read('global/CLAUDE.paper.md');

function lin(c) {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}
function lum(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
    const L1 = lum(a);
    const L2 = lum(b);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
}
function composite(fg, alpha, bg) {
    const f = [1, 3, 5].map((i) => parseInt(fg.slice(i, i + 2), 16));
    const b = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16));
    const rgb = f.map((channel, i) => Math.round(channel * alpha + b[i] * (1 - alpha)));
    return '#' + rgb.map((n) => n.toString(16).padStart(2, '0')).join('');
}
function token(css, name) {
    const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
    assert.ok(match, `missing ${name}`);
    return match[1].trim();
}
function ids(html) {
    return [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
}

test('motion policy can only strengthen reduced motion', () => {
    assert.equal(motionReduced(false, false), false);
    assert.equal(motionReduced(true, false), true);
    assert.equal(motionReduced(true, true), true);
    assert.equal(motionReduced(false, true), true);
});

test('stagger stays inside the first six items and 240ms', () => {
    assert.equal(staggerDelayMs(0, true), 0);
    assert.equal(staggerDelayMs(0, false), 0);
    assert.equal(staggerDelayMs(5, false), 200);
    assert.equal(staggerDelayMs(6, false), 0);
    assert.ok(staggerDelayMs(3, false) <= 240);
    assert.match(paperJs, /STAGGER_STEP = 40/);
    assert.match(paperJs, /STAGGER_CAP = 240/);
});

test('frame delta is clamped after a long gap', () => {
    assert.equal(clampFrameDeltaMs(1000, 0), 16);
    assert.equal(clampFrameDeltaMs(1000, 990), 10);
    assert.equal(clampFrameDeltaMs(5000, 1000), 50);
});

test('decorative loop sleeps once input has been idle', () => {
    assert.equal(decorativeLoopShouldSleep(true, 5000, false), false);
    assert.equal(decorativeLoopShouldSleep(false, 100, true), false);
    assert.equal(decorativeLoopShouldSleep(false, 1200, false), true);
    assert.equal(decorativeLoopShouldSleep(false, 1199, false), false);
});

test('strict numbers do not coerce partial or missing values to zero', () => {
    for (const value of ['12abc', '1,500', 'NaN', 'Infinity', '', '6.2 bar', '  ']) {
        assert.equal(parseStrictNumber(value), null);
    }
    assert.equal(parseStrictNumber(' 6.25 '), 6.25);
    assert.equal(parseStrictNumber('-0'), 0);
    assert.equal(compareCell('', '6.2', 'number', 'ascending'), 1);
    assert.equal(compareCell('6.2', '', 'number', 'ascending'), -1);
    assert.equal(compareCell('12abc', '1', 'number', 'ascending'), 1);
    assert.ok(compareCell('4.1', '6.2', 'number', 'ascending') < 0);
    assert.ok(compareCell('6.2', '4.1', 'number', 'descending') < 0);
});

test('phase labels stay honest and match paper.js', () => {
    assert.equal(PHASE_LABEL.submitting, 'Requesting');
    assert.equal(PHASE_LABEL.accepted, 'Request accepted; verification pending');
    assert.match(PHASE_LABEL.unknown, /Reconcile/);
    assert.doesNotMatch(PHASE_LABEL.accepted, /verified/i);
    for (const label of Object.values(PHASE_LABEL)) {
        if (label) assert.match(paperJs, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
});

test('palette tokens match the Tailwind preset and clear contrast floors', () => {
    const expected = {
        '--paper': '#f5f2eb',
        '--paper-hi': '#faf8f3',
        '--paper-lo': '#ebe6db',
        '--ink': '#1c1b18',
        '--ink-2': '#4f4b43',
        '--ink-3': '#6b675f',
        '--accent': '#d2462f',
        '--ok': '#397352',
        '--warn': '#896010',
        '--err': '#b83d29',
        '--down': '#88837a'
    };
    for (const [name, value] of Object.entries(expected)) {
        assert.equal(token(paperCss, name), value);
        assert.ok(preset.replace(/\s+/g, '').includes(value.replace(/\s+/g, '')), name);
    }
    assert.equal(token(paperCss, '--line').replace(/\s+/g, ''), 'rgba(28,27,24,0.12)');
    assert.equal(token(paperCss, '--line-2').replace(/\s+/g, ''), 'rgba(28,27,24,0.22)');
    assert.equal(token(paperCss, '--line-strong').replace(/\s+/g, ''), 'rgba(28,27,24,0.55)');
    assert.match(preset.replace(/\s+/g, ''), /rgba\(28,27,24,0\.55\)/);

    const surfaces = ['#f5f2eb', '#faf8f3', '#ebe6db'];
    for (const surface of surfaces) {
        for (const name of ['--ink', '--ink-2', '--ink-3', '--ok', '--warn', '--err']) {
            assert.ok(contrast(token(paperCss, name), surface) >= 4.5, `${name} on ${surface}`);
        }
    }
    assert.ok(contrast('#d2462f', '#f5f2eb') >= 3);
    assert.ok(contrast('#88837a', '#f5f2eb') >= 3);
    assert.ok(contrast('#f5f2eb', '#b83d29') >= 4.5);
    const edge = composite('#1c1b18', 0.55, '#f5f2eb');
    assert.ok(contrast(edge, '#f5f2eb') >= 3);
});

test('kit CSS keeps the motion, glass, and focus guards', () => {
    const css = paperCss + '\n' + toolCss;
    assert.doesNotMatch(css, /backdrop-filter\s*:/);
    assert.doesNotMatch(css, /transition\s*:\s*all/);
    assert.doesNotMatch(css, /0\.001ms/);
    assert.match(paperCss, /prefers-reduced-motion:\s*reduce/);
    const reducedAt = paperCss.indexOf('prefers-reduced-motion');
    const forcedAt = paperCss.indexOf('forced-colors');
    const reducedBlock = paperCss.slice(reducedAt, forcedAt);
    assert.match(reducedBlock, /--paper-shift:\s*0px/);
    assert.doesNotMatch(reducedBlock, /animation(?:-name)?\s*:\s*none/);
    assert.match(paperCss, /@keyframes paper-in/);
    assert.match(paperCss, /--paper-shift:\s*8px/);
    assert.match(paperCss, /forced-colors:\s*active/);
    assert.match(paperCss, /@media print/);
    assert.match(paperCss, /data-paper-motion/);
    assert.match(paperCss, /scroll-margin-top/);
    assert.match(paperCss, /font-variant-numeric:\s*tabular-nums/);
    assert.match(paperCss, /font-size:\s*16px/);
    assert.match(paperCss, /line-height:\s*1\.5/);
    assert.match(paperCss, /min-height:\s*44px/);
    assert.match(paperCss, /--dur-press:\s*120ms/);
    assert.match(paperCss, /--dur-enter:\s*480ms/);
    assert.match(paperCss, /--dur-section:\s*560ms/);
    assert.match(preset, /enter:\s*'480ms'/);
    assert.match(toolCss, /@media print/);
    assert.match(toolCss, /forced-colors:\s*active/);
});

test('paper.js honours reduced motion, dialogs, and idle input', () => {
    assert.match(paperJs, /addEventListener\('change'/);
    assert.match(paperJs, /data-paper-motion/);
    assert.match(paperJs, /setAttribute\('inert'/);
    assert.match(paperJs, /showModal/);
    assert.match(paperJs, /localStorage/);
    assert.match(paperJs, /ArrowRight/);
    assert.match(paperJs, /data-paper-sort/);
    assert.match(paperJs, /System reduced motion stays on/);
    assert.match(paperJs, /enter:\s*enter/);
    assert.match(paperJs, /reveal:\s*reveal/);
    assert.match(paperJs, /section:\s*section/);
    assert.match(paperJs, /setState:\s*setState/);
    assert.match(paperJs, /data-paper-state/);
    assert.doesNotMatch(paperJs, /revealAll/);
    assert.match(paperJs, /limited to fades/);
});

test('scenes sleep, clamp delta, and dispose', () => {
    assert.match(scenes, /Math\.min\(50,/);
    assert.match(scenes, /__paperWebGL/);
    assert.match(scenes, /function dispose\(/);
    assert.match(scenes, /mean < 33/);
    assert.match(scenes, /webglcontextlost/);
    assert.match(scenes, /IDLE_GRACE = 1200/);
    assert.match(scenes, /prefers-reduced-motion/);
    assert.match(scenes, /data-paper-effects/);
    assert.match(scenes, /dataset\.scene === 'hero'/);
    assert.match(scenes, /FADE_HOLD = 520/);
});

test('pages expose the guidelines and have no duplicate ids or positive tabindex', () => {
    assert.match(guidelines, /Hick's Law/);
    assert.match(guidelines, /31/);
    for (const doc of [skill, readme, claude]) {
        assert.match(doc, /GUIDELINES\.md/);
    }
    for (const html of [template, login, fixture]) {
        assert.doesNotMatch(html, /tabindex\s*=\s*["'][1-9]/i);
        const found = ids(html);
        assert.deepEqual(found.filter((id, index) => found.indexOf(id) !== index), []);
        for (const delay of html.matchAll(/--d:\s*([0-9.]+)(ms|s)/g)) {
            const ms = parseFloat(delay[1]) * (delay[2] === 's' ? 1000 : 1);
            assert.ok(ms <= 240, delay[0]);
        }
        assert.match(html, /data-enter/);
    }
    for (const html of [template, login]) {
        assert.match(html, /data-scene="hero"/);
        assert.match(html, /data-section/);
        assert.match(html, /class="btn/);
    }
    assert.match(login, /data-paper-state="password"/);
    assert.match(mainJs, /mountScene/);
    assert.match(template, /class="skip"/);
    assert.match(template, /aria-hidden="true"/);
    assert.match(fixture, /data-paper-dialog="command-review"/);
    assert.match(fixture, /id="command-review"/);
    assert.match(fixture, /data-section/);
    assert.match(fixture, /Unavailable/);
    const audit = read('plugins/paper-design/skills/paper-design/guidelines-gap-audit.md');
    for (let n = 1; n <= 31; n += 1) {
        assert.match(audit, new RegExp('\\| ' + String(n).padStart(2, '0') + ' \\|'));
    }
    assert.match(audit, /\| doc-only \|/);
    assert.match(audit, /\| partial \|/);
    assert.match(skill, /guidelines-gap-audit\.md/);
    assert.match(scenes, /function desk\(/);
    assert.match(scenes, /export \{[^}]*\bdesk\b/);
    assert.match(scenes, /IntersectionObserver/);
    assert.match(scenes, /heroVisible/);
    assert.match(scenes, /target\.hp = 0/);
    assert.match(scenes, /dataset\.sceneState = 'unavailable'/);
    assert.match(scenes, /dprCap = low \? 1\.5 : 2/);
    assert.match(paperCss, /\.scene-fallback \{[^}]*position:\s*absolute/);
    assert.match(paperCss, /\.login-grid \{[^}]*display:\s*grid/);
    assert.match(template, /data-fade="hero"/);
    assert.match(template, /data-scene-fallback/);
    assert.match(login, /data-scene-kind="desk"/);
    assert.match(login, /data-fade="hero"/);
    assert.match(login, /data-scene-fallback/);
    assert.doesNotMatch(login, /data-paper-persist/);
    assert.match(mainJs, /get\('webgl'\) === 'off'/);
    assert.match(mainJs, /data-scene-kind'\) === 'desk' \? desk : field/);
    assert.match(fixture, /data-paper-presets="ledger"/);
    assert.match(fixture, /data-paper-persist/);
    assert.match(fixture, /data-paper-export="ledger"/);
    assert.match(fixture, /data-paper-restore="ledger"/);
    assert.match(fixture, /data-paper-discard/);
    assert.match(paperJs, /sessionStorage/);
    assert.match(paperJs, /function writeDraft/);
    assert.match(paperJs, /function applyPreset/);
    assert.match(skill, /data-scene-kind="desk"/);
    for (const doc of [skill, guidelines, claude]) {
        assert.match(doc, /does not follow the skill/);
        assert.match(doc, /Motion gap audit/);
    }
});
