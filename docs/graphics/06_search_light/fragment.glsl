#ifdef GL_ES
precision highp float;
#endif
varying vec2 vUv;
uniform sampler2D tMap;
uniform float uTime;
uniform vec2 uMouse;

vec3 random3(vec2 st){
  vec3 st3 = vec3( dot(st,vec2(527.1,311.7)),
            dot(st,vec2(569.5,183.3)),
            dot(st,vec2(769.5,183.3)) );
  return -1.0 + 2.0 * fract(sin(st3) * 637580.5453123);
}

void main() {

  vec2 st = vUv;

  // black cover
  vec2 vector = st - uMouse;
  float d = length(vector);
  vec3 coverColor =  vec3(smoothstep(.2, .3, d));

  // for colorful grid
  st = st * 10.;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);
  vec3 color = vec3(.0);

  if(f_st.x >= 0.1 && f_st.x <= 0.9 && f_st.y >= 0.1 && f_st.y <= 0.9) {
    color = vec3(random3(i_st));
  }

  
  gl_FragColor.rgb = color - coverColor;
  gl_FragColor.a = 1.0;
} 