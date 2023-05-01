export default class Brush {
  constructor() {
    this.x = window.p5.random(window.p5.width);
    this.y = window.p5.random(window.p5.height);
    this.angle = window.p5.random(window.p5.TWO_PI);

    const c = window.p5.random(255);

    this.clr = window.p5.color(c, c, c, 5);
  }

  paint() {
    var px = this.x;
    var py = this.y;
    var r = 50;
    var u = window.p5.random(0.425, 1);

    window.p5.fill(this.clr);
    window.p5.noStroke();
    window.p5.beginShape();
    for (var a = 0; a < window.p5.TWO_PI; a += window.p5.PI / 180) {
      window.p5.vertex(px, py);
      px = this.x + r * window.p5.cos(this.angle + a) * u;
      py = this.y + r * window.p5.sin(this.angle + a) * u;
      r += window.p5.sin(a * window.p5.random(0.25, 2));
    }
    window.p5.endShape();
  }

  // Increment angle variable by PI/2 when x or y hits boundaries
  change() {
    if (
      this.x < 0 ||
      this.x > window.p5.width ||
      this.y < 0 ||
      this.y > window.p5.height
    ) {
      this.angle += window.p5.HALF_PI;
    }
  }

  update() {
    this.x += 2 * window.p5.cos(this.angle);
    this.y += 2 * window.p5.sin(this.angle);
    this.angle += window.p5.random(-0.15, 0.15);
  }
}
