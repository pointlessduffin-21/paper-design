/* Hero and login pages mount the paper field.
   The page stays readable if WebGL is missing. */
import { mountScene, field } from './scenes-kit.js';

var canvas = document.getElementById('scene');
if (canvas) mountScene(canvas, field);
