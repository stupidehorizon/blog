import GlRenderer from "gl-renderer";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const canvas = document.querySelector("canvas");
const renderer = new GlRenderer(canvas);
const program = renderer.compileSync(fragment, vertex);
renderer.useProgram(program);

// for mouse move event
renderer.uniforms.uMouse = [-1, -1];
canvas.addEventListener("mousemove", (e) => {
  const { x, y, width, height } = e.target.getBoundingClientRect();
  renderer.uniforms.uMouse = [(e.x - x) / width, 1.0 - (e.y - y) / height];
});

renderer.setMeshData([
  {
    positions: [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ],
    attributes: {
      uv: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
    },
    cells: [
      [0, 1, 2],
      [2, 0, 3],
    ],
  },
]);

renderer.render();
