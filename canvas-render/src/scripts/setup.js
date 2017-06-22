import * as PIXI from 'pixi.js';

export default function setup() {
    const rendererOptions = {
        backgroundColor: 0xdddddd,
        interactive: true,
        antialias: true,
        preserveDrawingBuffer: true // Needed to capture canvas
    }

    //init pixi
    let renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, rendererOptions);

    //get content div
    let contentDiv = document.getElementById('content');

    //add pixi canvas to content div
    contentDiv.appendChild(renderer.view);
    renderer.view.style.userSelect = 'none';

    //create stage container for content
    let stage = new PIXI.Container();

    //return renderer and stage
    return {
        renderer: renderer,
        stage: stage
    }
}