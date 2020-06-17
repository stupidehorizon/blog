# vscode 源码解读一【项目 clone 与本地启动】

## clone 代码

`git clone --depth=1 git@github.com:microsoft/vscode.git`
记得加 `--depth=1` 因为代码量实在是太大了。

## 安装依赖

`yarn` 

这一步会先执行定义在 `package.json` 里的 `preinstall` 检查你的 node 版本和 yarn 版本。然后安装 package.json 中的依赖，这一步耗时可能比较久，最好有外网环境，要不然一直都安装不成功。最后会跑 `postintall` 去安装 `extensions`, `build` 
等其他目录下的依赖。

## yarn watch
 
yarn watch 主要做两件事，一是监控 src 目录下的 ts 文件是否更改并将 ts 编译为 js 输出到 out 目录，二是编译 extensions 下面的插件。

## 启动项目

执行 `./scritps/code.sh`。这个脚本会执行 `yarn electron` 去 github 下载 electron。在大陆可能网速非常慢，建议连上外网。下载成功后会执行 electron . 来启动项目。 electron 会找到 package,json 中定义的 main 入口 `./out/main` 开始执行。


所以整个项目的入口文件就是 `/out/main` 文件，而这个文件又是 `src/main.js` 编译而来，所以我们就找到了整个项目的入口。