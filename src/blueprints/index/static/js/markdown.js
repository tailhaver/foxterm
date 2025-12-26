import Window from "./window.js"

var converter = new showdown.Converter()
converter.setFlavor('github');
converter.setOption('openLinksInNewWindow', true);

export default class MarkdownDisplay {
  constructor(pos = [24, 24], size = [738, 457]) {
    this.window = new Window(pos, size);
    this.window.setTitle("markdown");
    $(this.window.self).resizable({
      handles: "all",
      containment: "parent"
    });
    this.setText("...");
  }
  setText(text) {
    this.text = text;
    const osc8ToMD = new RegExp(/]8;;(.+?)\\(.+?)]8;;\\/g);
    this.text = this.text.replace(osc8ToMD, "[$2]($1)");
    $(this.window.body).html(converter.makeHtml(this.text));
  }
}