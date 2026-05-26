import { commands } from "./commands.js";
import { CommandError } from "./errors.js";
import Window from "./window.js";

// Strip ANSI escape sequences for prompt-length calculations.
const ANSI_RE =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

function stripAnsi(s) {
  return (s ?? "").replace(ANSI_RE, "");
}

/**
 * Tokenize a shell-ish command line.
 * Supports:
 * - whitespace separation
 * - single quotes '...'
 * - double quotes "..." with backslash escapes
 * - backslash escapes outside quotes
 */
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

/**
 * Parse tokens according to a command spec:
 * spec = {
 *   flags: { key: { flags: ['-g','--grayscale'] } },
 *   options: { key: { flags: ['-p','--path'], nargs: 1, required: false, metavar: 'PATH' } },
 *   positionals: [{ name: 'file', nargs: 1, required: true }, { name:'arg', nargs:'*' }]
 * }
 */
function parseBySpec(tokens, spec = {}) {
  const flagsDef = spec.flags ?? {};
  const optionsDef = spec.options ?? {};
  const positionalsDef = spec.positionals ?? [];

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

  // assign positionals
  const positionals = {};
  let p = 0;
  let j = 0;

  while (p < positionalsDef.length) {
    const def = positionalsDef[p];
    const name = def.name;
    const nargs = def.nargs ?? 1;
    const required = def.required ?? false;

    if (nargs === "*") {
      positionals[name] = extras.slice(j).join(" ");
      j = extras.length;
      p++;
      continue;
    }

    if (nargs === 1) {
      const val = extras[j];
      if (val == null) {
        if (required) return { error: `missing argument: ${name}` };
        positionals[name] = null;
      } else {
        positionals[name] = val;
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

  return { flags, options, positionals, rest };
}

function usageFor(cmdClass) {
  const name = cmdClass.name;
  const spec = cmdClass.spec ?? {};
  const parts = [name];

  // options/flags
  if (spec.options) {
    for (const def of Object.values(spec.options)) {
      const label = `${(def.flags ?? []).join("|")} ${def.metavar ?? def.argName ?? "VALUE"}`;
      parts.push(def.required ? label : `[${label}]`);
    }
  }
  if (spec.flags) {
    for (const def of Object.values(spec.flags)) {
      const label = `${(def.flags ?? []).join("|")}`;
      parts.push(`[${label}]`);
    }
  }

  // positionals
  if (spec.positionals) {
    for (const def of spec.positionals) {
      const label =
        def.nargs === "*"
          ? `${def.name}...`
          : `${def.name}`;
      parts.push(def.required ? label : `[${label}]`);
    }
  }

  return parts.filter(Boolean).join(" ");
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
      convertEol: true,
      letterSpacing: 0
    });

    this.term.options.linkHandler = {
      activate: (e, text) => {
        if (e.button === 0) window.open(text, "_blank").focus();
      },
      allowNonHttpProtocols: false
    };

    this.window = new Window(pos, size);
    this.window.setTitle("foxterm");
    this.window.handleWindowResize(pos, size);

    this.#initCommandRegistry();

    this.lock = false;

    this.user = "guest";
    this.dir = "~";
    this.regenHomeText();

    // line editing
    this.input = "";
    this.cursor = 0; // cursor within input

    // history
    this.lineHistory = [];
    this.historyIndex = 0; // 0 = not browsing history, 1 = most recent, ...

    // queue
    this.commandQueue = [];
    this.queueActive = false;

    // running command (for Ctrl+C)
    this.currentCommand = null;

    this.term.open(this.window.body);
    this.#resizeTerminal();

    $(this.window.self).resizable({
      handles: "all",
      containment: "parent",
      resize: () => this.#resizeTerminal()
    });

    this.writeHomeText();

    this.term.onData((data) => this.#handleData(data));

    setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
  }

  #initCommandRegistry() {
    // Map canonical command name -> class
    this.commands = Object.fromEntries(commands.map((C) => [C.name, C]));

    // Map alias -> canonical command name
    this.aliases = {};
    for (const C of commands) {
      for (const a of (C.aliases ?? [])) this.aliases[a] = C.name;
    }

    // Provide usage builder to commands via terminal if they want it
    this.usageFor = usageFor;
  }

  #resizeTerminal() {
    this.term.resize(
      Math.floor($(this.window.self).innerWidth() / 9) - 4,
      Math.floor(
        ($(this.window.self).innerHeight() -
          $($(this.window.self).children()[0]).innerHeight() -
          16) / 17
      )
    );
  }

  reset() {
    this.term.reset();
  }

  write(data) {
    this.term.write(data ?? "");
  }

  writeln(line = "") {
    this.write(`${line}\r\n`);
  }

  regenHomeText() {
    this.homeText = `\x1b[1;92m${this.user}@taggie-server\x1b[1;0m:\x1b[1;94m${this.dir}\x1b[0m$ `;
    this.homeLength = stripAnsi(this.homeText).length;
  }

  writeHomeText() {
    this.write(this.homeText);
  }

  #redrawInputLine() {
    // Clear current line and redraw: prompt + input, then move cursor back if needed.
    // \x1b[2K = clear entire line, \r = carriage return
    this.write("\x1b[2K\r");
    this.write(this.homeText);
    this.write(this.input);

    const back = this.input.length - this.cursor;
    if (back > 0) this.write(`\x1b[${back}D`);
  }

  #commitHistory(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    // If user navigated history and then entered a different command, drop "future"
    if (this.historyIndex !== 0) {
      this.lineHistory = this.lineHistory.slice(0, this.lineHistory.length - this.historyIndex);
      this.historyIndex = 0;
    }
    this.lineHistory.push(line);
  }

  #historyUp() {
    if (!this.lineHistory.length) return;
    if (this.historyIndex >= this.lineHistory.length) return;
    this.historyIndex += 1;
    this.input = this.lineHistory.at(-this.historyIndex);
    this.cursor = this.input.length;
    this.#redrawInputLine();
  }

  #historyDown() {
    if (this.historyIndex === 0) return;
    this.historyIndex -= 1;
    if (this.historyIndex === 0) {
      this.input = "";
    } else {
      this.input = this.lineHistory.at(-this.historyIndex);
    }
    this.cursor = this.input.length;
    this.#redrawInputLine();
  }

  async #handleEnter() {
    const line = this.input;
    this.input = "";
    this.cursor = 0;
    this.historyIndex = 0;

    this.write("\r\n");
    this.#commitHistory(line);

    // Enqueue typed command without echo (it was already visible)
    this.commandQueue.push({ line, echo: false });
    if (!this.queueActive) this.processQueue();
  }

  #handleBackspace() {
    if (this.lock) return;
    if (this.cursor <= 0) return;
    this.input = this.input.slice(0, this.cursor - 1) + this.input.slice(this.cursor);
    this.cursor -= 1;
    this.#redrawInputLine();
  }

  #handleLeft() {
    if (this.lock) return;
    if (this.cursor <= 0) return;
    this.cursor -= 1;
    this.write("\x1b[D");
  }

  #handleRight() {
    if (this.lock) return;
    if (this.cursor >= this.input.length) return;
    this.cursor += 1;
    this.write("\x1b[C");
  }

  #handlePrintable(ch) {
    if (this.lock) return;
    // Insert at cursor
    this.input = this.input.slice(0, this.cursor) + ch + this.input.slice(this.cursor);
    this.cursor += ch.length;
    this.#redrawInputLine();
  }

  #handleCtrlC() {
    // If a command is running, cancel it; otherwise clear current input like a shell.
    if (this.currentCommand && typeof this.currentCommand.cancel === "function") {
      try { this.currentCommand.cancel(); } catch (_) {}
      this.currentCommand = null;
      this.lock = false;
      this.writeln("^C");
      this.writeHomeText();
      this.input = "";
      this.cursor = 0;
      return;
    }

    if (this.lock) return;
    this.writeln("^C");
    this.writeHomeText();
    this.input = "";
    this.cursor = 0;
  }

  #handleCtrlL() {
    // Clear screen and redraw prompt+line.
    this.reset();
    this.writeHomeText();
    this.#redrawInputLine();
  }

  #handleData(e) {
    switch (e) {
      case "\r":
        this.#handleEnter();
        return;
      case "\x7F": // backspace
        this.#handleBackspace();
        return;
      case "\x1b[A": // up
        if (!this.lock) this.#historyUp();
        return;
      case "\x1b[B": // down
        if (!this.lock) this.#historyDown();
        return;
      case "\x1b[C":
        this.#handleRight();
        return;
      case "\x1b[D":
        this.#handleLeft();
        return;
      case "\x03": // Ctrl+C
        this.#handleCtrlC();
        return;
      case "\x0C": // Ctrl+L
        this.#handleCtrlL();
        return;
      case "\x1b[15~": // F5
        window.location.reload();
        return;
      case "\x1b[15;5~": // Ctrl+F5
        window.location.reload(true);
        return;
      default:
        // Filter out other control sequences quickly
        if (e.startsWith("\x1b")) return;
        this.#handlePrintable(e);
        return;
    }
  }

  #resolveCommandName(name) {
    if (name in this.commands) return name;
    if (name in this.aliases) return this.aliases[name];
    return null;
  }

  async #executeLine(line, { echo = true } = {}) {
    const trimmed = (line ?? "").trim();
    if (!trimmed) return;

    if (echo) this.writeln(trimmed);

    const tokens = tokenize(trimmed);
    const cmdToken = tokens[0];
    const argv = tokens.slice(1);

    const canonical = this.#resolveCommandName(cmdToken);
    if (!canonical) {
      this.writeln(`-foxterm: ${cmdToken}: command not found`);
      return;
    }

    const Cmd = this.commands[canonical];

    const parsed = parseBySpec(argv, Cmd.spec ?? {});
    if (parsed?.error) {
      const usage = (typeof Cmd.usage === "function")
        ? Cmd.usage(this)
        : usageFor(Cmd);
      this.writeln(`${canonical}: ${parsed.error}`);
      this.writeln(`Try 'help ${canonical}' for more information.`);
      this.writeln(`${usage}`);
      return;
    }

    const ctx = {
      term: this,
      raw: trimmed,
      tokens,
      argv,
      flags: parsed.flags ?? {},
      options: parsed.options ?? {},
      args: parsed.positionals ?? {},
      rest: parsed.rest ?? []
    };

    this.lock = true;

    let instance;
    try {
      instance = new Cmd(ctx);
      this.currentCommand = instance;

      // Support either exec() or run()
      const fn = instance.exec ?? instance.run;
      if (typeof fn !== "function") throw new Error(`${canonical} has no exec()/run()`);

      await Promise.resolve(fn.call(instance));
    } catch (err) {
      // CommandError: expected/soft failures
      if (err instanceof CommandError) {
        // Most commands already printed; if they didn't, show message.
        if (err.message) this.writeln(err.message);
      } else {
        // Unexpected: keep it visible for debugging
        this.writeln(`-foxterm: internal error: ${String(err?.message ?? err)}`);
        // optionally: console.error(err)
      }
    } finally {
      const postNewline = (Cmd.postNewline !== false);
      this.currentCommand = null;
      this.lock = false;
      if (postNewline) this.writeln();
      this.writeHomeText();
    }
  }

  async processQueue() {
    this.queueActive = true;

    while (this.commandQueue.length) {
      const item = this.commandQueue.shift();
      const line = typeof item === "string" ? item : item.line;
      const echo = typeof item === "string" ? true : (item.echo !== false);

      // eslint-disable-next-line no-await-in-loop
      await this.#executeLine(line, { echo });
    }

    this.queueActive = false;
  }

  /**
   * Keep existing API used by index.js:
   * sendCommand(input, queue=true, processQueue=true)
   *
   * Behavior preserved:
   * - queue=false: run immediately and echo line
   * - queue=true, processQueue=false: enqueue only
   * - queue=true, processQueue=true: enqueue and start processing
   */
  sendCommand(input, queue = true, processQueue = true) {
    if (!queue) {
      // run immediately, echo it
      this.#executeLine(input, { echo: true });
      return;
    }

    this.commandQueue.push({ line: input, echo: true });

    if (processQueue && !this.queueActive) {
      this.processQueue();
    }
  }

  updateUser(user) {
    this.user = (user == null) ? "guest" : user;
    this.regenHomeText();
  }
}
