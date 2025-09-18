// most evil file for containing my most evil and twisted command processing
// dont ask what any of this is. ive no clue either
// taggie pyle, 2025
// https://github.com/tailhaver

import FTerminal from "./terminal.js"

// $.ajaxSetup({
//     async: false
// })

const [width, height] = [$(window).width(), $(window).height()];

let positions = [];
let sizes = [];

let stdwidth = 0;
let stdheight = 0;
let left = 0;
let top = 0;

if (width >= 1280) {
    stdwidth = 376;
    stdheight = 428;
    left = (width - stdwidth * 3 - 8) / 2;
    top = Math.max(54, (height - stdheight * 2 - 8) / 2);
    positions = [
        [left, top], [left, top + stdheight + 8], [left + stdwidth + 8, top]
    ];
    sizes = [
        [stdwidth, stdheight], [stdwidth, height - top * 2 - stdheight - 8], [stdwidth * 2, height - top * 2]
    ];
} else if (width >= 796) {
    stdwidth = 360;
    stdheight = 404;
    left = 54;
    top = 54;
    positions = [
        [left, top], [left, top + stdheight + 8], [left + stdwidth + 8, top]
    ];
    sizes = [
        [stdwidth, stdheight], [stdwidth, height - top * 2 - stdheight - 8], [width - left * 2 - stdwidth - 8, height - top * 2]
    ];
}

const t1 = new FTerminal(positions[0], sizes[0]);
const t2 = new FTerminal(positions[1], sizes[1]);
const t3 = new FTerminal(positions[2], sizes[2]);

t1.sendCommand("fox", false);
t2.sendCommand("cat aside.txt", true, false); // i miss my kwargs
t2.sendCommand("cat about.txt");
// hacky fix to display text
setTimeout(() => {
    t3.reset();
    t3.write(`foxterm 0.3.0\r\npowered by ]8;;https://xtermjs.org/\\xterm.js]8;;\r\n\r\n${t3.homeText}`);
    t3.sendCommand("help");
}, 0)

$(window).on("resize", (e) => {
    if (e.target !== window) { return }
    [t1, t2, t3].forEach((e) => {
        e.lockToWindow();
    })
})