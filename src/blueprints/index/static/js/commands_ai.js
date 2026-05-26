import { CommandError } from "./errors.js";
import MarkdownDisplay from "./markdown.js";
import UserListDisplay from "./userList.js";
import WindowManager from "./windowManager.js";

/**
 * Standardized base command.
 *
 * Each command receives ctx:
 * {
 *   term, raw, tokens, argv,
 *   flags: { ... },
 *   options: { ... },
 *   args: { ... },   // positionals by name
 *   rest: []         // extra unconsumed tokens (if any)
 * }
 *
 * Command classes define:
 * static name = "..."
 * static aliases = []
 * static description = ""
 * static visible = true
 * static spec = { flags, options, positionals }
 * static help = "..."
 * static postNewline = true|false
 */
export class Command {
  static name = "";
  static aliases = [];
  static description = "";
  static visible = true;
  static spec = {};
  static help = "";
  static postNewline = true;

  constructor(ctx) {
    this.ctx = ctx;
    this.term = ctx.term;
    this.running = true;
    this._xhr = null; // active jqXHR (for cancellation)
  }

  write(s) {
    if (!this.running) throw new CommandError("Command cancelled.");
    this.term.write(s ?? "");
  }

  writeln(s = "") {
    if (!this.running) throw new CommandError("Command cancelled.");
    this.term.write(`${s}\r\n`);
  }

  cancel() {
    this.running = false;
    if (this._xhr && typeof this._xhr.abort === "function") {
      try { this._xhr.abort(); } catch (_) {}
    }
  }

  /**
   * request(): unified jQuery ajax wrapper with consistent error handling.
   *
   * opts = {
   *   url, type='GET', data,
   *   status: { 400: fn, 403: fn, ... }  // optional per-status handlers
   *   onSuccess: fn(data),
   *   onError: fn(request,status,error), // optional
   *   genericErrorPrefix: string         // optional
   * }
   */
  request(opts) {
    const {
      url,
      type = "GET",
      data = undefined,
      status = {},
      onSuccess = null,
      onError = null,
      genericErrorPrefix = "-foxterm: An error occurred trying to fetch data! Please report this to the site admin. This shouldn't happen."
    } = opts;

    const xhr = $.ajax({
      url,
      type,
      data,
      statusCode: status,
      success: (payload) => {
        if (!this.running) return;
        if (typeof onSuccess === "function") onSuccess(payload);
      },
      error: (request, st, err) => {
        if (!this.running) return;

        // If a statusCode handler exists, jQuery still calls error; suppress generic message.
        if (request && request.status && status && status[request.status]) return;

        if (typeof onError === "function") {
          onError(request, st, err);
          return;
        }

        this.writeln(genericErrorPrefix);
        this.writeln(`Error type: ${st}`);
        this.writeln(`Error thrown: ${err}`);
      }
    });

    this._xhr = xhr;
    return xhr;
  }
}

function usageFor(Cmd, term) {
  if (typeof Cmd.usage === "function") return Cmd.usage(term);
  if (term && typeof term.usageFor === "function") return term.usageFor(Cmd);
  return Cmd.name;
}

/* ------------------------- Built-in commands ------------------------- */

export class HelpCommand extends Command {
  static name = "help";
  static description = "Display information about builtin commands.";
  static spec = {
    positionals: [{ name: "command", nargs: "*", required: false }]
  };
  static help = "\tArguments:\r\n\t  command\tCommand to view help for";

  exec() {
    const { term, args } = this.ctx;
    const requested = args.command;

    if (!requested) {
      const list = Object.values(term.commands)
        .filter(C => C.visible !== false)
        .map(C => C.name)
        .sort((a, b) => a.localeCompare(b))
        .join(", ");
      this.write(`Available commands: ${list}`);
      return;
    }

    const name = requested.trim().split(/\s+/)[0];
    const canonical = (name in term.commands) ? name : (term.aliases[name] ?? null);
    if (!canonical) {
      this.writeln(`-foxterm: help: no topics match '${name}'.`);
      throw new CommandError("help lookup failed");
    }

    const Cmd = term.commands[canonical];
    const usage = usageFor(Cmd, term);

    if ((!Cmd.description || Cmd.description.length === 0) && (!Cmd.help || Cmd.help.length === 0)) {
      this.writeln(`-foxterm: help: no topics match '${name}'.`);
      throw new CommandError("help lookup failed");
    }

    this.writeln(`${Cmd.name}: ${usage}`);
    if (Cmd.description) this.writeln(`\t${Cmd.description}`);
    if (Cmd.help) this.writeln(`\r\n${Cmd.help}`);
  }
}

export class TwitterCommand extends Command {
  static name = "twitter";
  static description = "Display a link to my Twitter profile.";
  static aliases = ["twt", "x"];

  exec() {
    // OSC 8 hyperlink
    this.write("my twitter: \x1b]8;;http://twitter.com/[data removed]\x1b\\[data removed]\x1b]8;;\x1b\\");
  }
}

export class GitHubCommand extends Command {
  static name = "github";
  static description = "Display a link to my GitHub profile.";
  static aliases = ["git", "gh"];

  exec() {
    this.write("my github: \x1b]8;;http://github.com/[data removed]\x1b\\[data removed]\x1b]8;;\x1b\\");
  }
}

export class EchoCommand extends Command {
  static name = "echo";
  static description = "Write arguments to stdout.";
  static spec = { positionals: [{ name: "text", nargs: "*", required: false }] };

  exec() {
    const text = this.ctx.args.text ?? "";
    this.write(text);
  }
}

export class WhoAmICommand extends Command {
  static name = "whoami";
  static description = "Print the current user.";

  exec() {
    this.write(this.term.user);
  }
}

export class FoxCommand extends Command {
  static name = "fox";
  static spec = {
    flags: {
      grayscale: { flags: ["-g", "--grayscale"], help: "Use grayscale output" }
    }
  };

  exec() {
    if (this.ctx.flags.grayscale) {
      this.write(`[data truncated]`);
    } else {
      this.write(`[data truncated]`);
    }
  }
}

export class ClearCommand extends Command {
  static name = "clear";
  static aliases = ["cls"];
  static description = "Clear the terminal.";
  static postNewline = false;

  exec() {
    this.term.reset();
    // Move cursor up once so the prompt doesn't jump weirdly in some xterm.js configs
    this.write("\x1b[A");
  }
}

export class PwdCommand extends Command {
  static name = "pwd";
  static description = "Print the name of the current working directory.";
  static aliases = ["cwd"];

  exec() {
    this.write(
      this.term.dir
        .replace("~/", "/")
        .replace("~", "/")
    );
  }
}

export class LsCommand extends Command {
  static name = "ls";
  static description = "List the files in a given directory (defaults to current directory).";
  static spec = { positionals: [{ name: "dir", nargs: 1, required: false }] };

  exec() {
    const dir = this.ctx.args.dir;
    const body = { cwd: this.term.dir };
    if (dir) body.path = dir;

    return this.request({
      url: "ls",
      type: "GET",
      data: body,
      status: {
        400: () => this.writeln("ls: invalid parameters.\r\nTry 'help ls' for more information."),
        403: () => this.writeln(`-foxterm: ls: accessing parent directories is currently disabled for security reasons.`),
        404: () => this.writeln(`ls: cannot access ${dir}: No such file or directory`)
      },
      onSuccess: (data) => {
        let entries = Object.entries(data ?? {});
        entries.sort((a, b) => {
          const A = a[1], B = b[1];
          if (A?.isDir && !B?.isDir) return -1;
          if (!A?.isDir && B?.isDir) return 1;
          return (a[0] ?? "").toLowerCase().localeCompare((b[0] ?? "").toLowerCase());
        });

        for (const [name, meta] of entries) {
          const isDir = !!meta?.isDir;
          // keep your colors
          this.writeln(`${isDir ? "\x1B[34;42m" : "\x1B[92m"}${name}\x1B[39;49m`);
        }
      }
    });
  }
}

export class CatCommand extends Command {
  static name = "cat";
  static description = "Concatenate a file to stdout.";
  static spec = { positionals: [{ name: "file", nargs: 1, required: true }] };

  exec() {
    const file = this.ctx.args.file;
    if (!file) {
      this.writeln("cat: expected one argument");
      this.writeln("Try 'help cat' for more information.");
      throw new CommandError("missing arg");
    }

    return this.request({
      url: "cat",
      type: "GET",
      data: { cwd: this.term.dir, path: file },
      status: {
        400: () => this.writeln("cat: invalid parameters.\r\nTry 'help cat' for more information."),
        403: () => this.writeln(`-foxterm: cat: accessing parent directories is currently disabled for security reasons.`),
        404: () => this.writeln(`cat: ${file}: No such file or directory`)
      },
      onSuccess: (data) => {
        // Backend seems to return an array of lines.
        (data ?? []).forEach((line) => {
          this.write(String(line).replaceAll("\n", "\r\n"));
        });
      }
    });
  }
}

export class CdCommand extends Command {
  static name = "cd";
  static description = "Change the shell working directory.";
  static spec = { positionals: [{ name: "dir", nargs: 1, required: true }] };

  exec() {
    let path = this.ctx.args.dir;

    if (!path) {
      this.writeln("cd: expected one argument");
      this.writeln("Try 'help cd' for more information.");
      throw new CommandError("missing arg");
    }

    // Normalize simple ".." locally for nicer UX; server still enforces restrictions.
    if (path.includes("..")) {
      let base = [];
      if (!path.startsWith("/")) base = this.term.dir.split("/");
      const segments = base.concat(path.split("/"));
      const newPath = [];
      for (const seg of segments) {
        if (!seg || seg === ".") continue;
        if (seg === "..") newPath.pop();
        else newPath.push(seg);
      }
      path = newPath.join("/").replaceAll(/\/+/g, "/");
    }

    return this.request({
      url: "cd",
      type: "GET",
      data: { cwd: this.term.dir, path },
      status: {
        400: () => this.writeln("cd: invalid parameters.\r\nTry 'help cd' for more information."),
        403: () => this.writeln(`-foxterm: cd: ${path}: Not a directory`)
      },
      onSuccess: () => {
        if (path === "~" || path === "/") {
          this.term.dir = "~";
        } else if (path.startsWith("/")) {
          // Treat absolute path as from root => map to ~/<path> if your backend does that;
          // if not, keep it as "~" + path to preserve your earlier display semantics.
          this.term.dir = `~${path}`.replaceAll(/\/+/g, "/");
        } else {
          this.term.dir = `${this.term.dir}/${path}`.replaceAll(/\/+/g, "/");
        }
        this.term.regenHomeText();
      }
    });
  }
}

export class OpenCommand extends Command {
  static name = "open";
  static description = "Open a file in a new window.";
  static spec = { positionals: [{ name: "file", nargs: 1, required: true }] };

  exec() {
    const file = this.ctx.args.file;
    if (!file) {
      this.writeln("open: expected 1 argument");
      this.writeln("Try 'help open' for more information.");
      throw new CommandError("missing arg");
    }

    return this.request({
      url: "cat",
      type: "GET",
      data: { cwd: this.term.dir, path: file },
      status: {
        400: () => this.writeln("open: invalid parameters.\r\nTry 'help open' for more information."),
        403: () => this.writeln(`-foxterm: open: accessing parent directories is currently disabled for security reasons.`),
        404: () => this.writeln(`open: ${file}: No such file!`)
      },
      onSuccess: (data) => {
        const uuid = crypto.randomUUID();
        WindowManager[uuid] = new MarkdownDisplay();
        WindowManager[uuid].setText((data ?? []).join("\n"));
        WindowManager[uuid].window.setTitle(file);
        WindowManager[uuid].window.self.trigger("mousedown");

        // Unfocus current terminal window like you did before
        const focused = $(".focus").closest(".window.ui-draggable").attr("window-id");
        if (focused && WindowManager[focused]?.term?.blur) {
          WindowManager[focused].term.blur();
        }
      }
    });
  }
}

export class LoginCommand extends Command {
  static name = "login";
  static description = "Login with GitHub.";

  exec() {
    return this.request({
      url: "/github/get-login-url",
      type: "GET",
      status: {
        403: () => this.writeln(`-foxterm: login: already logged in!`)
      },
      genericErrorPrefix: "An error occurred trying to log in! Please report this to the site admin. This shouldn't happen.",
      onSuccess: (data) => {
        this.write(`\x1b]8;;${data.url}\x1b\\sign in with github\x1b]8;;\x1b\\`);
      }
    });
  }
}

export class LogoutCommand extends Command {
  static name = "logout";
  static description = "Logout.";

  exec() {
    return this.request({
      url: "/github/logout-term",
      type: "GET",
      status: {
        401: () => this.writeln(`-foxterm: logout: not logged in!`)
      },
      genericErrorPrefix: "An error occurred trying to log out! Please report this to the site admin. This shouldn't happen.",
      onSuccess: () => {
        WindowManager.updateUser();
        this.write("successfully logged out. :(");
      }
    });
  }
}

export class AdminListUsers extends Command {
  static name = "list_users";
  static visible = false;
  static description = "Admin: open the user list window.";

  exec() {
    return this.request({
      url: "admin/view_users",
      type: "GET",
      status: {
        403: () => this.writeln(`-foxterm: list_users: you do not have permission to do this!`)
      },
      onSuccess: () => {
        const uuid = crypto.randomUUID();
        WindowManager[uuid] = new UserListDisplay();
        WindowManager[uuid].window.self.trigger("mousedown");

        const focused = $(".focus").closest(".window.ui-draggable").attr("window-id");
        if (focused && WindowManager[focused]?.term?.blur) {
          WindowManager[focused].term.blur();
        }
      }
    });
  }
}

/* Export list (kept compatible with terminal.js import) */
export const commands = [
  AdminListUsers,
  CatCommand,
  CdCommand,
  ClearCommand,
  EchoCommand,
  FoxCommand,
  GitHubCommand,
  HelpCommand,
  LoginCommand,
  LogoutCommand,
  LsCommand,
  OpenCommand,
  PwdCommand,
  TwitterCommand,
  WhoAmICommand
].sort((a, b) => a.name.localeCompare(b.name));
