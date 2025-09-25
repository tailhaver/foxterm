import Window from "./window.js"

var converter = new showdown.Converter()

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
    $(this.window.body).html(converter.makeHtml(this.text));
  }
}