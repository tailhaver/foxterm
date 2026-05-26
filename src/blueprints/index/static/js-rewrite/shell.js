import * as commands from "./commands.js";

function tokenize(line) {
  const out = [];
  let i = 0;
  let cur = "";
  let mode = "normal"; // normal | single | double

  const push = () => {
    if (cur.length) out.push(cur);
    cur = "";
  };

  while (i < line.length) {
    const ch = line[i];

    if (mode === "normal") {
      if (/\s/.test(ch)) {
        push();
        i++;
        continue;
      }
      if (ch === "'") {
        mode = "single";
        i++;
        continue;
      }
      if (ch === '"') {
        mode = "double";
        i++;
        continue;
      }
      if (ch === "\\") {
        // escape next char (if any)
        i++;
        if (i < line.length) cur += line[i++];
        continue;
      }
      cur += ch;
      i++;
      continue;
    }

    if (mode === "single") {
      if (ch === "'") {
        mode = "normal";
        i++;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }

    if (mode === "double") {
      if (ch === '"') {
        mode = "normal";
        i++;
        continue;
      }
      if (ch === "\\") {
        i++;
        if (i < line.length) cur += line[i++];
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
  }

  push();
  return out;
}

function parseBySpec(tokens, spec = {}) {
  const flagsDef = spec.flags ?? {};
  const optionsDef = spec.options ?? {};
  const positionalDef = spec.positional ?? [];

  const flagIndex = new Map();
  for (const [key, def] of Object.entries(flagsDef)) {
    for (const f of def.flags ?? []) flagIndex.set(f, { kind: "flag", key });
  }

  const optIndex = new Map();
  for (const [key, def] of Object.entries(optionsDef)) {
    for (const f of def.flags ?? []) optIndex.set(f, { kind: "option", key });
  }

  const flags = Object.fromEntries(Object.keys(flagsDef).map(k => [k, false]));
  const options = Object.fromEntries(Object.keys(optionsDef).map(k => [k, null]));
  const extras = [];

  let i = 0;
  let stop = false;
  while (i < tokens.length) {
    const t = tokens[i];

    if (!stop && t === "--") {
      stop = true;
      i++;
      continue;
    }

    if (!stop && (flagIndex.has(t) || optIndex.has(t))) {
      const hit = flagIndex.get(t) || optIndex.get(t);
      if (hit.kind === "flag") {
        flags[hit.key] = true;
        i++;
        continue;
      }

      // option expects 1 value by default
      const def = optionsDef[hit.key] ?? {};
      const nargs = def.nargs ?? 1;
      if (nargs !== 1) {
        throw new Error("Only options with nargs=1 are currently supported.");
      }

      if (i + 1 >= tokens.length) {
        return { error: `missing value for ${t}` };
      }
      options[hit.key] = tokens[i + 1];
      i += 2;
      continue;
    }

    extras.push(t);
    i++;
  }

  // assign positional
  const positional = {};
  let p = 0;
  let j = 0;

  while (p < positionalDef.length) {
    const def = positionalDef[p];
    const name = def.name;
    const nargs = def.nargs ?? 1;
    const required = def.required ?? false;

    if (nargs === "*") {
      positional[name] = extras.slice(j).join(" ");
      j = extras.length;
      p++;
      continue;
    }

    if (nargs === 1) {
      const val = extras[j];
      if (val == null) {
        if (required) return { error: `missing argument: ${name}` };
        positional[name] = null;
      } else {
        positional[name] = val;
        j++;
      }
      p++;
      continue;
    }

    throw new Error("Only positional nargs=1 or '*' are currently supported.");
  }

  // anything left over = extras
  const rest = extras.slice(j);

  // validate required options
  for (const [key, def] of Object.entries(optionsDef)) {
    if ((def.required ?? false) && (options[key] == null || options[key] === "")) {
      return { error: `missing required option: ${key}` };
    }
  }

  return { flags, options, positional, rest };
}

class ShellData {
  constructor() {
    this.currentProgram = null;
    this.user = "guest";
    this.currentDirectory = "~";
    this.regenHomeText();
    this.currentLine = "";
    this.history = [];
    this.lineInHistory = 0;
  }
  regenHomeText() {
    const re = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    this.homeText = `\x1b[1;92m${this.user}@taggie-server\x1b[1;0m:\x1b[1;94m${this.currentDirectory}\x1b[0m$ `;
    this.homeLength = this.homeText.replace(re, "").length;
  }
}

class CommandQueue {
  constructor(shell) {
    this.shell = shell;
    this.queue = [];
    this.active = false;
  }
  push(item) {
    this.queue.push(item);
  }
  async process() {
    this.active = true;

    while (this.queue.length) {
      const item = this.queue.shift();
      const line = typeof item === "string" ? item : item.line;
      const echo = typeof item === "string" ? true : (item.echo !== false);

      await this.shell.executeLine(line, { echo })
    }

    this.active = false;
  }
}

export default class Shell {
  constructor(terminal) {
    this.terminal = terminal;
    this.shellData = new ShellData();
    this.commands = Object.fromEntries(
      Object.values(commands).map(e => [e.name, e])
    )
    this.aliases = Object.values(this.commands).reduce((acc, command) => (command.aliases.forEach(a => acc[a] = command.name), acc), {});
    this.writeHomeText();
  }
  writeHomeText() {
    this.terminal.print(this.shellData.homeText);
  }
  #clearLine() {
    this.terminal.print("\x1b[M");
  }
  #handleEscape(key, event) {
    const buffer = this.terminal.term.buffer.active._buffer;
    const match = key.match(/\[([\d;]*?)(\D)$/);
    // TODO: refactor to use \x1b[nG and/or \x1b[s + \x1b[u
    switch (match[2]) {
      case "A": // CUU
        if (this.shellData.history.length <= this.shellData.lineInHistory) break;
        this.#clearLine();
        this.writeHomeText();
        this.shellData.lineInHistory += match[1] !== "" ? parseInt(match[1]) : 1;
        this.shellData.lineInHistory = Math.min(this.shellData.history.length, this.shellData.lineInHistory);
        this.shellData.currentLine = this.shellData.history.at(-this.shellData.lineInHistory);
        this.terminal.print(this.shellData.currentLine);
        break;
      case "B": // CUD
        if (this.shellData.lineInHistory == 0) break;
        this.#clearLine();
        this.writeHomeText();
        this.shellData.lineInHistory--;
        this.shellData.currentLine =
          this.shellData.lineInHistory == 0 ? "" :
          this.shellData.history.at(-this.shellData.lineInHistory);
        this.terminal.print(this.shellData.currentLine);
        break;
      case "C": // CUF
        if (buffer.x >= this.shellData.currentLine.length + this.shellData.homeLength) break;
        this.terminal.print("\x1b[C");
        break;
      case "D": // CUB
        if (buffer.x <= this.shellData.homeLength) break;
        this.terminal.print("\x1b[D");
        break;
      case "~": // f5 or ctrl+f5
        if (match[1] == "15") window.location.reload();
        if (match[1] == "15;5") window.location.reload(true);
        break
    }
  }
  inputHandler(key, event) {
    const buffer = this.terminal.term.buffer.active._buffer
    console.log(key.charCodeAt(0));
    switch (key.charCodeAt(0)) {
      case 0x0C: // form feed
        break
      case 0x0D: // newline
        this.shellData.lineInHistory = 0;
        if (this.shellData.currentLine != "") {
          this.shellData.history.push(this.shellData.currentLine);
        }
        this.terminal.print("\n");
        this.executeLine(this.shellData.currentLine, {echo: false});
        this.shellData.currentLine = "";
        break
      case 0x7F: // backspace
        if (buffer.x <= this.shellData.homeLength) {
          break;
        }
        this.shellData.currentLine = this.shellData.currentLine.slice(0, -1);
        this.terminal.print("\b \b");
        break
      case 0x1B: // CSI commands
        this.#handleEscape(key, event);
        break
      default:
        this.terminal.print(key);
        if (buffer.x === this.shellData.currentLine.length + this.shellData.homeLength + 1) {
          this.shellData.currentLine += key;
          break;
        }
        const cursorPos = buffer.x - this.shellData.homeLength - 1;
        let temp = this.shellData.currentLine.slice(0, cursorPos);
        temp += key;
        temp += this.shellData.currentLine.slice(cursorPos + 1, this.shellData.currentLine.length);
        this.shellData.currentLine = temp;
    }
  }
  #resolveCanonicalName(name) {
    if (name in this.commands) return name;
    if (name in this.aliases) return this.aliases[name];
    return null;
  }

  async executeLine(line, {echo = true } = {}) {
    console.log(line)
    if (line == null) {
      this.writeHomeText();
      return
    };
    const trimmed = line.trim();
    if (!trimmed) {
      this.writeHomeText();
      return
    };
    
    if (echo) this.terminal.println(trimmed);

    const tokens = tokenize(trimmed);
    const commandToken = tokens[0];
    const argv = tokens.slice(1);

    const canonical = this.#resolveCanonicalName(commandToken);
    if (!canonical) {
      this.terminal.println(`-foxterm: ${commandToken}: command not found`);
      this.writeHomeText();
      return;
    }

    const Command = this.commands[canonical];
    const parsed = parseBySpec(argv, Command.spec ?? {});

    const ctx = {
      shell: this,
      raw: trimmed,
      tokens,
      argv,
      args: parsed.positional ?? {},
      flags: parsed.flags ?? {},
      options: parsed.options ?? {}
    };
    
    try {
      const instance = new Command(ctx);
      this.shellData.currentProgram = instance;

      await Promise.resolve(instance.exec.call(instance))
    } catch (_) {
      throw _;
    } finally {
      this.shellData.currentProgram = null;
      if (Command.postNewline) {
        this.terminal.print("\r\n");
      }
      this.writeHomeText();
    }
  }
}