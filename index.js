var ansi_up = new AnsiUp();

function writeToConsole(string) {
    $("#terminal .body").append(ansi_up.ansi_to_html(`[0m${string}`))
}

var ansi_up = new AnsiUp();
var html = ansi_up.ansi_to_html(txt);
$("#terminal .body").append(txt);
