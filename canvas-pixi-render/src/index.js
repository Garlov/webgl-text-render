import * as PIXI from 'pixi.js';
import setup from './scripts/setup';
import createRenderButtons from './scripts/createRenderButtons';
import renderText from './scripts/renderText';
import renderText2 from './scripts/renderText2';

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

	let sprite = new PIXI.Sprite();
	state.stage.addChild(sprite);

	createRenderButtons();

	let normalRender = document.getElementById('normal-render');
	normalRender.addEventListener('mouseup', () => {
		renderText().then((textCanvas) => {
			let texture = new PIXI.Texture.fromCanvas(textCanvas);
			sprite.texture = texture;
			console.timeEnd('drawing text');
		});
	});

	let directRender = document.getElementById('direct-render');
	directRender.addEventListener('mouseup', () => {
		renderText2().then((textCanvas) => {
			let texture = new PIXI.Texture.fromCanvas(textCanvas);
			sprite.texture = texture;
			console.timeEnd('drawing text');
		});
	});
});