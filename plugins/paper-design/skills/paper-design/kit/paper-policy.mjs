/* Paper motion, stagger, and sort contracts.
   Classic paper.js mirrors the functions marked "mirrored in paper.js".
   scripts/check-kit.mjs fails if those copies drift. */

export const PHASE_LABEL = {
    idle: '',
    submitting: 'Requesting',
    accepted: 'Request accepted; verification pending',
    verified: 'Verified',
    failed: 'Failed',
    unknown: 'Unknown outcome. Reconcile this request before retrying.'
};

/** App setting may strengthen reduced motion. It cannot cancel an OS request. */
export function motionReduced(os, app) {
    return Boolean(os || app);
}

/** First six non-critical items, 30ms apart, never past 150ms. */
export function staggerDelayMs(index, critical) {
    if (critical || index < 0 || index >= 6) return 0;
    return Math.min(150, index * 30);
}

/** Clamp a rAF delta after backgrounding. 50ms matches the twin helper. */
export function clampFrameDeltaMs(now, last) {
    if (!last) return 16;
    return Math.min(50, Math.max(0, now - last));
}

/** Sleep the decorative loop once scroll has settled and input has been idle. */
export function decorativeLoopShouldSleep(settling, sinceActivityMs, dirty) {
    if (dirty || settling) return false;
    return sinceActivityMs >= 1200;
}

/* mirrored in paper.js */
export function parseStrictNumber(raw) {
    var text = String(raw == null ? '' : raw).trim();
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return null;
    var value = Number(text);
    if (!Number.isFinite(value)) return null;
    return Object.is(value, -0) ? 0 : value;
}

/* mirrored in paper.js */
export function compareCell(a, b, type, direction) {
    var dir = direction === 'descending' ? -1 : 1;
    if (type === 'number') {
        var na = parseStrictNumber(a);
        var nb = parseStrictNumber(b);
        if (na === null && nb === null) return 0;
        if (na === null) return 1;
        if (nb === null) return -1;
        return (na - nb) * dir;
    }
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * dir;
}
