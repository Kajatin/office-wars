import React, { useRef, useEffect } from 'react';

import p5 from 'p5';

import Fog from './honeycomb/fog';
import Game from './honeycomb/game';
import {pointy} from './honeycomb/layout';

function ArenaP5(props) {
  const {game, tank, fov} = props;

  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = new p5((p5) => {
      let game;
      let fog = new Fog();

      window.p5 = p5;

      p5.setup = () => {
        const canvas = p5.createCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        canvas.parent(canvasRef.current);
        p5.colorMode(p5.RGB);

        game = new Game(fov, tank, pointy, p5.createVector(30, 30), p5.createVector(0, 0));
      };

      p5.draw = () => {
        p5.background(250, 250, 249);
        fog.draw();
        game.draw();

        if (p5.mouseIsPressed) {
          game.selectHex(p5.mouseX, p5.mouseY);
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
