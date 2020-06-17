# vscode 源码解读二【代码组织】

上一篇文章我们找到了 vscode 项目的入口文件 `main.js` 这篇文章我们从 `main.js` 入手来分析 vscode 的代码组织。

## main.js 都做了什么

`main.js` 作为整个项目的入口文件，主要做了以下几件事情。

1. 性能监控打点
2. 初始化项目的语言设置 
3. enableASARSupport（注入一个 `.asar` 的 node_modules 的查询路径）
4. 对事件的监听, 比如打开一个文件
5. app.ready 后加载 vscode 主要代码

还有其他许多功能，就不一一罗列了，感兴趣的同学可以自己去看。我们主要关注到第 5 点，因为其他几点更类似于是一些项目启动的辅助工作，而第 5 点则是正在开始加载 vscode 的主要功能。

```js
	require('./bootstrap-amd').load('vs/code/electron-main/main', () => {
		perf.mark('didLoadMainBundle');
	});
```

`require('./bootstrap-amd')` 启用 amd 包引入方式，因为 vscode 的 ts 代码都编译为了 amd 格式。



