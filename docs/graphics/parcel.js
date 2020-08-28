const glob = require('glob');
const { spawn } = require('child_process');

const entries = [];

glob("**/*.html", { ignore: ['**/dist/**', 'node_modules/**', ]}, function (er, files) {
  const build = spawn('parcel', ['build', ...files, '--public-url', '../'], {
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