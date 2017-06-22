import text from './text';
import opentype from 'opentype.js';

export default function renderText() {
    return new Promise((resolve, reject) => {
        opentype.load('media/CaeciliaLTStd-Bold.otf', function (err, font) {
            if (err) {
                reject('Font could not be loaded: ' + err);
            } else {
                //create new canvas
                let canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
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

                //loop over chars and draw them
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];
                    //get path from opentype
                    let charPath = font.getPath(c, 0, 0, 10);
                    //calculate x and y
                    let x = charOnLine * charSize;
                    let y = currLine * lineHeight;
                    //draw character at x and y
                    ctx.save();
                    ctx.translate(x, y);
                    charPath.draw(ctx);
                    ctx.restore();

                    charOnLine += 1;

                    //linebreak
                    if (x + charSize > window.innerWidth) {
                        currLine += 1;
                        charOnLine = 0;
                    }
                }
                //return canvas
                resolve(canvas);
            }
        });
    });
}