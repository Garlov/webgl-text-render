import text from './text';
import opentype from 'opentype.js';

export default function renderText() {
    return new Promise((resolve, reject) => {
        opentype.load('media/CaeciliaLTStd-Bold.otf', function (err, font) {
            if (err) {
                reject('Font could not be loaded: ' + err);
            } else {
                //create new canvas
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

                svg.setAttribute('width', window.innerWidth);
                svg.setAttribute('height', window.innerHeight);

                svg.style.position = 'fixed';
                svg.style.top = '0px';
                svg.style.left = '0px';

                console.log(`%c TEXT LENGTH: ${text.length} CHARACTERS`, 'background: red; color: white');
                console.time('drawing text');

                //char position data
                let lineHeight = 10;
                let currLine = 1;
                let charOnLine = 0;
                let charSize = 10;

                //timers
                let getPathTime = 0;
                let toPathDataTime = 0;
                let createPathTime = 0;
                let totalSvgGenerationTime = performance.now();

                //loop over chars and draw them
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];

                    //get path from opentype
                    let t0 = performance.now();
                    let charPath = font.getPath(c, 0, 0, 10);
                    let t1 = performance.now();
                    getPathTime += (t1 - t0);

                    t0 = performance.now();
                    let svgPathData = charPath.toPathData();
                    t1 = performance.now();
                    toPathDataTime += (t1 - t0);

                    //calculate x and y
                    let x = charOnLine * charSize;
                    let y = currLine * lineHeight;

                    t0 = performance.now();
                    let svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    svgPath.setAttribute('transform', `translate(${x}, ${y})`);
                    svgPath.setAttribute('d', svgPathData);
                    svgPath.setAttribute('fill', 'black');
                    svg.appendChild(svgPath);
                    t1 = performance.now();
                    createPathTime += (t1 - t0);

                    charOnLine += 1;

                    //linebreak
                    if (x + charSize > window.innerWidth) {
                        currLine += 1;
                        charOnLine = 0;
                    }
                }

                //console log timers in ms and percent
                totalSvgGenerationTime = performance.now() - totalSvgGenerationTime;
                console.log(`%c TOTAL TIME: ${totalSvgGenerationTime} MS`, 'background: blue; color: white');
                console.log(`%c GET PATH TIME: ${getPathTime} MS, ${parseInt(getPathTime/totalSvgGenerationTime*100)}% OF TOTAL TIME`, 'background: blue; color: white');
                console.log(`%c TO PATH DATA TIME: ${toPathDataTime} MS, ${parseInt(toPathDataTime/totalSvgGenerationTime*100)}% OF TOTAL TIME`, 'background: blue; color: white');
                console.log(`%c CREATE PATH TIME: ${createPathTime} MS, ${parseInt(createPathTime/totalSvgGenerationTime*100)}% OF TOTAL TIME`, 'background: blue; color: white');

                resolve(svg);
            }
        });
    });
}