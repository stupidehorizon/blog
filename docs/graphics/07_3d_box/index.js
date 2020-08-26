import GlRenderer from "gl-renderer";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const canvas = document.querySelector("canvas");
const renderer = new GlRenderer(canvas, {
  depth: true,
});
const program = renderer.compileSync(fragment, vertex);
renderer.useProgram(program);

renderer.setMeshData([
  {
    positions: [
      [-0.5, -0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5],
      [-0.5, -0.5, 0.5],
    ],
    attributes: {
      colors: [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
      ]
    },
    cells: [
      [0, 1, 2], // 后
      [2, 0, 3],
      [3, 2, 5], // 右
      [5, 4, 3],
      [5, 4, 7], // 前
      [7, 5, 6],
      [6, 1, 0], // 左
      [0, 6, 7],
      [1, 5, 6], // 上
      [1, 2, 5],
      [7, 4, 0], // 下
      [0, 4, 3],
    ],
  },
]);

renderer.render();
