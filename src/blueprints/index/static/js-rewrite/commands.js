function getUsage(command) {
    let pattern = `${command.name}: ${command.name} `;
    let args = ``;
    if (command.spec.flags) {
      pattern += "[-"
      command.spec.flags.forEach(e => {
        pattern += e.flags[0].replace("-", "")
      })
      pattern += "] "
    }
    if (command.spec.positional) {
      command.spec.positional.forEach(e => {
        if (e.required) {
          pattern += `${e.name}${e.required ? "..." : ""} `
        } else {
          pattern += `[${e.name}${e.required ? "..." : ""}] `
        }
        args += `\t  ${e.name.toUpperCase()}\t${e.description}\n`
      })
    }
    return `${pattern}${command.description ? "\n\t" + command.description : ""}` + (args ? `\n\n\tArguments:\n${args.replace(/\n$/, "")}` : "")
  }

class Command {
  static name = "";
  static aliases = [];
  static description = "";
  static spec = {};
  static postNewline = true;

  constructor(ctx) {
    this.ctx = ctx;
    this.shell = ctx.shell;
    this.running = true;
    this._xhr = null;
  }

  kill() {
    this.running = false;
    if (this._xhr && typeof this._xhr.abort === "function") {
      try {
        this._xhr.abort();
      } catch (_) {

      }
    }
  }

  print(...string) {
    string.forEach(
      item => this.shell.terminal.print(item)
    );
  }

  println(...string) {
    string.forEach(
      item => {
        this.print(item, "\r\n")
      }
    );
  }

  err(...string) {
    string.forEach(
      item => {
        this.print(`-foxterm: ${Object.getPrototypeOf(this).constructor.name}: ${string}`)
        if (this.postNewline != null && !this.postNewline) this.print("\r\n");
      }
    );
  }

  errln(...string) {
    string.forEach(
      item => {
        this.err(item);
        this.print("\r\n");
      }
    )
  }

  request(options) {
    const {
      url,
      type = "GET",
      data = undefined,
      statusCode = {},
      onSuccess = null,
      onError = null
    } = options;

    this._xhr = $.ajax({
      url: url,
      type: type,
      data: data,
      statusCode: statusCode,
      success: (payload) => {
        if (!this.running) return;
        if (typeof onSuccess === "function") onSuccess(payload);
      },
      error: (request, status, error) => {
        if (!this.running) return;
        if (request && request.status && statusCode && request.status in statusCode) return;

        if (typeof onError === "function") {
          onError(request, status, error);
          return;
        }
        this.print("-foxterm: An error occurred trying to fetch data! Please report this to taggie. This should not happen :(.");
        if (!this.postNewline) {
          this.print("\r\n");
        }
      }
    });
    return this._xhr;
  }
}

export class Help extends Command {
  static name = "help";
  static description = "Display information about builtin commands.";
  static spec = {
    positional: [
      {name: "command", description: "Command to view help for", nargs: "*", required: false}
    ]
  };

  async exec() {
    const { shell, args } = this.ctx;
    if (!args.command) {
      const commandList = Object.values(shell.commands)
        .filter(e => e.visible !== false)
        .map(e => e.name)
        .sort((a, b) => a.localeCompare(b))
        .join(", ");
      shell.terminal.print(`Available commands: ${commandList}`);
      return Promise.resolve();
    }
    const name = args.command.trim().split(/\s+/)[0];
    const canonicalName = name in shell.commands ? name : (name in shell.aliases ? shell.aliases[name] : null)
    if (!canonicalName) {
      this.err(`no topics match '${name}'`);
      return Promise.reject();
    }
    const command = shell.commands[canonicalName];
    shell.terminal.print(getUsage(command));
  }
}

export class Twitter extends Command {
  static name = "twitter";
  static description = "Display a link to my Twitter profile.";
  static aliases = ["twt", "x"];

  exec() {
    this.print("my twitter: \x1b]8;;http://twitter.com/transfoxes\x1b\\@transfoxes\x1b]8;;\x1b");
  }
}

export class GitHub extends Command {
  static name = "github";
  static description = "Display a link to my GitHub profile.";
  static aliases = ["git", "gh"];

  exec() {
    this.print("my github: \x1b]8;;http://github.com/tailhaver\x1b\\@tailhaver\x1b]8;;\x1b");
  }
}

export class Echo extends Command {
  static name = "echo";
  static description = "Write arguments to stdout.";
  static postNewline = false;
  static spec = {
    positional: [
      {name: "text", nargs: "*", required: false}
    ]
  };
  exec() {
    // uses println so we don't have to manually determine the last argument
    // and remove the newline
    this.println(...this.ctx.argv);
  }
}

export class WhoAmI extends Command {
  static name = "whoami";

  exec() {
    this.print(this.shell.shellData.user);
  }
}

export class Fox extends Command {
  static name = "fox";
  static postNewline = false;
  static spec = {
    flags: {
      grayscale: {flags: ["-g", "--grayscale"]}
    }
  };
  exec() {
    if (this.ctx.flags.grayscale) {
      this.print(`[0m[38;5;231m        [0m[38;5;232m,[0m[38;5;245mx[0m[38;5;241m<-[0m[38;5;249mv[0m[38;5;231m          [0m[38;5;241m1[0m[38;5;245m)[0m[38;5;241m<[[0m[38;5;245mf[0m[38;5;231m        [0m \r
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
      this.print(`[0m[38;5;231m        [0m[38;5;16m,[0m[38;5;102mx[0m[38;5;59m<-[0m[38;5;145mv[0m[38;5;231m          [0m[38;5;59m1[0m[38;5;102m)[0m[38;5;59m<[[0m[38;5;102mf[0m[38;5;231m       [0m[38;5;231m [0m\r
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
  }
}

export class Clear extends Command {
  static name = "clear";
  static aliases = ["cls"];
  exec() {
    this.term.reset();
    this.print("\x1b[A");
  }
}

export class Pwd extends Command {
  static name = "pwd";
  static descrption = "Print the name of the current working directory.";
  static aliases = ["cwd"];
  exec() {
    this.print(this.shell.shellData.currentDirectory.replace("~/", "/").replace("~", "/"));
  }
}

export class Ls extends Command {
  static name = "ls";
  static description = "List the files in a given directory (defaults to current directory)";
  static postNewline = false;
  static spec = {
    positional: [
      {name: "dir", nargs: 1, required: false}
    ]
  };

  async exec() {
    const dir = this.ctx.args.dir;
    const body = {cwd: this.shell.shellData.currentDirectory}
    if (dir) body.path = dir
    return this.request({
      url: "ls",
      data: body,
      statusCode: {
        400: _ => this.errln("invalid parameters.\r\nTry 'help ls' for more information."),
        403: _ => this.errln("accessing parent directories is currently disabled for security reasons."),
        404: _ => this.errln(`cannot access ${dir}: No such file or directory`)
      },
      onSuccess: data => {
        let entries = Object.entries(data ?? {});
        entries.sort((a, b) => {
          if (a[1].isDir && !b[1].isDir) { return -1 }
          if (!a[1].isDir && b[1].isDir) { return 1 }
          return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
        })
        entries.forEach(e => {
          if (e.length != 2) {
            this.println(e[0]);
            return
          }
          this.println(`${e[1].isDir ? "\x1B[34;42m" : "\x1B[92m"}${e[0]}\x1B[39;49m`);
        })
      }
    })
  }
}

export class Cat extends Command {
  static name = "cat";
  static description = "Concatenate a file to stdout.";
  static spec = {
    positional: [
      {name: "file", nargs: 1, required: true}
    ]
  }; 
  async exec() {
    const file = this.ctx.args.file;
    if (!file) {
      this.errln("expected one argument\r\nTry 'help cat' for more information.");
      return;
    }
    const body = {cwd: this.shell.shellData.currentDirectory, path: file}
    return this.request({
      url: "cat",
      data: body,
      statusCode: {
        400: _ => this.errln("invalid parameters.\r\nTry 'help cat' for more information."),
        403: _ => this.errln("accessing parent directories is currently disabled for security reasons."),
        404: _ => this.errln(`cannot access ${dir}: No such file or directory`)
      },
      onSuccess: data => {
        data.forEach(e => this.print(e.replace("\n", "\r\n")))
      }
    })
  }
}