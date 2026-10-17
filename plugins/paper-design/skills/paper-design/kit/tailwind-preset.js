/* PAPER — Tailwind preset. Same tokens as paper.css.
   tailwind.config.js:  presets: [require('./paper-tailwind-preset.js')]
   (ESM configs: `import paper from './paper-tailwind-preset.js'` and export default { presets: [paper], ... })
   Tailwind v4 (CSS-first): copy the :root block from paper.css and map it under @theme instead.
   Body copy is 16px / 1.5. Entry ease is cubic-bezier(.2,.8,.2,1); state changes use paper-state.
   Do not add colours that are not in paper.css. */
module.exports = {
    theme: {
        extend: {
            colors: {
                paper: { DEFAULT: '#f5f2eb', hi: '#faf8f3', lo: '#ebe6db' },
                ink: { DEFAULT: '#1c1b18', 2: '#4f4b43', 3: '#6b675f' },
                line: { DEFAULT: 'rgba(28,27,24,0.12)', 2: 'rgba(28,27,24,0.22)', strong: 'rgba(28,27,24,0.55)' },
                accent: '#d2462f',
                ok: '#397352',
                warn: '#896010',
                err: '#b83d29',
                down: '#88837a'
            },
            fontFamily: {
                serif: ['"Instrument Serif"', '"Iowan Old Style"', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
            },
            borderRadius: { card: '18px', control: '12px' },
            maxWidth: { page: '1200px' },
            transitionTimingFunction: {
                paper: 'cubic-bezier(.2,.8,.2,1)',
                'paper-state': 'cubic-bezier(.4,0,.2,1)'
            },
            transitionDuration: {
                press: '120ms',
                state: '160ms',
                enter: '240ms'
            },
            letterSpacing: { label: '.12em' }
        }
    }
};
