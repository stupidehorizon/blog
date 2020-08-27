const glob = require('glob');
const { spawn } = require('child_process');

const entries = [];

glob("**/*.html", { ignore: ['**/dist/**', 'node_modules/**', ]}, function (er, files) {
  console.log(process.cwd())
  const build = spawn('parcel', ['build', `01_hello_weggl/index.html 02_vector_tree/index.html 03_vector_operation/index.html 04_particles_animation/index.html 05_color_convert/index.html 06_search_light/index.html 07_3d_box/index.html`], {
    cwd: process.cwd()
  });

  build.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  build.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  build.on('close', (code) => {
    console.log(`子进程退出，退出码 ${code}`);
});
})