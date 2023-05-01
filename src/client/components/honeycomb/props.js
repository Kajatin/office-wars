export default class HexProperties {
  color;
  active = false;

  constructor(props) {
    this.color = this.tileKindToColor(props?.kind);
  }

  setColor(color) {
    this.color = color;
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
      default:
        return window?.p5?.color(250, 250, 249);
    }
  }
}
