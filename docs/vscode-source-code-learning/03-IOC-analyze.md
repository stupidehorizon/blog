# vscode 中的 IOC 实现

IOC 即依赖倒置，通过将服务作为依赖注入到需要的地方。实现了代码的解耦。下面我们就来分析一下 vscode 中的 IOC 是怎么实现的。

上一篇文章我们讲到了 `vs/code/electron-main/main` 作为 vscode 主进程的入口文件，IOC 的实现逻辑也从这里开始

### 创建 instantiationService

```js
[
  instantiationService,
  instanceEnvironment,
  environmentService,
] = this.createServices(args, bufferLogService);
```

#### createServices 干了什么

```js
	private createServices(args: ParsedArgs, bufferLogService: BufferLogService): [IInstantiationService, IProcessEnvironment, INativeEnvironmentService] {
    // 创建一个服务收集器，通过 Map 数据结构来映射 ServiceIdentifier 和 service 实例或者包含创建 service 类的 SyncDescriptor 装饰器实例
		const services = new ServiceCollection();

		const environmentService = new EnvironmentService(args, process.execPath);
    const instanceEnvironment = this.patchEnvironment(environmentService); // Patch `process.env` with the instance's environment

    // set 第一个参数接收的是一个函数，都是通过 createDecorator 来创建的
    // createDecorator 接收一个 serviceId 作为参数，然后从一个本地存储 _util.serviceIds 中找这个 serviceId 是否已经注册，注册就直接返回之前的函数
    // 否则就创建一个新函数，保存到_ util.serviceIds 并返回
    // 第二个参数接收一个服务实例或者 SyncDescriptor 实例，这个实例保存了需要创建的 service 的类
		services.set(IEnvironmentService, environmentService);
    // ....中间省略
    // 这里第二参数用 SyncDescriptor 装饰了一遍
		services.set(ILifecycleMainService, new SyncDescriptor(LifecycleMainService));
		// ... 后面省略

    // InstantiationService 用 _servics 来保存了 services 而且将自己本身也注册到了 _services 中
		return [new InstantiationService(services, true), instanceEnvironment, environmentService];
	}
```

简而言之 instantiationService._servics 中包含了我们后面会用到的服务。而且他们是通过一个 Map 对象来存储的，key 是一个通过 createDecorator 创建的函数，value 为我们需要的 servie 实例，或者包含创建 service 类的 SyncDescriptor 装饰器实例。

这里很多同学也许就会有疑问，为什么不直接将全部将 service 实例注册到 Map 对象中，反而有的是保存了一个装饰器实例呢？简单看了一下通过 SyncDescriptor 装饰的服务的共性都是他们使用了 ts 语法中的参数装饰器。例如，StateService 的 construcor 构造函数。

```js
	constructor(
		@IEnvironmentService environmentService: INativeEnvironmentService,
		@ILogService logService: ILogService
	) {
		this.fileStorage = new FileStorage(path.join(environmentService.userDataPath, StateService.STATE_FILE), error => logService.error(error));
	}
```

所以我们大概能猜到，通过 SyncDescriptor 装饰的类，会在后面某个时机进行实例化，并且自动注入需要的服务。我们继续往后看代码。

#### 初始化服务

```js
await instantiationService.invokeFunction(async accessor => {
				const configurationService = accessor.get(IConfigurationService);
				const stateService = accessor.get(IStateService);

				try {
					await this.initServices(environmentService, configurationService as ConfigurationService, stateService as StateService);
				} catch (error) {

					// Show a dialog for errors that can be resolved by the user
					this.handleStartupDataDirError(environmentService, error);

					throw error;
				}
			});
```

再进入到 invokeFunction

```js
	invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R {
		let _trace = Trace.traceInvocation(fn);
		let _done = false;
		try {
			const accessor: ServicesAccessor = {
				get: <T>(id: ServiceIdentifier<T>, isOptional?: typeof optional) => {

					if (_done) {
						throw illegalState('service accessor is only valid during the invocation of its target method');
					}
					const result = this._getOrCreateServiceInstance(id, _trace);
					if (!result && isOptional !== optional) {
						throw new Error(`[invokeFunction] unknown service '${id}'`);
					}
					return result;
				}
			};
			return fn(accessor, ...args);
		} finally {
			_done = true;
			_trace.stop();
		}
  }
```
这里用到了典型的访问器模式，由外面传入的函数来决定需要取哪些 servies. 这里我们取了 `configurationService` 和 `stateService`。_trace 这里我们先不管，看名字就知道它大概是做统计功能的。下面我们进入 `_getOrCreateServiceInstance`

```js
	private _getOrCreateServiceInstance<T>(id: ServiceIdentifier<T>, _trace: Trace): T {
    // 这里就是从刚开始我们说的内部变量 _util.serviceIds 中取出服务实例，或者包含服务类的 SyncDescriptor 实例
		let thing = this._getServiceInstanceOrDescriptor(id);
		if (thing instanceof SyncDescriptor) {
      // 假如是 SyncDescriptor 装饰的服务实例则进入这里
			return this._createAndCacheServiceInstance(id, thing, _trace.branch(id, true));
		} else {
      _trace.branch(id, false);
      // 否则直接返回服务实例
			return thing;
		}
	}
```

所以我们大概能猜出 `_createAndCacheServiceInstance` 依赖注入就是在这里进行的。那么他是怎么实现的呢，我们继续看 `_createAndCacheServiceInstance` 代码。

```js
	private _createAndCacheServiceInstance<T>(id: ServiceIdentifier<T>, desc: SyncDescriptor<T>, _trace: Trace): T {
		type Triple = { id: ServiceIdentifier<any>, desc: SyncDescriptor<any>, _trace: Trace };

		// 创建一个图的数据结构，接收一个函数作为参数保存到 _hashFn 中
		const graph = new Graph<Triple>(data => data.id.toString());

		let cycleCount = 0;
		// 创建一个栈，构建入口类的对象，压入栈底
		const stack = [{ id, desc, _trace }];
		while (stack.length) {
			const item = stack.pop()!;
			// 查找或者构建图的节点 Node: { data: item, incoming: Map<string, Node<T>>, outcomming: Map<string, Node<T>>}
			// incoming 和 outcomming 都是 Map 结构，保存了出节点的路径和入节点的路径
			// 
			graph.lookupOrInsertNode(item);

			// a weak but working heuristic for cycle checks
			if (cycleCount++ > 1000) {
				throw new CyclicDependencyError(graph);
			}

			// check all dependencies for existence and if they need to be created first
			// 这里有点难以理解，item.desc.ctor 指向我们创建服务的类
			// _util.getServiceDependencies 做的就是从类的 $di$dependencies 属性上取出需要的依赖，但是我们并没有在任何地方去存这个值
			// 这里就要提到上文我们说的 ts 的类参数装饰器，在编译为 js 时并加载代码时就会运行这个装饰器，
			// 然后将需要依赖的服务存到类的 $di$dependencies 属性上
			// 原理见下图
			for (let dependency of _util.getServiceDependencies(item.desc.ctor)) {

				// 找到依赖的服务实例或者装饰器实例
				let instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
				if (!instanceOrDesc && !dependency.optional) {
					console.warn(`[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`);
				}

				if (instanceOrDesc instanceof SyncDescriptor) {
					// 假设依赖的服务也是装饰器实例，就入栈
					const d = { id: dependency.id, desc: instanceOrDesc, _trace: item._trace.branch(dependency.id, true) };
					// 构建图的边，当前出度增加指向依赖的装饰器实例节点，装饰器实例节点入度增加指向当前节点
					graph.insertEdge(item, d);
					// 入栈，当栈里有元素时就一直处理，知道完整的依赖关系图构建完成
					stack.push(d);
				}
			}
		}

		while (true) {
			// 找到图里的根节点，即出度为 0 的节点
			const roots = graph.roots();

			// if there is no more roots but still
			// nodes in the graph we have a cycle
			if (roots.length === 0) {
				if (!graph.isEmpty()) {
					throw new CyclicDependencyError(graph);
				}
				break;
			}

			for (const { data } of roots) {
				// create instance and overwrite the service collections
				// 因为这个节点不依赖其他未创建的服务，所以可以直接实例化
				const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation, data._trace);
				// 将装饰器实例替换为真正的服务实例
				this._setServiceInstance(data.id, instance);
				// 从图里删掉这个节点，并更新所有节点的出度和入度，删掉 key 为这个节点的记录
				graph.removeNode(data);
			}
		}

		return <T>this._getServiceInstanceOrDescriptor(id);
	}
```

到处为止，所有的服务就已经实例化了。如果我们要创建一个服务，但是它不依赖任何的服务，我们就可以在一开始直接实例化这个服务，并注册到 serviceCollection 中。但是如果一旦你的服务依赖了其他服务，我们就应该采用 vscode IOC 这种使用方法，通过在 constructor 中注入依赖的服务，我们就不用再自己手动的去实例化这些服务，并作为参数传进来。IOC 框架会自动帮我们实例化并注入到我们需要的地方，而且我们也不用担心依赖的服务所依赖的服务的问题。这就是 IOC 框架的价值。

**附图[1]: Typescript 类参数装饰器**

[ts-decorator](../../images/ts_decorator.jpg)
