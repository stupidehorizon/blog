attribute vec2 a_vertexPosition;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  gl_PointSize = 1.0;
  vUv = uv;
  gl_Position = vec4(a_vertexPosition, 1, 1);
}