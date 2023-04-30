import Map from "./map";
import Layout from "./layout";

export default class Game {
  constructor(n, orientation, size, origin) {
    this.layout = new Layout(orientation, size, origin);
    this.map = new Map(n, this.layout);
  }

  hexFromPixelCoords(x, y) {
    return this.layout.pixel_to_hex(window.p5.createVector(x, y)).round();
  }

  selectHex(x, y) {
    this.map.selectHex(x, y);
  }

  draw() {
    this.map.draw();
  }
}
