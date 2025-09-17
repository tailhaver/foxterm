// evil evil file for containing my evil evil terminal code
// taggie pyle, 2025
// https://github.com/tailhaver
// please dont reuse this code 1. its bad 2. ill cry 3. do you really want to make a fox cry

import {commands} from "./commands.js"
import {CommandError} from "./errors.js"

const re = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
export default class FTerminal {
  constructor(pos = [24, 24], size = [738, 457]) {
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
      convertEol: true
    });
    this.self = $("<div>", {"class": "terminal"}).append($("<div>", {"class": "titlebar"}).append($("<button>", {"class": "close", "text": "x"}))).append($("<div>", {"class": "body"})).appendTo($("body"));
    this.handleWindowResize(pos, size);
    this.body = $(this.self).children()[1];
    $(this.self).draggable({
      handle: ".titlebar",
      scroll: false,
      stop: (e, ui) => {
        this.lockToWindow();
      }
    });
    $(this.self).resizable({
      handles: "all",
      containment: "parent",
      resize: (e, ui) => {
        this.#resizeTerminal();
      }
    });
    this.cursorX = 0;
    this.currentLine = "";
    this.lineHistory = [];
    this.currentLineInHistory = 0; // amazing names taggie
    this.user = "guest";
    this.dir = "~";
    this.homeText = `[1;92m${this.user}@taggie-server[1;0m:[1;94m${this.dir}[0m$ `;
    this.homeLength = this.homeText.replace(re, "").length + 1;
    this.lineLength = this.homeLength + this.currentLine.length;
    this.#initCommands();
    this.term.open(this.body);
    this.write(this.homeText);
    this.cursorX = this.lineLength;
    this.term.onData(e => {this.#handleData(e)});

    this.lock = false;
    this.currentCommand = null;
    this.commandQueue = []
  };

  #initCommands() {
    this.commands = Object.fromEntries(
      commands.map((e) => {return [e.name, e]}) // automatically create command list from commands.js
    );

    this.aliases = [];
    Object.values(this.commands).forEach((e) => {e.aliases.length > 0 ? this.aliases.push([e.name, e.aliases]) : null});

    // black magic fuckery
    var _ = {}; 
    this.aliases.forEach((K) => {K[1].forEach((e) => {_[e] = K[0]})}); 
    this.aliases = _; 
    _ = null;
  }
  #handleData(e) {
    switch (e) {
      case '\r':
        if (this.lineHistory.includes(this.currentLine)
            & this.currentLineInHistory != 0) {
          this.lineHistory.splice(this.currentLineInHistory - 1);
          }
        this.currentLineInHistory = 0;
        this.lineHistory.push(this.currentLine);
        this.write("\n");
        this.#handleCommand(this.currentLine);
        this.currentLine = '';
        this.cursorX = this.homeLength;
        break
      case '\x7F': // backspace
        if (this.cursorX > this.homeLength) {
          this.cursorX -= 1;
          this.currentLine = this.currentLine.slice(0, -1);
          this.write("\b \b");
        };
        break
      case '\x1b[A': // up
        if (this.lineHistory.length > this.currentLineInHistory) {
          this.write("\x1b[M");
          this.write(this.homeText);
          this.currentLineInHistory += 1;
          this.currentLine = this.lineHistory.at(this.currentLineInHistory * -1);
          this.#updateLineLength(); // force call because i need to set the x val NOWW
          this.cursorX = this.lineLength;
          this.write(this.currentLine);
        }
        break
      case '\x1b[B': // down
        if (this.currentLineInHistory == 0) { break }
        this.write(`\x1b[M`);
        this.write(this.homeText);
        this.currentLineInHistory -= 1;
        if (this.currentLineInHistory != 0) {
          this.currentLine = this.lineHistory.at(this.currentLineInHistory * -1);
        } else {
          this.currentLine = "";
        };
        this.#updateLineLength(); // force call because i need to set the x val NOWW
        this.cursorX = this.lineLength;
        this.write(this.currentLine);
        break
      case '\x1b[C': // forward
        if (this.cursorX < this.lineLength - 1) {
          this.cursorX += 1;
          this.write('\x1b[C');
        };
        break
      case '\x1b[D': // back
        if (this.cursorX > this.homeLength) {
          this.cursorX -= 1;
          this.write('\x1b[D');
        };
        break
      case '\x1b[15~': // f5
        window.location.reload();
        break
      case '\x1b[15;5~': // ctrl f5
        window.location.reload(true); // only works on firefox i think
        break
      case '\x03': // ctrl-c / sigint
        if (this.currentCommand !== null) {
          this.currentCommand.kill();
          this.currentCommand = null;
        }
        this.write('^C\n');
        this.write(this.homeText);
        this.currentLine = '';
        this.#updateLineLength();
        this.cursorX = this.homeLength;
        break
      default:
        this.cursorX += 1;
        this.currentLine += e;
        this.write(e);
    }
    this.#updateLineLength();
  }
  processQueue() {
    let [selectedCommand, command, params] = [null, null, null];
    const fn = () => {
      if (this.commandQueue == null || this.commandQueue.length == 0) {
        return;
      }
      [selectedCommand, command, params] = this.commandQueue.shift();
      this.write(`${command} ${params.join(" ")}\r\n`);
      this.#runCommand(selectedCommand, command, params);
    };
    var queueInterval = setInterval(() => {
      if (this.commandQueue.length == 0) { clearInterval(queueInterval) }
      if ( this.lock ) { return }
      fn();
    }, 125)
  }
  #handleCommand(input) {
    const [selectedCommand, command, params] = this.#parseCommand(input);
    this.#runCommand(selectedCommand, command, params)
    
  }
  #parseCommand(input) {
    const args = input.split(' ');
    const command = args[0];
    const params = args.slice(1).filter(e => e);
    let selectedCommand = null;
    if (command.length == 0) {
      this.write(this.homeText);
      return
    }
    if (command in this.commands) {
      selectedCommand = this.commands[command];
    } else if (command in this.aliases) {
      selectedCommand = this.commands[this.aliases[command]] // what? the fuck?
    } else {
      this.write(`-foxterm: ${command}: command not found`);
    }
    console.log(this.#parseArgs(selectedCommand, input));
    return [selectedCommand, command, params]
  }
  #runCommand(selectedCommand, command, params) {
    if (selectedCommand != null) {
      let callback = [] // handling for properly finishing async functions
      if (selectedCommand.async) { 
        callback = [this.postCommandHandling, (command)]
      }
      try {
        this.currentCommand = new selectedCommand(params, this, callback);
      } catch (err) {
        if (callback.length != 0) {callback[0](...callback[1])}
        if (typeof err !== CommandError) {
          throw err
        }
      }
      if (!selectedCommand.async) { // sick, twisted, evil.
        this.postCommandHandling(command);
      }
      return;
    } 
    this.postCommandHandling(command);
  }
  #parseArgs(selectedCommand, string) {
    // more ugly black magic fuckery
    // const kwparamsRe = new RegExp(String.raw`((${selectedCommand.kwparams.join("|")}\b) (\"[a-zA-Z0-9 ]+?\"|\'[a-zA-Z0-9 ]+?\'|[a-zA-Z0-9]+?\b))`, "g");
    // const flagsRe = new RegExp(String.raw`(?<=\s)(${selectedCommand.flags.join("|")})\b`, "g");
    // const stringRe = new RegExp(/(?<= )(\".+?\"|\'.+?\'|\b(?<!\-)[a-zA-Z0-9]+?\b)/g);

    // let kwparams = string.match(kwparamsRe);
    // let flags = string.match(flagsRe);
    // let strings = string.replaceAll(kwparamsRe, "").replaceAll(flagsRe, "").replaceAll(/\s+/g, " ").match(stringRe);

    // selectedCommand.flags.map((e) => {
    //   return e.flags.
    // })
    throw new Error("Not yet implemented");

    return {
      kwparams: kwparams, 
      flags: flags, 
      strings: strings
    }

  }
  postCommandHandling(command) {
    if (!["clear", "cls", "open", "ls", "cd", "fox"].includes(command)) { // hardcoded because im a little wah wah baby who cant code
      this.write("\r\n");
    }
    this.write(this.homeText);
  }
  #updateLineLength() {
    this.lineLength = this.homeLength + this.currentLine.length;
  }
  write(data) {
    this.term.write(data);
  }
  reset() {
    this.term.reset();
  }
  #resizeTerminal() {
    this.term.resize(Math.floor($(this.self).innerWidth() / 9) - 4, Math.floor(($(this.self).innerHeight() - $($(this.self).children()[0]).innerHeight() - 16) / 17));
  }
  handleWindowResize(pos = [null, null], size = [null, null]) {
    // more black magic fuckery someone put me down
    this.self.css(
      Object.fromEntries(
        Object.entries({"left": pos[0], "top": pos[1], "width": size[0], "height": size[1]})
              .filter((e) => {return e[1]})
      )
    );
    this.#resizeTerminal();
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
  sendCommand(input, queue=true, processQueue=true) { // public function for literally One Use. Yay.
    var [selectedCommand, command, params] = this.#parseCommand(input)
    if (queue) {
      this.commandQueue.push([selectedCommand, command, params]);
    } else {
      this.write(`${command} ${params.join(" ")}\r\n`);
      this.#runCommand(selectedCommand, command, params);
      return
    }
    if (queue && processQueue) {
      this.processQueue();
    }
  }
  regenHomeText() {
    this.homeText = `[1;92m${this.user}@taggie-server[1;0m:[1;94m${this.dir}[0m$ `;
  }
}

$(() => {
  var highestIndex = 5;
  $("body").on("click tap", ".close", (e) => {
    $(e.target).parent().parent().remove();
    if ($(".terminal.ui-draggable").length == 0) {
      setTimeout(() => {new FTerminal();}, 500);
    }
  })
  $("body").on("mousedown", ".terminal.ui-draggable", (e) => {
    const $this = $(e.target).closest('.terminal.ui-draggable');
    if ($this.css("z-index") == highestIndex + 1) {
      return
    }
    $('.terminal[style*=z-index]').each((i, element) => {
      const index = $(element).css("z-index") - 1;
      if (index > highestIndex) {
        highestIndex = index;
      }
      if (index === 0) {
        $(element).css("z-index", "auto");
      } else {
        $(element).css("z-index", index);
      }
    })
    $this.css("z-index", highestIndex + 1);
  })
})