import * as PIXI from 'pixi.js';
import setup from './scripts/setup';
import renderText from './scripts/renderText';

let state = undefined;

const rdy = (fn) => {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

const animate = () => {
	state.renderer.render(state.stage);
	requestAnimationFrame(animate);
}

rdy(function () {
	state = setup();
	animate();
	renderText().then((textCanvas) => {
		let texture = new PIXI.Texture.fromCanvas(textCanvas);
		let sprite = new PIXI.Sprite(texture);
		state.stage.addChild(sprite);
		console.timeEnd('drawing text');
	});
});