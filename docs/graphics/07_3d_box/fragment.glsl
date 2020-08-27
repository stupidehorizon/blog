#ifdef GL_ES
precision highp float;
#endif

varying vec3 vColor;
varying float vCos;

const vec4 lightColor = vec4(0.9, 1.0, 1.0, 1.0);

void main() {
  gl_FragColor.rgb = vColor + vCos * lightColor.a * lightColor.rgb;
  // gl_FragColor.rgb = vColor;
  gl_FragColor.a = lightColor.a;
} 