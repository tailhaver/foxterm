import Window from "/static/index/js/window.js"
import WindowManager from "/static/index/js/windowManager.js"

const [width, height] = [$(window).width(), $(window).height()];

class WindowDisplay {
  constructor(pos = [24, 24], size = [680, 680]) {
    this.window = new Window(pos, size);
    this.window.setTitle("404!");
    $(this.window.self).resizable({
      handles: "all",
      containment: "parent"
    });
    // this.setText("...");
  }
}

WindowManager.window = new WindowDisplay();
