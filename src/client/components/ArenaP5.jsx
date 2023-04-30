import React, { useRef, useEffect } from 'react';

import p5 from 'p5';

import Game from './honeycomb/game';
import {pointy} from './honeycomb/layout';

function ArenaP5(props) {
  const {game, tank, fov} = props;

  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = new p5((p5) => {
      let gameOld;

      window.p5 = p5;

      p5.setup = () => {
        const canvas = p5.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        canvas.parent(canvasRef.current);

        // Set the color mode to RGB
        p5.colorMode(p5.RGB);
        p5.background(250);

        gameOld = new Game(fov, tank, pointy, p5.createVector(20, 20), p5.createVector(p5.width / 2, 0));
      };

      p5.draw = () => {
        gameOld.draw();

        if (p5.mouseIsPressed) {
          gameOld.selectHex(p5.mouseX, p5.mouseY);
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
