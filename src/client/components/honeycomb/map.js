import Hex from "./hex";

export default class Map {
  constructor(fov, tank, layout) {
    this.map = [];
    this.layout = layout;

    this.pos = fov?.position || { q: 0, r: 0 };
    this.center = this.layout.hexToPixel(this.pos);

    const rows = fov?.height || 1;
    const cols = fov?.width || 1;
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        let { q, r, s } = Hex.offsetToAxial(row, col);
        let props = fov?.fov?.find((tile) => tile.q === q && tile.r === r);

        this.map.push(new Hex(q, r, s, props));

        if (this.pos.q === q && this.pos.r === r) {
          const hexColor = tank?.color?.replace("#", "") || "fcba03";
          var bigint = parseInt(hexColor, 16);
          var cr = (bigint >> 16) & 255;
          var cg = (bigint >> 8) & 255;
          var cb = bigint & 255;
          this.map[this.map.length - 1].props.setColor(
            window.p5.color(cr, cg, cb)
          );
        }
      }
    }
  }

  selectHex(x, y) {
    x = x + this.center.x - window.p5.width / 2;
    y = y + this.center.y - window.p5.height / 2;

    let hex = this.getHexFromPixelCoords(x, y);
    if (!hex) return;

    let neighbors = this.getNeighbors(hex);
    neighbors.forEach((neighbor) => neighbor.props.setColor(125));

    // let fov = this.getHexesWithinDistance(hex, 3);
    // fov.forEach((neighbor) => neighbor.props.setColor(125));

    // let line = hex.linedraw(this.getHex(this.pos.q, this.pos.r));
    // line.forEach((seg) => {
    //   let hex = this.getHex(seg.q, seg.r);
    //   hex.props.setColor(90);
    // });

    // hex?.props?.setColor(55);
  }

  getHexFromPixelCoords(x, y) {
    let hex = this.layout.pixelToHex(window.p5.createVector(x, y)).round();
    return this.getHex(hex.q, hex.r);
  }

  getHex(q, r) {
    return this.map.find((hex) => hex.q === q && hex.r === r);
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

  move(x, y) {
    this.center.x += x;
    this.center.y += y;
  }

  draw() {
    // Center around the player
    window.p5.push();
    window.p5.translate(
      window.p5.width / 2 - this.center.x,
      window.p5.height / 2 - this.center.y
    );

    this.map.forEach((hex) => {
      let corners = this.layout.polygonCorners(hex);
      window.p5.stroke(51);
      window.p5.strokeWeight(Math.min(p5.width / 100, p5.height / 100));
      window.p5.fill(hex.props.color);
      window.p5.beginShape();
      corners.forEach((corner) => {
        window.p5.vertex(corner.x, corner.y);
      });
      window.p5.endShape(window.p5.CLOSE);
    });

    window.p5.pop();
  }
}
