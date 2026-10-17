/* Hero uses field. Sign-in uses desk. Both stay readable without WebGL. */
import { mountScene, field, desk } from './scenes-kit.js';

function showFallback(canvas) {
    canvas.dataset.sceneState = 'unavailable';
    var fallback = document.querySelector('[data-scene-fallback]');
    if (fallback) fallback.hidden = false;
}

var canvas = document.getElementById('scene');
if (canvas) {
    var off = false;
    try { off = new URLSearchParams(window.location.search).get('webgl') === 'off'; }
    catch (err) { off = false; }
    if (off || canvas.getAttribute('data-webgl') === 'off') showFallback(canvas);
    else mountScene(canvas, canvas.getAttribute('data-scene-kind') === 'desk' ? desk : field);
}
