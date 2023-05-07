export default class HexProperties {
  constructor(props) {
    this.visible = props?.visible || false;
    this.kind = props?.kind;
    this.kindParsed = this.parseKind(this.kind);
    this.color = this.tileKindToColor(this.kindParsed);
    this.ontop = props?.ontop
      ? { ...props.ontop, color: this.parseColor(props.ontop.color) }
      : null;
  }

  parseColor(color) {
    const hexColor = color.replace("#", "") || "fcba03";
    var bigint = parseInt(hexColor, 16);
    var cr = (bigint >> 16) & 255;
    var cg = (bigint >> 8) & 255;
    var cb = bigint & 255;
    return window.p5.color(cr, cg, cb);
  }

  parseKind(kind) {
    switch (kind) {
      case 0:
        return "plains";
      case 1:
        return "hills";
      case 2:
        return "water";
      case 3:
        return "sand";
      case 4:
        return "forest";
      case 5:
        return "mountain";
      default:
        return "unknown";
    }
  }

  setColor(color) {
    this.color = color;
  }

  setVisible(visible) {
    this.visible = visible;
  }

  isBlocking() {
    return this.kind === "mountain" || this.kind === "hills";
  }

  tileKindToColor(kind) {
    switch (kind) {
      case "plains":
        return window?.p5?.color(220, 237, 74);
      case "hills":
        return window?.p5?.color(63, 158, 69);
      case "sand":
        return window?.p5?.color(194, 178, 128);
      case "water":
        return window?.p5?.color(74, 150, 237);
      case "forest":
        return window?.p5?.color(10, 158, 10);
      case "mountain":
        return window?.p5?.color(88, 88, 88);
      default:
        return window?.p5?.color(250, 250, 249);
    }
  }
}
