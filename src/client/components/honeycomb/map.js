import Hex from "./hex";

export default class Map {
  constructor(n, layout) {
    this.map = [];
    this.layout = layout;

    for (let row = 0; row <= 2 * n; row++) {
      for (let col = -n; col <= n; col++) {
        let { q, r, s } = Hex.offset_to_axial(row, col);
        this.map.push(new Hex(q, r, s));
      }
    }
  }

  selectHex(x, y) {
    let hex = this.getHexFromPixelCoords(x, y);

    //let neighbors = this.getNeighbors(hex);
    //neighbors.forEach(neighbor => neighbor.props.setColor(125));

    let fov = this.getHexesWithinDistance(hex, 3);
    fov.forEach((neighbor) => neighbor.props.setColor(125));

    let line = hex.linedraw(this.getHexFromPixelCoords(700, 500));
    line.forEach((seg) => {
      let hex = this.getHex(seg.q, seg.r);
      hex.props.setColor(90);
    });

    hex?.props?.setColor(55);
  }

  getHexFromPixelCoords(x, y) {
    let hex = this.layout.pixel_to_hex(window.p5.createVector(x, y)).round();
    return this.getHex(hex.q, hex.r);
  }

  getHex(q, r) {}

  getHexes() {
    return this.map;
  }

  getNeighbors(hex) {
    return this.map.filter((h) => h.isNeighbor(hex));
  }

  getNeighborsByDistance(hex, distance) {
    return this.map.filter((h) => h.distance(hex) === distance);
  }

  getNeighborsByDistanceFromHexes(hexes, distance) {
    return this.map.filter((h) =>
      hexes.some((hex) => h.distance(hex) === distance)
    );
  }

  getHexesWithinDistance(hex, distance) {
    return this.map.filter((h) => h.distance(hex) <= distance);
  }

  draw() {
    this.map.forEach((hex) => {
      let corners = this.layout.polygon_corners(hex);
      window.p5.stroke(0);
      hex.props?.color ? window.p5.fill(hex.props.color) : window.p5.noFill();
      window.p5.beginShape();
      corners.forEach((corner) => {
        window.p5.vertex(corner.x, corner.y);
      });
      window.p5.endShape(window.p5.CLOSE);
    });
  }
}
