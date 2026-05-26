import Shell from "./shell.js"
import Window from "./window.js"

export default class FTerminal {
  constructor(pos=[24, 24], size=[738, 457]) {
    this.term = new Terminal({
      cursorBlink: "block",
      theme: {
        black: "#2E2E2E",
        red: "#FC6D26",
        green: "#3EB383",
        yellow: "#FCA121",
        blue: "#DB3B21",
        magenta: "#380D75",
        cyan: "#6E49CB",
        white: "#FFF",
        brightBlack: "#464646",
        brightRed: "#FF6517",
        brightGreen: "#53EAA8",
        brightYellow: "#FCA013",
        brightBlue: "#DB501F",
        brightMagenta: "#441090",
        brightCyan: "#7D53E7",
        brightWhite: "#FFF",
        background: "#2e2e2e",
        cursor: "#7f7f7f"
      },
      convertEol: true,
      letterSpacing: 0
    });

    this.window = new Window(pos, size);
    this.window.setTitle("foxterm");
    this.window.handleWindowResize(pos, size);

    this.#resizeTerminal();
    $(this.window.self).resizable({
      handles: "all",
      containment: "parent",
      resize: (e, ui) => this.#resizeTerminal()
    });

    this.term.open(this.window.body);
    this.term.onData(data => this.#inputHandler(data));

    this.shell = new Shell(this);
  }

  #resizeTerminal() {
    // ill be so honest i have no clue what this function does. who wrote it? not me! therefore not my problem.
    const self = $(this.window.self);
    const width = self.innerWidth();
    const height = self.innerHeight();
    const childHeight = $(self.children()[0]).innerHeight();

    const w = Math.floor(width / 9) - 4;
    const h = Math.floor((height - childHeight - 16) / 17);
    this.term.resize(w, h);
  }

  reset() {
    this.term.reset();
  }

  print(...data) {
    data.forEach(
      item => this.term.write(item ? item : "")
    );
  }

  println(...data) {
    data.forEach(
      item => this.print(item, "\n")
    );
  }

  #inputHandler(data) {
    this.shell.inputHandler(data);
  }
}