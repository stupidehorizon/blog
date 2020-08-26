attribute vec3 a_vertexPosition;
attribute vec3 colors;
varying vec3 vColor;
void main() {
  gl_PointSize = 1.0;
  vColor = colors;
  gl_Position = vec4(a_vertexPosition, 1);
}