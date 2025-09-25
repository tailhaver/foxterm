// evil evil file for containing my evil evil terminal code
// taggie pyle, 2025
// https://github.com/tailhaver
// please dont reuse this code 1. its bad 2. ill cry 3. do you really want to make a fox cry

import {commands} from "./commands.js"
import {CommandError} from "./errors.js"
import Window from "./window.js"

const re = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

function prettifyParams(command, params) {
  if (!params) {
    return ""
  }
  const kwparams = Object.entries(params.kwparams).filter(e => e[1]).map(e => {
    return `${command.kwparams[e[0]].flags[0]} ${params[1]}`;
  }).join(" ");
  const flags = Object.entries(params.flags).filter(e => e[1]).map(e => {
    return command.flags[e[0]].flags[0];
  }).join(" ");
  const strings = Object.entries(params.strings).map(e => e[1])
  return [[kwparams, flags].join(" ").trim(), strings].join(" ").trim(); // what is this abomination x3
}

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

    this.window = new Window(pos, size);
    this.window.updateTitle("foxterm");
    // have to manually set resizing here because if i try to pass `this` into
    // the Window obj it throws a fit. oops.
    this.window.handleWindowResize(pos, size);
    this.#resizeTerminal();
    $(this.window.self).resizable({
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
    this.term.open(this.window.body);
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
      this.write(`${command} ${prettifyParams(selectedCommand, params)}\r\n`);
      this.#runCommand(selectedCommand, command, params);
    };
    var queueInterval = setInterval(() => {
      if (this.commandQueue.length == 0) { clearInterval(queueInterval) }
      if ( this.lock ) { return }
      fn();
    }, 125)
  }
  #parseCommand(input) {
    const args = input.split(' ');
    const command = args[0];
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
    const params = this.#parseArgs(selectedCommand, input);
    return [selectedCommand, command, params]
  }
  #runCommand(selectedCommand, command, params) {
    if (selectedCommand != null) {
      let callback = [] // handling for properly finishing async functions
      if (selectedCommand.async) { 
        callback = [this.postCommandHandling, [command]]
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
  #handleCommand(input) {
    const [selectedCommand, command, params] = this.#parseCommand(input);
    this.#runCommand(selectedCommand, command, params)
  }
  #parseArgs(selectedCommand, string) {
    // more ugly black magic fuckery
    if (!selectedCommand) { return }
    string = string.split(' ').slice(1).join(' ');
    if (selectedCommand.kwParams) {
      var kwparamsRe = new RegExp(String.raw`((${Object.values(selectedCommand.kwparams).map(e => e.flags.join("|")).join("|")}\b) (\"[a-zA-Z0-9 ]+?\"|\'[a-zA-Z0-9 ]+?\'|[a-zA-Z0-9]+?\b))`, "g");
    } else {
      var kwparamsRe = new RegExp(String.raw``, "g");
    }
    if (selectedCommand.flags) {
      var flagsRe = new RegExp(String.raw`(${Object.values(selectedCommand.flags).map(e => e.flags.join("|")).join("|")})\b`, "g");
    } else {
      var flagsRe = new RegExp(String.raw``, "g");
    }
    
    const kwparams = Object.fromEntries(Object.entries(selectedCommand.kwparams).map((e) => {
      let arg = e[1];
      const re = new RegExp(String.raw`((${arg.flags.join("|")}\b) (\"[a-zA-Z0-9 ]+?\"|\'[a-zA-Z0-9 ]+?\'|[a-zA-Z0-9]+?\b))${arg.nargs}`, "g");
      const match = string.match(re);
      arg = match && match.length > 0 ? arg[0] : false;
      return [e[0], arg];
    })); 

    const flags = Object.fromEntries(Object.entries(selectedCommand.flags).map((e) => {
      let arg = e[1];
      const re = new RegExp(String.raw`(${arg.flags.join("|")})\b`, "g");
      const match = string.match(re);
      arg = match && match.length > 0 ? true : false;
      return [e[0], arg];
    }));

    const filteredString = string.replaceAll(kwparamsRe, "").replaceAll(flagsRe, "").replaceAll(/\s+/g, " ");
    const strings = Object.fromEntries(Object.entries(selectedCommand.strings).map((e) => {
      let arg = e[1];
      if (arg.nargs != 1 && arg.nargs != "*") {
        throw new Error("Command argument counts are not yet allowed to exceed 1.");
      }
      const re = new RegExp(String.raw`(\".+?\"|\'.+?\'|(\S(?<!\-)\S*\s?)${arg.nargs == "*" ? "*" : ""})${arg.nargs == "*" ? "*" : ""}`, "g");
      const match = filteredString.match(re);
      arg = match && match.length > 0 ? match[0] : false;
      return [e[0], arg]
    }));
    return {
      kwparams: kwparams, 
      flags: flags, 
      strings: strings
    }
  }
  postCommandHandling(command) {
    setTimeout(() => {
      if (!["clear", "cls", "open", "ls", "cd", "fox"].includes(command)) { // hardcoded because im a little wah wah baby who cant code
        this.write("\r\n");
      }
      this.write(this.homeText);
    }, 0);
  }
  #updateLineLength() {
    this.lineLength = this.homeLength + this.currentLine.length;
  }
  write(data) {
    this.term.write(data ? data : "");
  }
  reset() {
    this.term.reset();
  }
  #resizeTerminal() {
    this.term.resize(Math.floor($(this.window.self).innerWidth() / 9) - 4, Math.floor(($(this.window.self).innerHeight() - $($(this.window.self).children()[0]).innerHeight() - 16) / 17));
  }
  sendCommand(input, queue=true, processQueue=true) { // public function for literally One Use. Yay.
    var [selectedCommand, command, params] = this.#parseCommand(input);
    if (queue) {
      this.commandQueue.push([selectedCommand, command, params]);
    } else {
      this.write(`${command} ${prettifyParams(selectedCommand, params)}\r\n`);
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
    if ($(".window.ui-draggable").length == 0) {
      setTimeout(() => {new FTerminal();}, 500);
    }
  })
  $("body").on("mousedown", ".window.ui-draggable", (e) => {
    const $this = $(e.target).closest('.window.ui-draggable');
    if ($this.css("z-index") == highestIndex + 1) {
      return
    }
    $(".focused").removeClass("focused");
    $this.addClass("focused");
    $('.window[style*=z-index]').each((i, element) => {
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