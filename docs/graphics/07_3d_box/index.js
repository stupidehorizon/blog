import GlRenderer from "gl-renderer";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";
import { multiply } from '../common/lib/math/functions/Mat3Func';
import { subtract, cross, normalize } from '../common/lib/math/functions/Vec3Func';

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

let startAngleX = 0;
let startAngleY = 0;
let startAngleZ = 0;
const updateTransition = () => {
  let c = Math.cos(startAngleX += 0.003);
  let s = Math.sin(startAngleX);
  const rotateX = [
    1,0,0,
    0,c,s,
    0,-s,c
  ];
  c = Math.cos(startAngleY += 0.003);
  s = Math.sin(startAngleY);
  const rotateY = [
    c,0,s,
    0,1,0,                                  
    -s,0,c
  ];
  c = Math.cos(startAngleZ += 0.003);
  s = Math.sin(startAngleZ);
  const rotateZ = [
    c,-s,0,
    s,c,0,
    0,0,1
  ];
  const rotationsMatrix = [];
  multiply(rotationsMatrix, rotateX, rotateY);
  multiply(rotationsMatrix, rotationsMatrix, rotateZ);
  renderer.uniforms.transition = rotationsMatrix;
  requestAnimationFrame(updateTransition);
}
requestAnimationFrame(updateTransition);

// const surfaceColors =  [[0.1,0,0], [0,0.1,0], [0,0,0.1], [0.1,0.1,0], [0,0.1,0.1], [0.1,0,0.1]];
const surfaceColors =  [[0.1,0,0], [0.1,0,0], [0.1,0,0], [0.1,0,0], [0.1,0,0], [0.1,0,0]];
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
  const normalVectors = [];
  let positionsLen = positions.length;

  const createSurface = (a, b, c, d) => {
    const ab = [];
    const ac = [];
    const normal = [];
    subtract(ab, p[b], p[a]);
    subtract(ac, p[c], p[a]);
    cross(normal, ab, ac);
    normalize(normal, normal); 
    [a, b, c, d].forEach(i => {
      positions.push(p[i]);
      normalVectors.push(normal);
      colors.push(surfaceColors[(positionsLen/4)%6]);
    });
    [[0,1,2],[0,2,3]].forEach(([a, b, c]) => {
      cells.push([positionsLen + a, positionsLen + b, positionsLen + c]);
    })
    positionsLen+=4;
  };

  createSurface(0,1,2,3); // 后
  createSurface(5,4,3,2); // 右
  createSurface(4,5,6,7); // 前
  createSurface(7,6,1,0); // 左
  createSurface(5,2,1,6); // 上
  createSurface(0,3,4,7); // 下
  return {positions, colors, cells, normalVectors};
}

const boxData = createBox(1);

renderer.setMeshData([
  {
    positions: boxData.positions,
    attributes: {
      colors: boxData.colors,
      normalVectors: boxData.normalVectors,
    },
    cells: boxData.cells,
  },
]);

renderer.render();
