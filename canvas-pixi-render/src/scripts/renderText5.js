import text from './text';
import opentype from 'opentype.js';

let pathCache = [];

const createPath2D = (fontSize, unitsPerEm, commands) => {

    fontSize = fontSize !== undefined ? fontSize : 72;
    let scale = 1 / unitsPerEm * fontSize;

    var path = new Path2D();
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        let cmdx = cmd.x * scale;
        let cmdy = -cmd.y * scale;
        if (cmd.type === 'M') {
            path.moveTo(cmdx, cmdy);
        } else if (cmd.type === 'L') {
            path.lineTo(cmdx, cmdy);
        } else if (cmd.type === 'C') {
            path.bezierCurveTo(
                (cmd.x1 * scale), (-cmd.y1 * scale),
                (cmd.x2 * scale), (-cmd.y2 * scale),
                cmdx, cmdy);
        } else if (cmd.type === 'Q') {
            path.quadraticCurveTo(
                (cmd.x1 * scale), (-cmd.y1 * scale),
                cmdx, cmdy);
        } else if (cmd.type === 'Z') {
            path.closePath();
        }
    }

    return path;
}

export default function renderText4(fontSize) {
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
                let currLine = 1;
                let charOnLine = 0;
                let charSize = 1;
                let lineHeight = 1;

                //timers
                let getPathTime = 0;
                let drawOnCanvasTime = 0;
                let totalDrawTime = performance.now();

                let notdef = font.glyphs.get(0);

                // Initial context setup
                ctx.scale(fontSize, fontSize);
                ctx.translate(0, lineHeight);

                //loop over chars and draw them
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];

                    //get path commands from opentype
                    let t0 = performance.now();
                    let glyphIndex = font.charToGlyphIndex(c);
                    let path = pathCache[glyphIndex];
                    if (!path) {
                        let glyph = font.glyphs.get(glyphIndex) || notdef;
                        
                        // Create Path2D element
                        path = createPath2D(1, font.unitsPerEm, glyph.path.commands);
                        pathCache[glyphIndex] = path;
                    }
                    let t1 = performance.now();
                    getPathTime += (t1 - t0);

                    // Draw to context and translate path
                    t0 = performance.now();

                    ctx.fill(path);
                    ctx.translate(charSize, 0);

                    t1 = performance.now();
                    drawOnCanvasTime += (t1 - t0);

                    charOnLine += 1;

                    //linebreak
                    let x = charOnLine * charSize;
                    if (x > canvas.width / fontSize) {
                        currLine += 1;
                        charOnLine = 0;

                        // Reset transfor matrix
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.scale(fontSize, fontSize);

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