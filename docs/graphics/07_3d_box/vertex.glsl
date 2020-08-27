attribute vec3 a_vertexPosition;
attribute vec3 colors;
attribute vec3 normalVectors;

varying vec3 vColor;
varying float vCos;

uniform mat3 transition;

const mat3 reverseZ = mat3(1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,-1.0);
const vec3 lightPos = vec3(10.0, 10.0, 0.0);

void main() {
  mat3 modalMatrix = reverseZ * transition;
  vec3 pos = modalMatrix * a_vertexPosition;
  vColor = colors;
  vCos = max(dot(normalize(modalMatrix * normalVectors), normalize(lightPos - pos)), 0.0);
  gl_PointSize = 1.0;
  gl_Position = vec4(pos, 1);
}