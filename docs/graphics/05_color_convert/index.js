import earcut from 'earcut';
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// 创建 webgl 程序
// 顶点着色器
const vertex = `
  #define PI 3.1415926535897932384626433832795
  attribute vec2 position;
  varying vec3 color;

  vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  void main() {
    gl_PointSize = 1.0;
    float hue = atan(position.y, position.x);
    if (0.0 > hue) {
      hue = PI * 2.0 + hue;
    }
    hue /= PI * 2.0;
    vec3 hsv = vec3(hue, 1, 1);
    color = hsv2rgb(hsv);
    gl_Position = vec4(position, 1.0, 1.0);
  }
`;

// 片元着色器
const fragment = `
  precision mediump float;
  varying vec3 color;
  void main()
  {
    gl_FragColor = vec4(color, 1.0);
  }    
`;

// 创建顶点着色器 shader 对象
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

// 创建片元着色器 shader 对象
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

// 创建 webglProgram 对象
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// const points = new Float32Array([
//   0, 0,
//   1, -1,
//   1, 1,
//   -1, 1,
//   -1,-1,
//   1,-1,
// ]);

// 多边形顶点坐标函数
function createCircleVertex(x, y, r, n) {
  const sin = Math.sin;
  const cos = Math.cos;
  const perAngel = (2 * Math.PI) / n;
  const positionArray = [];
  for (let i = 0; i < n; i++) {
      const angel = i * perAngel;
      const nx = x + r * cos(angel);
      const ny = y + r * sin(angel);
      positionArray.push(nx, ny);
  }
  return positionArray;
}

const points = createCircleVertex(0, 0, 1, 500);
const cell = earcut(points);

const position = new Float32Array(points);
const cells = new Uint16Array(cell);

const pointsBufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBufferId);
gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

const cellsBufferId = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cellsBufferId);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cells, gl.STATIC_DRAW);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, cell.length, gl.UNSIGNED_SHORT, 0);