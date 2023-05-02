import Hex from "./hex";

export default class Map {
  constructor(fov, tank, layout) {
    this.map = [];
    this.layout = layout;

    this.pos = fov?.position || { q: 0, r: 0 };
    this.center = this.layout.hexToPixel(this.pos);
    this.zoom = 1;

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

    const currentHex = this.getHex(this.pos.q, this.pos.r);
    this.findVisibleHexesWithinDistance(currentHex, 4).forEach((hex) => {
      hex.props.setVisible(true);
    });
  }

  findVisibleHexesWithinDistance(currentHex, distance) {
    let visibleHexes = [];
    let fov = this.getHexesWithinDistance(currentHex, distance);
    fov.forEach((hex) => {
      // use the linedraw algorithm to get all hexes between the current hex and the target hex
      let line = currentHex.linedraw(hex);
      line.forEach((seg) => {
        if (seg.q === currentHex.q && seg.r === currentHex.r) {
          visibleHexes.push(currentHex);
        }
        let hex = this.getHex(seg.q, seg.r);
        const lineOfSight = this.checkLineOfSight(currentHex, hex);
        if (lineOfSight) visibleHexes.push(hex);
      });
    });
    return visibleHexes;
  }

  selectHex(x, y) {
    // Remove the zoom and the center effect
    x = (x - window.p5.width / 2) / this.zoom + this.center.x;
    y = (y - window.p5.height / 2) / this.zoom + this.center.y;

    let hex = this.getHexFromPixelCoords(x, y);
    if (!hex) return;

    const currentHex = this.getHex(this.pos.q, this.pos.r);

    // let neighbors = this.getNeighbors(hex);
    // neighbors.forEach((neighbor) => neighbor.props.setColor(125));

    // let fov = this.getHexesWithinDistance(hex, 3);
    // fov.forEach((neighbor) => neighbor.props.setColor(125));

    let line = hex.linedraw(currentHex);
    line.forEach((seg) => {
      if (seg.q === currentHex.q && seg.r === currentHex.r) return;
      let hex = this.getHex(seg.q, seg.r);
      const lineOfSight = this.checkLineOfSight(currentHex, hex);
      hex.props.setColor(
        lineOfSight
          ? window.p5.color(209, 38, 73)
          : window.p5.color(128, 11, 35)
      );
    });
  }

  movePos(x, y) {
    // Remove the zoom and the center effect
    x = (x - window.p5.width / 2) / this.zoom + this.center.x;
    y = (y - window.p5.height / 2) / this.zoom + this.center.y;

    let hex = this.getHexFromPixelCoords(x, y);
    if (!hex) return;

    const currentHex = this.getHex(this.pos.q, this.pos.r);

    let line = currentHex.linedraw(hex);
    let visible = true;
    line.forEach((seg) => {
      if (seg.q === currentHex.q && seg.r === currentHex.r) return;
      let hh = this.getHex(seg.q, seg.r);
      const lineOfSight = this.checkLineOfSight(currentHex, hh);
      if (!lineOfSight) {
        visible = false;
        return;
      }
    });

    if (visible) {
      this.pos = hex.params();
      this.center = this.layout.hexToPixel(this.pos);

      console.log(this.pos, this.center);

      this.findVisibleHexesWithinDistance(hex, 4).forEach((h) => {
        h.props.setVisible(true);
      });
    }
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

  // check if hexes on a line are blocked
  checkLineOfSight(hex1, hex2) {
    let line = hex1.linedraw(hex2);
    let blocked = false;
    line.forEach((seg) => {
      let hex = this.getHex(seg.q, seg.r);
      if (hex.props.isBlocking()) blocked = true;
    });
    return !blocked;
  }

  move(x, y) {
    this.center.x += x;
    this.center.y += y;
  }

  scale(zoom) {
    this.zoom += zoom;
  }

  draw() {
    // Main Map
    window.p5.push();
    window.p5.translate(window.p5.width / 2, window.p5.height / 2);
    window.p5.scale(this.zoom);
    window.p5.translate(-this.center.x, -this.center.y);
    this.drawMap(window.p5);
    window.p5.pop();

    // Minimap
    const minimapMargin = 15; // Margin from the top-right corner of the canvas
    const minimapSize = Math.min(p5.width / 3, p5.height / 3); // Size of the square minimap

    const minimapGraphics = window.p5.createGraphics(minimapSize, minimapSize);

    minimapGraphics.push();
    minimapGraphics.translate(minimapSize / 2, minimapSize / 2);
    minimapGraphics.scale(this.zoom * 0.2);
    minimapGraphics.translate(-this.center.x, -this.center.y);
    this.drawMap(minimapGraphics);
    minimapGraphics.pop();

    // Draw Minimap Border
    const minimapPosX = window.p5.width - minimapSize - minimapMargin;
    const minimapPosY = minimapMargin;
    const borderThickness = 5;
    const borderRadius = 10;

    window.p5.push();
    window.p5.stroke(51, 140);
    window.p5.strokeWeight(borderThickness);
    window.p5.fill(250, 250, 249);
    window.p5.rect(
      minimapPosX - borderThickness,
      minimapPosY - borderThickness,
      minimapSize + 2 * borderThickness,
      minimapSize + 2 * borderThickness,
      borderRadius
    );
    window.p5.pop();

    window.p5.image(minimapGraphics, minimapPosX, minimapPosY);
  }

  drawMap(graphics) {
    this.map.forEach((hex) => {
      let corners = this.layout.polygonCorners(hex);
      graphics.stroke(51);
      graphics.strokeWeight(
        Math.min(graphics.width / 100, graphics.height / 100)
      );
      graphics.fill(hex.props.visible ? hex.props.color : 225);
      graphics.beginShape();
      corners.forEach((corner) => {
        graphics.vertex(corner.x, corner.y);
      });
      graphics.endShape(graphics.CLOSE);
    });
  }
}
