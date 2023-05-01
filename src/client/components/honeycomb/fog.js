export default class Fog {
  constructor() {
    this.xOffset = 0;
    this.yOffset = 0;
    this.speed = 0.02;
  }

  draw() {
    for (var x = 0; x < window.p5.width; x += 5) {
      for (var y = 0; y < window.p5.height; y += 5) {
        var c = 155 * window.p5.noise(0.003 * x + this.xOffset, 0.003 * y + this.yOffset);
        window.p5.noStroke();
        window.p5.fill(c, 150);
        window.p5.rect(x, y, 5, 5);
      }
    }

    this.xOffset += (this.speed * (window.p5.mouseX - window.p5.width / 2)) / window.p5.width;
    this.yOffset += (this.speed * (window.p5.mouseY - window.p5.height / 2)) / window.p5.height;
  }
}
