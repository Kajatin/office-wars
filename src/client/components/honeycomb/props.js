export default class HexProperties {
  constructor(props) {
    this.visible = props?.visible || false;
    this.kind =
      props?.kind ||
      window?.p5?.random([
        "plain",
        "water",
        "sand",
        "rock",
        "mountain",
        "forest",
      ]);
    this.color = this.tileKindToColor(this.kind);
  }

  setColor(color) {
    this.color = color;
  }

  setVisible(visible) {
    this.visible = visible;
  }

  isBlocking() {
    return this.kind === "mountain" || this.kind === "rock";
  }

  tileKindToColor(kind) {
    switch (kind) {
      case "plain":
        return window?.p5?.color(220, 237, 74);
      case "water":
        return window?.p5?.color(74, 150, 237);
      case "sand":
        return window?.p5?.color(194, 178, 128);
      case "rock":
        return window?.p5?.color(138, 138, 138);
      case "mountain":
        return window?.p5?.color(88, 88, 88);
      case "forest":
        return window?.p5?.color(63, 158, 69);
      default:
        return window?.p5?.color(250, 250, 249);
    }
  }
}
