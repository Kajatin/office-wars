import Hex from "./hex";

class Orientation {
  constructor(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
    this.f0 = f0;
    this.f1 = f1;
    this.f2 = f2;
    this.f3 = f3;
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
    this.b3 = b3;
    this.start_angle = start_angle;
  }
}

export const pointy = new Orientation(
  Math.sqrt(3.0),
  Math.sqrt(3.0) / 2.0,
  0.0,
  3.0 / 2.0,
  Math.sqrt(3.0) / 3.0,
  -1.0 / 3.0,
  0.0,
  2.0 / 3.0,
  0.5
);
export const flat = new Orientation(
  3.0 / 2.0,
  0.0,
  Math.sqrt(3.0) / 2.0,
  Math.sqrt(3.0),
  2.0 / 3.0,
  0.0,
  -1.0 / 3.0,
  Math.sqrt(3.0) / 3.0,
  0.0
);

export default class Layout {
  constructor(orientation, size, origin) {
    this.orientation = orientation;
    this.size = size;
    this.origin = origin;
  }

  hex_to_pixel(hex) {
    let M = this.orientation;
    let size = this.size;
    let origin = this.origin;
    let x = (M.f0 * hex.q + M.f1 * hex.r) * size.x;
    let y = (M.f2 * hex.q + M.f3 * hex.r) * size.y;
    return window.p5.createVector(x + origin.x, y + origin.y);
  }

  pixel_to_hex(point) {
    let M = this.orientation;
    let size = this.size;
    let origin = this.origin;
    let pt = window.p5.createVector(
      (point.x - origin.x) / size.x,
      (point.y - origin.y) / size.y
    );
    let q = M.b0 * pt.x + M.b1 * pt.y;
    let r = M.b2 * pt.x + M.b3 * pt.y;
    return new Hex(q, r, -q - r);
  }

  hex_corner_offset(corner) {
    let M = this.orientation;
    let size = this.size;
    let angle = (2.0 * Math.PI * (M.start_angle + corner)) / 6;
    return window.p5.createVector(
      size.x * Math.cos(angle),
      size.y * Math.sin(angle)
    );
  }

  polygon_corners(hex) {
    let corners = [];
    let center = this.hex_to_pixel(hex);
    for (let i = 0; i < 6; i++) {
      let offset = this.hex_corner_offset(i);
      corners.push(
        window.p5.createVector(center.x + offset.x, center.y + offset.y)
      );
    }
    return corners;
  }
}
