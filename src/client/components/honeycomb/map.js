import Hex from "./hex";

export default class Map {
  constructor(fov, tank, layout) {
    console.log("CLASS MAP");
    this.map = [];
    this.layout = layout;

    const playerStateObj = JSON.parse(fov);
    console.log("playerStateObj=", playerStateObj);
    this.pos = playerStateObj?.pos || { q: 0, r: 0 };
    console.log("this.pos=", this.pos);
    this.center = this.layout.hexToPixel(this.pos);
    this.zoom = 1;

    //const rows = fov?.height || 1;
    //const cols = fov?.width || 1;
    const rows = 40;
    const cols = 40;
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        let { q, r, s } = Hex.offsetToAxial(row, col);
        let props = playerStateObj?.fov?.find((tile) => tile.q === q && tile.r === r);
        const hex = new Hex(q, r, s, props);
        if (props) {
          console.log("props=", props);
          hex.props.setVisible(true);
        }

        this.map.push(hex);

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

    //const currentHex = this.getHex(this.pos.q, this.pos.r);
    //this.findVisibleHexesWithinDistance(currentHex, 4).forEach((hex) => {
    //  hex.props.setVisible(true);
    //});
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
    if (!hex) return null;

    const currentHex = this.getHex(this.pos.q, this.pos.r);

    // let line = hex.linedraw(currentHex);
    // line.forEach((seg) => {
    //   if (seg.q === currentHex.q && seg.r === currentHex.r) return;
    //   let hex = this.getHex(seg.q, seg.r);
    //   const lineOfSight = this.checkLineOfSight(currentHex, hex);
    //   hex.props.setColor(
    //     lineOfSight
    //       ? window.p5.color(209, 38, 73)
    //       : window.p5.color(128, 11, 35)
    //   );
    // });

    // use A* to find the shortest path between the current hex and the target hex
    let path = this.pathfind(currentHex, hex);
    path.forEach((tile) => {
      // tile.props.setColor(window.p5.color(209, 38, 73));
    });

    // unselect all hexes
    this.map.forEach((hex) => {
      hex.setSelected(false);
    });

    if (hex.props.visible) {
      hex.setSelected(true);
      return {
        q: hex.q,
        r: hex.r,
        s: hex.s,
        props: hex.props,
      };
    }

    return null;
  }

  pathfind(a, b) {
    // https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
    // impelement A* algorithm
    let open = [];
    let closed = [];
    let path = [];

    open.push(a);

    while (open.length > 0) {
      let winner = 0;
      for (let i = 0; i < open.length; i++) {
        if (open[i].f < open[winner].f) {
          winner = i;
        }
      }
      let current = open[winner];

      if (current.q === b.q && current.r === b.r) {
        let temp = current;
        path.push(temp);
        while (temp.previous) {
          path.push(temp.previous);
          temp = temp.previous;
        }
        break;
      }

      open = open.filter((hex) => hex.q !== current.q || hex.r !== current.r);
      closed.push(current);

      let neighbors = this.getNeighbors(current);
      neighbors.forEach((neighbor) => {
        if (neighbor.props.isBlocking()) return;
        if (closed.find((hex) => hex.q === neighbor.q && hex.r === neighbor.r))
          return;

        let gScore = current.g + 1;
        let gScoreIsBest = false;

        if (!open.find((hex) => hex.q === neighbor.q && hex.r === neighbor.r)) {
          gScoreIsBest = true;
          neighbor.h = this.heuristic(neighbor, b);
          open.push(neighbor);
        } else if (gScore < neighbor.g) {
          gScoreIsBest = true;
        }

        if (gScoreIsBest) {
          neighbor.previous = current;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
        }
      });
    }

    return path;
  }

  heuristic(a, b) {
    // use cube distance
    return (
      (Math.abs(a.q - b.q) +
        Math.abs(a.q + a.r - b.q - b.r) +
        Math.abs(a.r - b.r)) /
      2
    );
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
    const drawHex = (corners, fillColor, graphics) => {
      graphics.stroke(51);
      graphics.strokeWeight(
        Math.min(graphics.width / 130, graphics.height / 130)
      );
      graphics.fill(fillColor);
      graphics.beginShape();
      corners.forEach((corner) => {
        graphics.vertex(corner.x, corner.y);
      });
      graphics.endShape(graphics.CLOSE);
    };

    let selectedHexCorners;
    let selectedHexFillColor;

    this.map.forEach((hex) => {
      let corners = this.layout.polygonCorners(hex);
      const fillColor = hex.props.visible ? hex.props.color : p5.color(225);
      fillColor.setAlpha(hex.props.visible ? (hex.selected ? 255 : 235) : 155);

      if (hex.selected) {
        const center = this.layout.hexToPixel(hex);
        const scaleFactor = 1.2;
        selectedHexCorners = corners.map((corner) => {
          const displacedCorner = corner.sub(center);
          const scaledCorner = displacedCorner.mult(scaleFactor);
          return scaledCorner.add(center);
        });
        selectedHexFillColor = fillColor;
      } else {
        drawHex(corners, fillColor, graphics);
      }
    });

    if (selectedHexCorners) {
      drawHex(selectedHexCorners, selectedHexFillColor, graphics);
    }
  }
}
