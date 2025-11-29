// less evil file for containing my less evil command classes
// taggie pyle, 2025
// https://github.com/tailhaver

import {CommandError} from "./errors.js"
import MarkdownDisplay from "./markdown.js";
import WindowManager from "./windowManager.js"

function generateUsage(command) {
  if (!command instanceof Command) {
    throw new Error("generateUsage command argument must be based on Command!");
  }

  let flags = Object.values(command.flags).map((e) => {
    return `[${e.flags.join("|")}]`;
  });
  let kwparams = Object.values(command.kwparams).map((e) => {
    return `${e.required ? "" : "[" }${e.kwparams.join("|")} ${e.argName}${e.required ? "" : "]" }`;
  });
  let positional = Object.values(command.strings).map((e, i) => {
    return `${e.required ? "" : "[" }${Object.keys(command.strings)[i]}${e.nargs !== 0 && e.nargs !== 1 ? "..." : ""}${e.required ? "" : "]" }`;
  });
  return [command.name, kwparams.join(" "), flags.join(" "), positional.join(" ")].filter(e => e).join(" ");
}

export class Command {
  static name = "";
  static description = "";
  static aliases = [];
  static help = "";
  static kwparams = {};
  static flags = {};
  static strings = {};
  constructor(params, term) {
    this.params = params;
    this.term = term;
    this.running = true;
    // this.exec();
  }
  async exec() {

  }
  kill() {
    this.running = false;
  }
  write(data) {
    if (!this.running) { throw new CommandError("Function has been killed! Its safe to ignore this error :)"); }
    this.term.write(data);
  }
}

export class HelpCommand extends Command {
  static name = "help";
  static description = "Display information about builtin commands.";
  static strings = {
    command: {
      nargs: "*",
      help: "Command to view the help string for",
      required: false
    }
  }
  static help = "\tArguments:\r\n\t  COMMAND\tCommand to view the help string for";
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    if (!params.strings.command) {
      this.write(`Available commands: ${commands.map((e) => {return e.name}).join(", ")}`);
      return Promise.resolve(null)
    }
    let command = null;
    if (Object.keys(term.commands).includes(params.strings.command)) {
      command = term.commands[params.strings.command];
    } else if (Object.keys(term.aliases).includes(params.strings.command)) {
      command = term.commands[term.aliases[params.strings.command]];
    }
    if (command == null) {
      this.write(`help: expected 1 argument\r\nTry 'help help' for more information.`);
      return Promise.reject()
    }
    if (command.description.length == 0 && command.help.length == 0) {
      this.write(`-foxterm: help: no topics match '${params.strings.command}'.`);
      return Promise.reject()
    }
    this.write(`${command.name}: ${generateUsage(command)}${command.description.length > 0 ? '\r\n\t' + command.description : ''}${command.help.length > 0 ? '\r\n\r\n' + command.help : ''}`);
    return Promise.resolve(null)
  }
}

export class TwitterCommand extends Command {
  static name = "twitter";
  static description = "Display a link to my Twitter profile.";
  static aliases = ["twt", "x"];
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    this.write("my twitter: \x1b]8;;http://twitter.com/transfoxes\x1b\\@transfoxes\x1b]8;;\x1b");
    return Promise.resolve(null)
  }
}

export class GitHubCommand extends Command {
  static name = "github";
  static description = "Display a link to my GitHub profile.";
  static aliases = ["git", "gh"];
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    this.write("my github: \x1b]8;;http://github.com/tailhaver\x1b\\@tailhaver\x1b]8;;\x1b");
    return Promise.resolve(null)
  }
}

export class EchoCommand extends Command {
  static name = "echo";
  static description = "Write arguments to stdout.";
  static strings = {
    arg: {
      nargs: "*",
      help: "",
      required: true
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    if (!params.strings.arg) {
      return
    }
    this.write(params.strings.arg);
    return Promise.resolve(null)
  }
}
export class WhoAmICommand extends Command {
  static name = "whoami";
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    this.write(term.user);
    return Promise.resolve(null)
  }
}

// what the fuck is this. what am i doing.
// i should submit this when seeking a diagnosis for being Clinically Insane
export class FoxCommand extends Command {
  static name = "fox";
  static flags = {
    grayscale: {
      flags: ["-g", "--grayscale"],
      help: ""
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    if (params.flags.grayscale) {
      this.write(`[0m[38;5;231m        [0m[38;5;232m,[0m[38;5;245mx[0m[38;5;241m<-[0m[38;5;249mv[0m[38;5;231m          [0m[38;5;241m1[0m[38;5;245m)[0m[38;5;241m<[[0m[38;5;245mf[0m[38;5;231m        [0m \r
[0m[38;5;231m       [0m[38;5;249mc[0m[38;5;241m}<<<<[0m[38;5;245mj)[0m[38;5;231m       [0m[38;5;249mY[0m[38;5;241m-<<<~[0m[38;5;249mc[0m[38;5;231m      [0m \r
[0m[38;5;231m     [0m[38;5;232m.[0m[38;5;249mJ[0m[38;5;241m?-____-[0m[38;5;242m{[0m[38;5;245mr[0m[38;5;231m    [0m[38;5;241m_[0m[38;5;245mr[0m[38;5;241m_______[0m[38;5;244m|[0m[38;5;245m|[0m[38;5;231m     [0m \r
[0m[38;5;231m     [0m[38;5;246mz[0m[38;5;250mL[0m[38;5;248mCYYYYYU[0m[38;5;250mL0[0m[38;5;241m][0m[38;5;231m   [0m[38;5;249mL[0m[38;5;250mL[0m[38;5;248mJYYYYYJ[0m[38;5;250mL[0m[38;5;251mm[0m[38;5;232m.[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;232m [0m[38;5;250mQL[0m[38;5;248mUYYYYYUC[0m[38;5;250mLZ[0m[38;5;251mqqq[0m[38;5;250mLL[0m[38;5;248mJUYYYYYC[0m[38;5;250mL[0m[38;5;245mt[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m<[0m[38;5;250mL[0m[38;5;248mCYYUJC[0m[38;5;250mLLLLLLLLLLLL[0m[38;5;248mLCUYYJ[0m[38;5;250mL[0m[38;5;245mr[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m<[0m[38;5;250mL[0m[38;5;248mCUC[0m[38;5;250mLLLLLLLLLLLLLLLLLL[0m[38;5;248mLJJ[0m[38;5;250mL[0m[38;5;245mr[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m<[0m[38;5;250mLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;248mL[0m[38;5;250mL[0m[38;5;245mr[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m<[0m[38;5;250mLLLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;245mr[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m<[0m[38;5;250mLLLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;245mr[0m[38;5;231m    [0m \r
[0m[38;5;231m    [0m[38;5;241m_[0m[38;5;250mLLLLLLL[0m[38;5;242m{[0m[38;5;241m-[0m[38;5;245mt[0m[38;5;250mLLLLLL[0m[38;5;247mn[0m[38;5;241m-[0m[38;5;242m][0m[38;5;248mU[0m[38;5;250mLLLLLL[0m[38;5;245mn[0m[38;5;231m    [0m \r
[0m[38;5;251mw[0m[38;5;253mbb[0m[38;5;251md[0m[38;5;250mZLLLLLLL[0m[38;5;241m]~[0m[38;5;243m\[0m[38;5;250mLLLLLL[0m[38;5;245mx[0m[38;5;241m~_[0m[38;5;247mY[0m[38;5;250mLLLLLLQ[0m[38;5;251mp[0m[38;5;253mbbb[0m \r
[0m[38;5;234m:[0m[38;5;251mmmmmmmmmmZ[0m[38;5;250mOQ[0m[38;5;248mJ[0m[38;5;250mL[0m[38;5;248mJ[0m[38;5;247munnuX[0m[38;5;250mL[0m[38;5;248mJ[0m[38;5;250mLOZ[0m[38;5;251mmmmmmmmmm[0m[38;5;245mf[0m \r
[0m[38;5;231m [0m[38;5;232m:[0m[38;5;253mMMMMMMMMMM#ok[0m[38;5;249mJ[0m[38;5;241m?<<~[0m[38;5;245mj[0m[38;5;253mda#MMMMMMMMMM[0m[38;5;245mf[0m[38;5;231m [0m \r
[0m[38;5;231m  [0m[38;5;254m [0m[38;5;248mC[0m[38;5;253mMMMMMMMMMMMM*[0m[38;5;244m/[0m[38;5;241m_[0m[38;5;252mp[0m[38;5;253mMMMMMMMMMMMMM[0m[38;5;232m^[0m[38;5;231m  [0m \r
[0m[38;5;231m    [0m[38;5;254m [0m[38;5;252md[0m[38;5;253mMMMMMMMMo[0m[38;5;252md[0m[38;5;248mU[0m[38;5;241m[[[0m[38;5;245mr[0m[38;5;252mw[0m[38;5;253mh#MMMMMMMM[0m[38;5;241m][0m[38;5;255m [0m[38;5;231m   [0m \r
[0m[38;5;231m      [0m[38;5;254m [0m[38;5;253mMMMMMM[0m[38;5;248mY[0m[38;5;246mc[0m[38;5;248mC[0m[38;5;253mk*[0m[38;5;250mO[0m[38;5;248mz[0m[38;5;246mu[0m[38;5;253mhMMMMM[0m[38;5;245mr[0m[38;5;254m [0m[38;5;255m [0m[38;5;231m     [0m \r
[0m[38;5;231m         [0m[38;5;255m [0m[38;5;254m [0m[38;5;232m,[0m[38;5;253maMMMMMMMMMMM[0m[38;5;244m([0m[38;5;254m  [0m[38;5;255m [0m[38;5;231m        [0m \r
[0m[38;5;231m            [0m[38;5;255m [0m[38;5;254m  [0m[38;5;241m+[0m[38;5;248mC[0m[38;5;253mho[0m[38;5;250mm[0m[38;5;244m([0m[38;5;232m [0m[38;5;254m [0m[38;5;255m [0m[38;5;231m            [0m\r
`)} else {
      this.write(`[0m[38;5;231m        [0m[38;5;16m,[0m[38;5;102mx[0m[38;5;59m<-[0m[38;5;145mv[0m[38;5;231m          [0m[38;5;59m1[0m[38;5;102m)[0m[38;5;59m<[[0m[38;5;102mf[0m[38;5;231m       [0m[38;5;231m [0m\r
[0m[38;5;231m       [0m[38;5;145mc[0m[38;5;59m}<<<<[0m[38;5;102mj)[0m[38;5;231m       [0m[38;5;145mY[0m[38;5;59m-<<<~[0m[38;5;145mc[0m[38;5;59m;[0m[38;5;231m     [0m[38;5;231m [0m\r
[0m[38;5;231m     [0m[38;5;16m.[0m[38;5;145mJ[0m[38;5;59m?-____-[0m[38;5;95m{[0m[38;5;102mr[0m[38;5;231m    [0m[38;5;59m_[0m[38;5;102mr[0m[38;5;59m_______[0m[38;5;101m|[0m[38;5;102m|[0m[38;5;231m    [0m[38;5;231m [0m\r
[0m[38;5;231m     [0m[38;5;138mz[0m[38;5;215mL[0m[38;5;209mCYYYYYU[0m[38;5;215mL0[0m[38;5;59m][0m[38;5;231m   [0m[38;5;180mL[0m[38;5;215mL[0m[38;5;209mJYYYYYJ[0m[38;5;215mL[0m[38;5;216mm[0m[38;5;16m.[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;16m [0m[38;5;215mQL[0m[38;5;209mUYYYYYUC[0m[38;5;215mLZ[0m[38;5;216mqqq[0m[38;5;215mLL[0m[38;5;209mJUYYYYYC[0m[38;5;215mL[0m[38;5;102mt[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m<[0m[38;5;215mL[0m[38;5;209mCYYUJC[0m[38;5;215mLLLLLLLLLLLL[0m[38;5;209mLCUYYJ[0m[38;5;215mL[0m[38;5;137mr[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m<[0m[38;5;215mL[0m[38;5;209mCUC[0m[38;5;215mLLLLLLLLLLLLLLLLLL[0m[38;5;209mLJJ[0m[38;5;215mL[0m[38;5;137mr[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m<[0m[38;5;215mLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;209mL[0m[38;5;215mL[0m[38;5;137mr[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m<[0m[38;5;215mLLLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;137mr[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m<[0m[38;5;215mLLLLLLLLLLLLLLLLLLLLLLLLLL[0m[38;5;137mr[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;59m_[0m[38;5;215mLLLLLLL[0m[38;5;95m{[0m[38;5;59m-[0m[38;5;137mt[0m[38;5;215mLLLLLL[0m[38;5;173mn[0m[38;5;59m-[0m[38;5;95m][0m[38;5;209mU[0m[38;5;215mLLLLLL[0m[38;5;137mn[0m[38;5;231m   [0m[38;5;231m [0m\r
[0m[38;5;216mw[0m[38;5;223mbb[0m[38;5;216md[0m[38;5;215mZLLLLLLL[0m[38;5;59m]~[0m[38;5;131m\[0m[38;5;215mLLLLLL[0m[38;5;137mx[0m[38;5;59m~_[0m[38;5;173mY[0m[38;5;215mLLLLLLQ[0m[38;5;216mp[0m[38;5;223mbb[0m[38;5;223mb[0m\r
[0m[38;5;52m:[0m[38;5;216mmmmmmmmmmZ[0m[38;5;215mOQ[0m[38;5;209mJ[0m[38;5;215mL[0m[38;5;209mJ[0m[38;5;173munnuX[0m[38;5;215mL[0m[38;5;209mJ[0m[38;5;215mLOZ[0m[38;5;216mmmmmmmmmm[0m[38;5;137mf[0m\r
[0m[38;5;231m [0m[38;5;16m:[0m[38;5;223mMMMMMMMMMM#o[0m[38;5;222mk[0m[38;5;180mJ[0m[38;5;59m?<<~[0m[38;5;137mj[0m[38;5;222md[0m[38;5;223ma#MMMMMMMMMM[0m[38;5;102mf[0m[38;5;231m [0m\r
[0m[38;5;231m  [0m[38;5;254m [0m[38;5;144mC[0m[38;5;223mMMMMMMMMMMMM*[0m[38;5;101m/[0m[38;5;59m_[0m[38;5;187mp[0m[38;5;223mMMMMMMMMMMMMM[0m[38;5;16m^[0m[38;5;231m [0m[38;5;231m [0m\r
[0m[38;5;231m    [0m[38;5;254m [0m[38;5;187md[0m[38;5;223mMMMMMMMMo[0m[38;5;187md[0m[38;5;144mU[0m[38;5;59m[[[0m[38;5;102mr[0m[38;5;187mw[0m[38;5;223mh#MMMMMMMM[0m[38;5;59m][0m[38;5;255m [0m[38;5;231m  [0m[38;5;231m [0m\r
[0m[38;5;231m      [0m[38;5;254m [0m[38;5;58m;[0m[38;5;223mMMMMMM[0m[38;5;144mY[0m[38;5;138mc[0m[38;5;144mC[0m[38;5;223mk*[0m[38;5;181mO[0m[38;5;144mz[0m[38;5;138mu[0m[38;5;223mhMMMMM[0m[38;5;102mr[0m[38;5;254m [0m[38;5;255m [0m[38;5;231m    [0m[38;5;231m [0m\r
[0m[38;5;231m         [0m[38;5;255m [0m[38;5;254m [0m[38;5;16m,[0m[38;5;223maMMMMMMMMMMM[0m[38;5;101m([0m[38;5;254m  [0m[38;5;255m [0m[38;5;231m       [0m[38;5;231m [0m\r
[0m[38;5;231m            [0m[38;5;255m [0m[38;5;254m  [0m[38;5;59m+[0m[38;5;144mC[0m[38;5;223mho[0m[38;5;181mm[0m[38;5;101m([0m[38;5;16m [0m[38;5;254m [0m[38;5;255m [0m[38;5;231m           [0m[38;5;231m [0m\r
`)}
    return Promise.resolve(null)
  }
}

export class ClearCommand extends Command {
  static name = "clear";
  static aliases = ["cls"];
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    term.reset();
    this.write("\x1b[A");
    return Promise.resolve(null)
  }
}

export class OpenCommand extends Command {
  static name = "open";
  static description = "Open a file in a new window";
  static strings = {
    file: {
      nargs: 1,
      help: "File to open",
      required: true
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    if (!params.strings.file) {
      this.write(`open: expected 1 argument\r\nTry 'help open' for more information.\r\n`);
      return Promise.reject()
    }
    return $.ajax({
      url: 'cat',
      data: {cwd: term.dir, path: params.strings.file},
      type: 'GET',
      statusCode: {
        400: () => {
          this.write("open: invalid parameters.\r\nTry 'help open' for more information.\r\n");
        },
        403: () => {
          this.write(`-foxterm: open: accessing parent directories is currently disabled for security reasons.\r\n`);
        },
        404: () => {
          this.write(`open: ${params.strings.file}: No such file!\r\n`);
        }
      },
      error: (request, status, error) => {
        if ([400, 403, 404].some(s => s === request.status)) { return }
        this.write(`-foxterm: An error occurred trying to fetch data! Please report this to taggie. This shouldn't happen.\r\nError type: ${status}\r\nError thrown: ${error}\r\n`);
      },
      success: (data) => {
        const uuid = crypto.randomUUID();
        WindowManager[uuid] = new MarkdownDisplay();
        WindowManager[uuid].setText(data.join("\n"));
        WindowManager[uuid].window.setTitle(params.strings.file)
        WindowManager[uuid].window.self.trigger("mousedown");
        WindowManager[$(".focus").closest('.window.ui-draggable').attr("window-id")].term.blur();
      }
    })
  }
}

export class PwdCommand extends Command {
  static name = "pwd";
  static description = "Print the name of the current working directory.";
  static aliases = ["cwd"];
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    this.write(
      term.dir.replace("~/", "/")
              .replace("~", "/")
    );
    return Promise.resolve(null)
  }
}

export class LsCommand extends Command {
  static name = "ls";
  static description = "List the files in a given directory (defaults to current directory)";
  static strings = {
    dir: {
      nargs: 1,
      help: "",
      required: false
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec(params, term) {
    var [term, params] = [this.term, this.params];
    let body = {
      cwd: term.dir
    };
    if (params.strings.dir) {
      body.path = params.strings.dir;
    }
    return $.ajax({
      url: "ls",
      data: body,
      type: 'GET',
      statusCode: {
        400: () => {
          this.write("ls: invalid parameters.\r\nTry 'help ls' for more information.\r\n")
        },
        403: () => {
          this.write(`-foxterm: ls: accessing parent directories is currently disabled for security reasons.\r\n`);
        },
        404: () => {
          this.write(`ls: cannot access ${params.strings.dir}: No such file or directory\r\n`)
        }
      },
      error: (request, status, error) => {
        if ([400, 403, 404].some(s => s === request.status)) { return }
        this.write(`An error occurred trying to fetch data! Please report this to taggie. This shouldn't happen.\r\nError type: ${status}\r\nError thrown: ${error}\r\n`);
      },
      success: (data) => {
        let entries = Object.entries(data);
        entries.sort((a, b) => {
          if (a[1].isDir && !b[1].isDir) { return -1 }
          if (!a[1].isDir && b[1].isDir) { return 1 }
          return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
        })
        entries.forEach((e) => {
          if (e.length != 2) {
            this.write(`${e[0]}\r\n`);
            return
          }
          this.write(`${e[1].isDir ? "\x1B[34;42m" : "\x1B[92m"}${e[0]}\x1B[39;49m\r\n`);
        })
      }
    })
  }
}

export class CatCommand extends Command {
  static name = "cat";
  static description = "Concatenate a file to stdout.";
  static strings = {
    file: {
      nargs: 1,
      help: "",
      required: true
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec(params, term) {
    var [term, params] = [this.term, this.params];
    if (!params.strings.file) {
      this.write("cat: expected one argument\r\nTry 'help cat' for more information.");
      return Promise.reject()
    }
    return $.ajax({
      url: 'cat',
      data: {cwd: term.dir, path: params.strings.file},
      type: 'GET',
      statusCode: {
        400: () => {
          this.write("cat: invalid parameters.\r\nTry 'help cat' for more information.");
        },
        403: () => {
          this.write(`-foxterm: cat: accessing parent directories is currently disabled for security reasons.`);
        },
        404: () => {
          this.write(`cat: ${params.strings.file}: No such file or directory`);
        }
      },
      error: (request, status, error) => {
        if ([400, 403, 404].some(s => s === request.status)) { return }
        this.write(`-foxterm: An error occurred trying to fetch data! Please report this to taggie. This shouldn't happen.\r\nError type: ${status}\r\nError thrown: ${error}`);
      },
      success: (data) => {
        data.forEach((e) => {
          this.write(e.replace("\n", "\r\n"))
        })
      }
    })
  }
}

export class CdCommand extends Command {
  static name = "cd";
  static description = "Change the shell working directory";
  static strings = {
    dir: {
      nargs: 1,
      help: "",
      required: true
    }
  }
  constructor(params, term) {
    super(params, term);
  }
  async exec() {
    var [term, params] = [this.term, this.params];
    if (!params.strings.dir) {
      this.write("cd: expected one argument\r\nTry 'help cd' for more information.");
      return Promise.reject()
    }
    if (params.strings.dir && params.strings.dir.includes("..")) {
      let currentPath = []
      if (params.strings.dir.charAt(0) != "/") {
        currentPath = term.dir.split("/")
      }
      const segments = currentPath.concat(params.strings.dir.split("/"));
      var newPath = [];
      segments.forEach((e) => {
        if (e == "..") {
          newPath.pop();
        } else {
          newPath.push(e);
        }
      })
      params.strings.dir = newPath.join("/").replaceAll(/\/+/g, "/");
    }
    return $.ajax({
      url: 'cd',
      data: {cwd: term.dir, path: params.strings.dir},
      type: 'GET',
      statusCode: {
        400: () => {
          this.write("cd: invalid parameters.\r\nTry 'help cd' for more information.\r\n");
        },
        403: () => {
          this.write(`-foxterm: cd: ${params.strings.dir}: Not a directory\r\n`);
        }
      },
      error: (request, status, error) => {
        if ([400, 403].some(s => s === request.status)) { return }
        this.write(`An error occurred trying to fetch data! Please report this to taggie. This shouldn't happen.\r\nError type: ${status}\r\nError thrown: ${error}\r\n`);
      },
      success: (data) => {
        if (params.strings.dir == "~" || params.strings.dir == "/") {
          term.dir = "~";
        } else {
          term.dir = `${term.dir}/${params.strings.dir}`.replaceAll(/\/+/g, "/");
        }
        term.regenHomeText();
      }
    })
  }
}

export const commands = [ 
  HelpCommand, TwitterCommand, GitHubCommand, EchoCommand, WhoAmICommand, 
  FoxCommand, ClearCommand, OpenCommand, LsCommand, CatCommand, CdCommand,
  PwdCommand
].sort((a, b) => {return a.name.localeCompare(b.name)});