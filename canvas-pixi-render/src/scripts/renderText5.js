import text from './text';
import opentype from 'opentype.js';

let glyphCommandCache = new Map();
let pathCache = [];

const createPath2D = (fontSize, unitsPerEm, commands) => {

    fontSize = fontSize !== undefined ? fontSize : 72;
    let scale = 1 / unitsPerEm * fontSize;

    var path = new Path2D();
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        let cmdx = cmd.x * scale;
        let cmdy = -cmd.y * scale;
        if (cmd.type === 0) {
            path.moveTo(cmdx, cmdy);
        } else if (cmd.type === 1) {
            path.lineTo(cmdx, cmdy);
        } else if (cmd.type === 2) {
            path.bezierCurveTo(
                (cmd.x1 * scale), (-cmd.y1 * scale),
                (cmd.x2 * scale), (-cmd.y2 * scale),
                cmdx, cmdy);
        } else if (cmd.type === 3) {
            path.quadraticCurveTo(
                (cmd.x1 * scale), (-cmd.y1 * scale),
                cmdx, cmdy);
        } else if (cmd.type === 4) {
            path.closePath();
        }
    }

    return path;
}

export default function renderText4() {
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
                ctx.fillStyle = 'black';

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

                // Initial translate
                ctx.translate(0, lineHeight);

                //loop over chars and draw them
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];

                    //get path commands from opentype
                    let t0 = performance.now();
                    let glyphIndex = font.charToGlyphIndex(c);
                    let glyphCommands = glyphCommandCache.get(glyphIndex);
                    if (!glyphCommands) {
                        let glyph = font.glyphs.get(glyphIndex) || notdef;
                        glyphCommands = glyph.path.commands;
                        for (let i = 0; i < glyphCommands.length; i++) {
                            let c = glyphCommands[i];
                            if (c.type === 'M') {
                                c.type = 0;
                            } else if (c.type === 'L') {
                                c.type = 1;
                            } else if (c.type === 'C') {
                                c.type = 2;
                            } else if (c.type === 'Q') {
                                c.type = 3;
                            } else if (c.type === 'Z') {
                                c.type = 4;
                            }
                        }
                        glyphCommandCache.set(glyphIndex, glyphCommands);
                    }
                    let t1 = performance.now();
                    getPathTime += (t1 - t0);

                    // Create Path2D element
                    let path = pathCache[glyphIndex];
                    if (!path) {
                        path = createPath2D(10, font.unitsPerEm, glyphCommands);
                        pathCache[glyphIndex] = path;
                    }

                    // Draw to context and translate path
                    t0 = performance.now();

                    ctx.fill(path);
                    ctx.translate(charSize, 0);

                    t1 = performance.now();
                    drawOnCanvasTime += (t1 - t0);

                    charOnLine += 1;

                    //linebreak
                    let x = charOnLine * charSize;
                    if (x + charSize > window.innerWidth) {
                        currLine += 1;
                        charOnLine = 0;

                        // Reset transfor matrix
                        ctx.setTransform(1, 0, 0, 1, 0, 0);

                        // Translate to next line
                        ctx.translate(0, currLine * lineHeight);
                    }
                }

                //console log timers in ms and percent
                totalDrawTime = performance.now() - totalDrawTime;
                console.log(`%c TOTAL TIME: ${totalDrawTime} MS`, 'background: blue; color: white');
                console.log(`%c GET PATH TIME: ${getPathTime} MS, ${parseInt(getPathTime / totalDrawTime * 100)}% OF TOTAL TIME`, 'background: blue; color: white');
                console.log(`%c DRAW ON CANVAS TIME: ${drawOnCanvasTime} MS, ${parseInt(drawOnCanvasTime / totalDrawTime * 100)}% OF TOTAL TIME`, 'background: blue; color: white');

                resolve(canvas);
            }
        });
    });
}