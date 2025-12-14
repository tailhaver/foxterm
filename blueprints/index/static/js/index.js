// most evil file for containing my most evil and twisted command processing
// dont ask what any of this is. ive no clue either
// taggie pyle, 2025
// https://github.com/tailhaver

import MarkdownDisplay from "./markdown.js";
import FTerminal from "./terminal.js"
import WindowManager from "./windowManager.js"

// $.ajaxSetup({
//   async: false
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
  top = Math.max(32, (height - stdheight * 2 - 8) / 2);
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
  top = Math.max(32, (height - stdheight * 2 - 8) / 2);
  positions = [
    [left, top], [left, top + stdheight + 8], [left + stdwidth + 8, top]
  ];
  sizes = [
    [stdwidth, stdheight], [stdwidth, height - top * 2 - stdheight - 8], [width - left * 2 - stdwidth - 8, height - top * 2]
  ];
}

console.log(height, height - top * 2 - stdheight - 8);


WindowManager.t1 = new FTerminal(positions[0], sizes[0]);
WindowManager.t2 = new FTerminal(positions[1], sizes[1]);
WindowManager.t3 = new FTerminal(positions[2], sizes[2]);

WindowManager.updateUser();

WindowManager.t1.sendCommand("fox", false);
WindowManager.t2.sendCommand("cat aside.txt", true, false); // i miss my kwargs
WindowManager.t2.sendCommand("cat about.txt");
// // hacky fix to display text
setTimeout(() => {
  WindowManager.t3.reset();
  $.ajax({
    url: 'login-text',
    type: 'GET',
    error: (request, status, error) => {
      this.write(`-foxterm: An error occurred trying to fetch data from login-text! Please report this to taggie. This shouldn't happen.\r\nError type: ${status}\r\nError thrown: ${error}`);
    },
    success: (data) => {
      WindowManager.t3.write(data)
    }
  }).always(() => {
    WindowManager.t3.write(`\r\n\r\n${WindowManager.t3.homeText}`)
    WindowManager.t3.sendCommand("help");
  })
}, 0)

$(() => {
  $("body").on("click tap", ".close", (e) => {
    delete WindowManager[$(e.target).closest('.window.ui-draggable').attr("window-id")];
    if ($(".window.ui-draggable:has(.xterm)").length == 0) {
      setTimeout(() => {WindowManager.t1 = new FTerminal();}, 500);
    }
  })
})

$(window).on("resize", (e) => {
  if (e.target !== window) { return }
  WindowManager.forEach((e) => {
    e.window.lockToWindow();
  })
})

function checkLoginStatus() {
  if (document.cookie == "logged_in=True") {
    WindowManager.updateUser();
    document.cookie = "logged_in=False"
  }
}

$(window).on("focus", (e) => {
  checkLoginStatus();
})

setInterval(checkLoginStatus, 180000);