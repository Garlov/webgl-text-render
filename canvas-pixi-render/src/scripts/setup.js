import * as PIXI from 'pixi.js';

export default function setup() {
    const rendererOptions = {
        backgroundColor: 0xffffff,
        interactive: true,
        antialias: true,
        preserveDrawingBuffer: true // Needed to capture canvas
    }

    //init pixi
    let renderer = new PIXI.WebGLRenderer(window.innerWidth - 100, window.innerHeight, rendererOptions);

    //get content div
    let contentDiv = document.getElementById('content');

    //add pixi canvas to content div
    contentDiv.appendChild(renderer.view);
    renderer.view.style.userSelect = 'none';
    renderer.view.style.position = 'absolute';
    renderer.view.style.top = '0px';
    renderer.view.style.left = '100px';

    //create stage container for content
    let stage = new PIXI.Container();

    //return renderer and stage
    return {
        renderer: renderer,
        stage: stage
    }
}