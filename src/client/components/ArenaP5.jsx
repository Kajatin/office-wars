import React, { useRef, useEffect } from 'react';

import p5 from 'p5';

import Game from './honeycomb/game';
import {pointy} from './honeycomb/layout';

function ArenaP5(props) {
  const {game, tank, fov, setSelectedHex} = props;
  // console.log("game", game);
  // console.log("tank", tank);
  // console.log("fov", JSON.parse(fov));

  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = new p5((p5) => {
      let game;

      window.p5 = p5;

      p5.setup = () => {
        const canvas = p5.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        canvas.parent(canvasRef.current);
        p5.colorMode(p5.RGB);

        const hexSize = Math.min(p5.width / 15, p5.height / 15);
        game = new Game(fov, tank, pointy, p5.createVector(hexSize, hexSize), p5.createVector(0, 0));
      };

      p5.draw = () => {
        p5.background(250, 250, 249);
        for (let i = 0; i < 30; i++) {
          p5.push();
          p5.stroke(p5.random(255), p5.random(255), p5.random(255), 20);
          p5.strokeWeight(3);
          p5.line(p5.random(p5.width), p5.random(p5.height), p5.random(p5.width), p5.random(p5.height));
          p5.pop();
        }

        game.draw();

        // pan the map with the arrow keys
        if (p5.keyIsDown(p5.RIGHT_ARROW)) {
          game.moveMap(15, 0);
        }
        if (p5.keyIsDown(p5.LEFT_ARROW)) {
          game.moveMap(-15, 0);
        }
        if (p5.keyIsDown(p5.DOWN_ARROW)) {
          game.moveMap(0, 15);
        }
        if (p5.keyIsDown(p5.UP_ARROW)) {
          game.moveMap(0, -15);
        }

        // zoom in and out with with the [ ] keys
        if (p5.keyIsDown(221)) {
          game.scaleMap(0.01);
        }
        if (p5.keyIsDown(219)) {
          game.scaleMap(-0.01);
        }

        if (p5.mouseIsPressed && p5.mouseButton === p5.LEFT) {
          if (p5.mouseX < 0 || p5.mouseX > p5.width || p5.mouseY < 0 || p5.mouseY > p5.height) {
            return;
          }
          const ret = game.selectHex(p5.mouseX, p5.mouseY);
          setSelectedHex(ret);
          // game.movePos(p5.mouseX, p5.mouseY);
        }
      };
    });

    // Remove the sketch when the component unmounts
    return () => {
      sketch.remove();
    };
  }, [canvasRef, fov]);

  return <div ref={canvasRef} style={{ height: 'calc(100vh - 4.2rem)', width: 'calc(100vw - 1.5rem)' }} />;
}

export default ArenaP5;
