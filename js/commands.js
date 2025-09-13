// less evil file for containing my less evil command classes
// taggie pyle, 2025
// https://github.com/tailhaver

export class Command {
  static name = "";
  static description = "";
  static aliases = [];
  static usage = "";
  static help = "";
  static exec(params, term) {
    throw new Error("Method 'exec()' is not implemented.")
  }
}

export class HelpCommand extends Command {
  static name = "help";
  static description = "Display information about builtin commands.";
  static usage = "help [command]"
  static help = "\tArguments:\r\n\t  COMMAND\tCommand to view the help string for";
  static exec(params, term) {
    if (params.length == 0) {
      term.write(`Available commands: ${commands.map((e) => {return e.name}).join(", ")}`);
      return
    }
    let command = null;
    if (Object.keys(term.commands).includes(params[0])) {
      command = term.commands[params[0]];
    } else if (Object.keys(term.aliases).includes(params[0])) {
      command = term.commands[term.aliases[params[0]]];
    }
    if (command == null) {
      term.write(`help: expected 1 argument\r\nTry 'help help' for more information.`)
      return
    }
    if (command.usage.length == 0 && command.description.length == 0 && command.help.length == 0) {
      term.write(`-foxterm: help: no topics match '${params[0]}'.`)
      return
    }
    term.write(`${command.name}: ${command.usage}${command.description.length > 0 ? '\r\n\t' + command.description : ''}${command.help.length > 0 ? '\r\n\r\n' + command.help : ''}`)
  }
}

export class TwitterCommand extends Command {
  static name = "twitter";
  static description = "Display a link to my Twitter profile.";
  static aliases = ["twt", "x"];
  static usage = "twitter";
  static exec(params, term) {
    term.write("my twitter: \x1b]8;;http://twitter.com/transfoxes\x1b\\@transfoxes\x1b]8;;\x1b");
  }
}

export class GitHubCommand extends Command {
  static name = "github";
  static description = "Display a link to my GitHub profile.";
  static aliases = ["git", "gh"];
  static usage = "github"
  static exec(params, term) {
    term.write("my github: \x1b]8;;http://github.com/tailhaver\x1b\\@tailhaver\x1b]8;;\x1b");
  }
}

export class EchoCommand extends Command {
  static name = "echo";
  static description = "Write arguments to stdout.";
  static usage = "echo [args ...]"
  static exec(params, term) {
    term.write(params.join(" "));
  }
}

export class WhoAmICommand extends Command {
  static name = "whoami";
  static exec(params, term) {
    term.write(term.user);
  }
}

// what the fuck is this. what am i doing.
// i should submit this when seeking a diagnosis for being Clinically Insane
export class FoxCommand extends Command {
  static name = "fox";
  static usage = "fox [-g, --grayscale]"
  static help = "\tOptions:\r\n\t  -g, --grayscale"
  static exec(params, term) {
    if (params.some(s => ["-g", "--grayscale"].includes(s))) {
      term.write(`[0m[38;5;231m        [0m[38;5;232m,[0m[38;5;245mx[0m[38;5;241m<-[0m[38;5;249mv[0m[38;5;231m          [0m[38;5;241m1[0m[38;5;245m)[0m[38;5;241m<[[0m[38;5;245mf[0m[38;5;231m        [0m \r
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
      term.write(`[0m[38;5;231m        [0m[38;5;16m,[0m[38;5;102mx[0m[38;5;59m<-[0m[38;5;145mv[0m[38;5;231m          [0m[38;5;59m1[0m[38;5;102m)[0m[38;5;59m<[[0m[38;5;102mf[0m[38;5;231m       [0m[38;5;231m [0m\r
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

export class ClearCommand extends Command {
  static name = "clear";
  static aliases = ["cls"];
  static exec(params, term) {
    term.reset();
    term.write("\x1b[A");
  }
}

export class OpenCommand extends Command {
  static name = "open";
  static description = "Open a social page in a new tab";
  static usage = "open [arg]";
  static help = "\tArguments:\r\n\t  PAGE\tOne of 'twitter', 'twt', 'x', 'github', 'git', or 'gh'.";
  static exec(params, term) {
    if (params.length != 1) {
      term.write(`open: expected 1 argument\r\nTry 'help open' for more information.\r\n`)
      return false
    }
    if (!params.some(s => ["git", "github", "gh", "twitter", "twt", "x"].includes(s))) {
      term.write(`open: invalid option ${params}\r\nTry 'help open' for more information\r\n`)
      return false
    }
    if (params.some(s => ["git", "github", "gh"].includes(s))) {
      window.open("https://github.com/tailhaver", "_blank");
      return
    }
    window.open("https://twitter.com/transfoxes", "_blank");
  }
}

const commands = [
  HelpCommand, TwitterCommand, GitHubCommand, EchoCommand, WhoAmICommand, FoxCommand, ClearCommand, OpenCommand
]