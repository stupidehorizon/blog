#ifdef GL_ES
precision highp float;
#endif

varying vec3 vColor;

void main() {
  gl_FragColor.rgb = vColor;
  gl_FragColor.a = 1.0;
} 