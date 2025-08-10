// import { Terminal } from '@xterm/xterm';
var term = new Terminal({
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

let currentLine = "";
let lineHistory = [];
let dir = "~";
term.open(document.getElementById('terminal'));
term.write(`[1;92mguest@taggie-server[1;0m:[1;94m${dir}[0m$ `)
term.onData(e => {
    switch (e) {
        case '\r':
            lineHistory.push(currentLine);
            currentLine = ''
            term.write("\r\n")
        case '\x7F':
            currentLine = currentLine.slice(0, -1);
            term.write("\b \b")
        default:
            console.log(e.charCodeAt(0).toString(16));
            currentLine += e;
            term.write(e);
    }
    // if (e == '\r') {
    //     lineHistory.push(currentLine);
    //     currentLine = '';
    //     term.write("\r\n");
    // } else {
    //     currentLine += e;
    //     term.write(e);
    // }
})
// term.on("data", e => {
//     console.log(Object.keys(e))
// })

function handleCommand(input) {
    const args = input.split(' ');
    const command = args[0];
    const params = args.slice(1).join(' ');

    switch (command) {

    }
}