import * as PIXI from 'pixi.js';
import setup from './scripts/setup';
import createRenderButtons from './scripts/createRenderButtons';
import renderText from './scripts/renderText';
import renderText2 from './scripts/renderText2';
import renderText3 from './scripts/renderText3';
import renderText4 from './scripts/renderText4';
import renderText5 from './scripts/renderText5';
import Promise from 'promise-polyfill';
//import 'canvas-5-polyfill';
import 'ctx-polyfill';

let state = undefined;
if (!window.Promise) {
	window.Promise = Promise;
}

const rdy = (fn) => {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

// const animate = () => {
// 	state.renderer.render(state.stage);
// 	requestAnimationFrame(animate);
// }

const getFontSize = () => {
	let fontSizeElem = document.getElementById('fontSize');
	let fontSize = 10;
	if (fontSizeElem.value.length > 0) {
		fontSize = parseFloat(fontSizeElem.value);
	}
	return fontSize;
}

rdy(function () {
	state = setup();
	// animate();

	let sprite = new PIXI.Sprite();
	state.stage.addChild(sprite);

	createRenderButtons();

	// let normalRender = document.getElementById('normal-render');
	// normalRender.addEventListener('mouseup', () => {
	// 	renderText().then((textCanvas) => {
	// 		let texture = new PIXI.Texture.fromCanvas(textCanvas);
	// 		sprite.texture = texture;
	// 		console.timeEnd('drawing text');
	// 		state.renderer.render(state.stage);
	// 	});
	// });

	// let directRender = document.getElementById('direct-render');
	// directRender.addEventListener('mouseup', () => {
	// 	renderText2().then((textCanvas) => {
	// 		let texture = new PIXI.Texture.fromCanvas(textCanvas);
	// 		sprite.texture = texture;
	// 		console.timeEnd('drawing text');
	// 		state.renderer.render(state.stage);
	// 	});
	// });

	// let cacheRender = document.getElementById('cache-render');
	// cacheRender.addEventListener('mouseup', () => {
	// 	renderText3().then((textCanvas) => {
	// 		let texture = new PIXI.Texture.fromCanvas(textCanvas);
	// 		sprite.texture = texture;
	// 		console.timeEnd('drawing text');
	// 		state.renderer.render(state.stage);
	// 	});
	// });

	let drawRender = document.getElementById('draw-render');
	drawRender.addEventListener('mouseup', () => {
		let fontSize = getFontSize();
		renderText4(fontSize).then((textCanvas) => {
			let texture = new PIXI.Texture.fromCanvas(textCanvas);
			sprite.texture = texture;
			console.timeEnd('drawing text');
			state.renderer.render(state.stage);
		});
	});

	let pathRender = document.getElementById('path-render');
	pathRender.addEventListener('mouseup', () => {
		let fontSize = getFontSize();
		renderText5(fontSize).then((textCanvas) => {
			let texture = new PIXI.Texture.fromCanvas(textCanvas);
			sprite.texture = texture;
			console.timeEnd('drawing text');
			state.renderer.render(state.stage);
		});
	});
});