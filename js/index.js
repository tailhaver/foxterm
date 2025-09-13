// most evil file for containing my most evil and twisted command processing
// dont ask what any of this is. ive no clue either
// taggie pyle, 2025
// https://github.com/tailhaver

import FTerminal from "./terminal.js"

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
    stdwidth = 342;
    stdheight = 421;
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

t1.sendCommand("fox");

$(window).on("resize", (e) => {
    if (e.target !== window) { return }
    [t3].forEach((e) => {
        e.lockToWindow();
    })
})