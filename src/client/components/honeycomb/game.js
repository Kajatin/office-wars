import Map from "./map";
import Layout from "./layout";

export default class Game {
  constructor(fov, tank, orientation, size, origin) {
    this.layout = new Layout(orientation, size, origin);
    this.map = new Map(fov, tank, this.layout);
  }

  // hexFromPixelCoords(x, y) {
  //   return this.layout.pixelToHex(window.p5.createVector(x, y)).round();
  // }

  moveMap(x, y) {
    this.map.move(x, y);
  }

  scaleMap(zoom) {
    this.map.scale(zoom);
  }

  selectHex(x, y) {
    this.map.selectHex(x, y);
  }

  draw() {
    this.map.draw();
  }
}
