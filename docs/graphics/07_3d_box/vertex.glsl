attribute vec3 a_vertexPosition;
attribute vec3 colors;
varying vec3 vColor;
uniform mat3 transition;

mat3 reverseZ = mat3(1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,-1.0);

void main() {
  gl_PointSize = 1.0;
  vColor = colors;
  gl_Position = vec4(reverseZ * transition * vec3(a_vertexPosition), 1);
}