/* PAPER — Tailwind preset. Same tokens as paper.css.
   tailwind.config.js:  presets: [require('./paper-tailwind-preset.js')]
   (ESM configs: `import paper from './paper-tailwind-preset.js'` and export default { presets: [paper], ... })
   Tailwind v4 (CSS-first): copy the :root block from paper.css and map it under @theme instead. */
module.exports = {
    theme: {
        extend: {
            colors: {
                paper: { DEFAULT: '#f5f2eb', hi: '#faf8f3', lo: '#ebe6db' },
                ink: { DEFAULT: '#1c1b18', 2: '#4f4b43', 3: '#8a857a' },
                line: { DEFAULT: 'rgba(28,27,24,0.12)', 2: 'rgba(28,27,24,0.22)' },
                accent: '#d2462f',
                ok: '#3d7a57',
                warn: '#c68a17',
                err: '#d2462f',
                down: '#b5afa3'
            },
            fontFamily: {
                serif: ['"Instrument Serif"', '"Iowan Old Style"', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
            },
            borderRadius: { card: '18px' },
            maxWidth: { page: '1200px' },
            transitionTimingFunction: { paper: 'cubic-bezier(.2,.7,.2,1)' },
            letterSpacing: { label: '.12em' }
        }
    }
};
