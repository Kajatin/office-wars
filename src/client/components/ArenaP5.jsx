import React, { useRef, useEffect } from 'react';

import p5 from 'p5';

import Game from './honeycomb/game';
import Brush from './honeycomb/brush';
import {pointy} from './honeycomb/layout';

function ArenaP5(props) {
  const {game, tank, fov} = props;

  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = new p5((p5) => {
      let gameOld;
      let brush = [];

      window.p5 = p5;

      p5.setup = () => {
        const canvas = p5.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        canvas.parent(canvasRef.current);
        p5.background(145, 140, 134);

        // Set the color mode to RGB
        p5.colorMode(p5.RGB);

        gameOld = new Game(fov, tank, pointy, p5.createVector(30, 30), p5.createVector(0, 0));

        for (var i = 0; i < 50; i++) {
          brush[i] = new Brush();
        }
      };

      p5.draw = () => {
        for (var i = 0; i < brush.length; i++) {
          brush[i].paint();
          brush[i].update();
        }

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
