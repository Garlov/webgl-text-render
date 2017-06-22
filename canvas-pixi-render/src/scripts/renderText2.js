import text from './text';
import opentype from 'opentype.js';

export default function renderText2() {
    return new Promise((resolve, reject) => {
        opentype.load('media/CaeciliaLTStd-Bold.otf', function (err, font) {
            if (err) {
                reject('Font could not be loaded: ' + err);
            } else {
                //create new canvas
                let canvas = document.createElement('canvas');
                canvas.width = window.innerWidth - 100;
                canvas.height = window.innerHeight;

                //get context
                let ctx = canvas.getContext('2d');

                console.log(`%c TEXT LENGTH: ${text.length} CHARACTERS`, 'background: red; color: white');
                console.time('drawing text');

                //char position data
                let lineHeight = 10;
                let currLine = 1;
                let charOnLine = 0;
                let charSize = 10;

                //timers
                let getPathTime = 0;
                let drawOnCanvasTime = 0;
                let totalDrawTime = performance.now();

                let notdef = font.glyphs.get(0);

                //loop over chars and draw them
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];

                    //get path from opentype
                    let t0 = performance.now();
                    let glyphIndex = font.charToGlyphIndex(c);
                    let glyph = font.glyphs.get(glyphIndex) || notdef;
                    let charPath = glyph.getPath(0, 0, 10);
                    let t1 = performance.now();
                    getPathTime += (t1 - t0);

                    //calculate x and y
                    let x = charOnLine * charSize;
                    let y = currLine * lineHeight;

                    //draw character at x and y
                    t0 = performance.now();
                    ctx.save();
                    ctx.translate(x, y);
                    charPath.draw(ctx);
                    ctx.restore();
                    t1 = performance.now();
                    drawOnCanvasTime += (t1 - t0);

                    charOnLine += 1;

                    //linebreak
                    if (x + charSize > window.innerWidth) {
                        currLine += 1;
                        charOnLine = 0;
                    }
                }

                //console log timers in ms and percent
                totalDrawTime = performance.now() - totalDrawTime;
                console.log(`%c TOTAL TIME: ${totalDrawTime} MS`, 'background: blue; color: white');
                console.log(`%c GET PATH TIME: ${getPathTime} MS, ${parseInt(getPathTime/totalDrawTime*100)}% OF TOTAL TIME`, 'background: blue; color: white');
                console.log(`%c DRAW ON CANVAS TIME: ${drawOnCanvasTime} MS, ${parseInt(drawOnCanvasTime/totalDrawTime*100)}% OF TOTAL TIME`, 'background: blue; color: white');

                resolve(canvas);
            }
        });
    });
}