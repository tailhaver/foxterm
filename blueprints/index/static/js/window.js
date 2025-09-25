export default class Window {
  constructor(pos = [24, 24], size = [738, 457], resizeCallback = () => {return}) {
    this.title = "abc"
    this.self = $("<div>", {"class": "terminal"})
      .append(
        $("<div>", {"class": "titlebar"})
          .append($("<p>", {"class": "title"}))
          .append($("<button>", {"class": "close", "text": "x"})))
      .append($("<div>", {"class": "body"})).appendTo($("body"));
    this.handleWindowResize(pos, size);
    this.body = $(this.self).children()[1];
    $(this.self).draggable({
      handle: ".titlebar",
      scroll: false,
      stop: (e, ui) => {
        this.lockToWindow();
      }
    });
  }
  handleWindowResize(pos = [null, null], size = [null, null]) {
    // more black magic fuckery someone put me down
    this.self.css(
      Object.fromEntries(
        Object.entries({"left": pos[0], "top": pos[1], "width": size[0], "height": size[1]})
            .filter((e) => {return e[1]})
      )
    );
  }
  lockToWindow() {
    const [windowWidth, windowHeight] = [$(window).width(), $(window).height()];
    const [ypos, xpos] = Object.values(this.self.offset());
    const [width, height] = [this.self.width(), this.self.height()];
    if (xpos + width < 54) {
      this.self.css("left", 0 - width + 54);
    } else if (xpos > windowWidth - 54) {
      this.self.css("left", windowWidth - 54);
    }
    if (ypos < 0) {
      this.self.css("top", 0);
    } else if (ypos > windowHeight - 54) {
      this.self.css("top", windowHeight - 54);
    }
  }
  updateTitle(title) {
    this.self.find(".title").text(title);
  }
}