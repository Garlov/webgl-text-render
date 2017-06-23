import text from './text';
import opentype from 'opentype.js';

let glyphCommandCache = {};

const draw = (x, y, fontSize, unitsPerEm, commands, ctx) => {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;

    fontSize = fontSize !== undefined ? fontSize : 72;
    let scale = 1 / unitsPerEm * fontSize;

    ctx.beginPath();
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        if (cmd.type === 0) {
            ctx.moveTo(x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 1) {
            ctx.lineTo(x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 2) {
            ctx.bezierCurveTo(x + (cmd.x1 * scale), y + (-cmd.y1 * scale),
                x + (cmd.x2 * scale), y + (-cmd.y2 * scale),
                x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 3) {
            ctx.quadraticCurveTo(x + (cmd.x1 * scale), y + (-cmd.y1 * scale),
                x + (cmd.x * scale), y + (-cmd.y * scale));
        } else if (cmd.type === 4) {
            ctx.closePath();
        }
    }

    ctx.fillStyle = 'black';
    ctx.fill();
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
                    let glyphCommands = glyphCommandCache[glyphIndex];
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
                        glyphCommandCache[glyphIndex] = glyphCommands;
                    }
                    let t1 = performance.now();
                    getPathTime += (t1 - t0);

                    //calculate x and y
                    let x = charOnLine * charSize;
                    let y = currLine * lineHeight;

                    //draw character at x and y
                    t0 = performance.now();
                    draw(x, y, 10, font.unitsPerEm, glyphCommands, ctx);
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