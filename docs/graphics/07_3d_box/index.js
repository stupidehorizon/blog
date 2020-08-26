import GlRenderer from "gl-renderer";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const canvas = document.querySelector("canvas");
const renderer = new GlRenderer(canvas, {
  depth: true,
});
const program = renderer.compileSync(fragment, vertex);
renderer.useProgram(program);

renderer.uniforms.transition = [
  1,0,0,
  0,1,0,
  0,0,1
]

let startAngle = 0;
const updateTransition = (angle) => {
  const c = Math.cos(startAngle += 0.001);
  const s = Math.sin(startAngle += 0.001);
  const rotateX = [
    1,0,0,
    0,c,s,
    0,-s,c
  ];
  renderer.uniforms.transition = rotateX;
  requestAnimationFrame(updateTransition);
}
requestAnimationFrame(updateTransition);

const colorsBox =  [[1,0,0], [0,1,0], [0,0,1], [1,1,0], [0,1,1], [1,0,1]];

const createBox = (size) => {
  const h = size/2;
  const p = [
    [-h, -h, -h],
    [-h, h, -h],
    [h, h, -h],
    [h, -h, -h],
    [h, -h, h],
    [h, h, h],
    [-h, h, h],
    [-h, -h, h],
  ];
  const positions = [];
  const cells = [];
  const colors = [];
  let cellsLen = 0;

  const createFragement = (a, b, c, d) => {
    positions.push(p[a], p[b], p[c], p[d]);
    cells.push([cellsLen + 0, cellsLen + 1, cellsLen + 2], [cellsLen + 0, cellsLen + 2, cellsLen + 3]);
    const color = colorsBox[(cellsLen/4)%6];
    colors.push(color, color, color, color);
    cellsLen+=4;
  }
  createFragement(0,1,2,3); 
  createFragement(3,4,5,2);
  createFragement(4,5,6,7);
  createFragement(6,7,0,1);
  createFragement(1,2,5,6);
  createFragement(0,3,4,7);
  return {positions, colors, cells};
}

const boxData = createBox(1);

renderer.setMeshData([
  {
    positions: boxData.positions,
    attributes: {
      colors: boxData.colors,
    },
    cells: boxData.cells,
  },
]);

renderer.render();
