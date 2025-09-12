// evil evil file for containing my evil evil terminal code
// taggie pyle, 2025
// https://github.com/tailhaver
// please dont reuse this code 1. its bad 2. ill cry 3. do you really want to make a fox cry

import { 
  Command, HelpCommand, TwitterCommand, GitHubCommand, 
  EchoCommand, WhoAmICommand, FoxCommand, ClearCommand, 
  OpenCommand 
} from "./commands.js"

const term = new Terminal({
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
  }
});

const re = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
export default class FTerminal {
  constructor() {
    this.cursorX = 0;
    this.currentLine = "";
    this.lineHistory = [];
    this.currentLineInHistory = 0; // amazing names taggie
    this.user = "guest"
    this.dir = "~";
    this.homeText = `[1;92m${this.user}@taggie-server[1;0m:[1;94m${this.dir}[0m$ `;
    this.homeLength = this.homeText.replace(re, "").length + 1;
    this.lineLength = this.homeLength + this.currentLine.length;
    this.#initCommands();
    term.open(document.getElementById('terminal'));
    this.write(this.homeText);
    this.cursorX = this.lineLength;

    term.onData(e => {this.#handleData(e)})
  }
  #initCommands() {
    this.commands = {
      "help": HelpCommand,
      "twitter": TwitterCommand,
      "github": GitHubCommand,
      "echo": EchoCommand,
      "whoami": WhoAmICommand,
      "fox": FoxCommand,
      "clear": ClearCommand,
      "open": OpenCommand
    }

    this.aliases = []
    Object.values(this.commands).forEach((e) => {e.aliases.length > 0 ? this.aliases.push([e.name, e.aliases]) : null})

    // black magic fuckery
    var _ = {}; 
    this.aliases.forEach((K) => {K[1].forEach((e) => {_[e] = K[0]})}); 
    this.aliases = _; 
    _ = null;
    console.log(this.aliases)
  }
  #handleData(e) {
    switch (e) {
      case '\r':
        // handling for the messed up previous line handling
        if (this.lineHistory.includes(this.currentLine) && this.currentLineInHistory != 0) {
          this.lineHistory.splice(this.currentLineInHistory - 1)
        }
        this.currentLineInHistory = 0;
        this.lineHistory.push(this.currentLine);
        this.write("\r\n");
        this.#handleCommand(this.currentLine);
        this.currentLine = '';
        this.cursorX = this.homeLength;
        break;
      case '\x7F': // backspace
        if (this.cursorX > this.homeLength) {
          this.cursorX -= 1;
          this.currentLine = this.currentLine.slice(0, -1);
          this.write("\b \b");
        }
        break;
      case '\x1b[A': // up
        // this.write(`\x1b[${this.homeLength + this.currentLine.length - 1}G`);
        this.write(`\x1b[M`);
        this.write(this.homeText);
        if (this.lineHistory.length > this.currentLineInHistory) {
          this.currentLineInHistory += 1
          this.currentLine = this.lineHistory.at(this.currentLineInHistory * -1);
          this.#updateLineLength(); // force call because i need to set the x val NOWW
          this.cursorX = this.lineLength;
        }
        this.write(this.currentLine);
        break
      case '\x1b[B': // down
        if (this.currentLineInHistory == 0) { break }
        this.write(`\x1b[M`);
        this.write(this.homeText);
        this.currentLineInHistory -= 1
        if (this.currentLineInHistory != 0) {
          this.currentLine = this.lineHistory.at(this.currentLineInHistory * -1);
        } else {
          this.currentLine = "";
        }
        this.#updateLineLength(); // force call because i need to set the x val NOWW
        this.cursorX = this.lineLength;
        this.write(this.currentLine);
        break;
      case '\x1b[C': // forward
        if (this.cursorX < this.lineLength - 1) {
          this.cursorX += 1;
          this.write('\x1b[C')
        }
        break
      case '\x1b[D': // back
        if (this.cursorX > this.homeLength) {
          this.cursorX -= 1;
          this.write('\x1b[D')
        }
        break
      case '\x1b[15~': // f5
        window.location.reload();
      default:
        this.cursorX += 1;
        this.currentLine += e;
        this.write(e);
    }
    this.#updateLineLength()
  }
  #handleCommand(input) {
    const args = input.split(' ');
    const command = args[0];
    const params = args.slice(1);
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
      this.write(`-foxterm: ${command}: command not found`)
    }
    if (selectedCommand != null) {
      if (selectedCommand.prototype instanceof Command) {
        selectedCommand.exec(params, this);
      } else {
        selectedCommand(params);
      }
    }
    if (!["clear", "cls", "open"].includes(command)) { // hardcoded because im a little wah wah baby who cant code
      this.write("\r\n");
    }
    this.write(this.homeText);
  }
  #updateLineLength() {
    this.lineLength = this.homeLength + this.currentLine.length;
  }
  write(dat) {
    term.write(dat);
  }
  reset() {
    term.reset();
  }
}