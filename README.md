# Language-Tools

### 代码组织结构

```
Language-Tools
├── .vscode -Vscode插件调试配置，删除后无法调试
├── extension.js -插件入口
├── image -插件使用配图
|  ├── config.gif
|  ├── install.gif
|  └── use.gif
├── package-lock.json 
├── package.json -插件核心配置，包括依赖、入口等
├── README.md
└── webpack.config.js -webpack文件
```

### 插件作用

- 检测标签是否存在
- 右键替换标签
- 获取标签执行SQl

### 使用指南

##### 安装插件

![](https://github.com/jiansong0720/Language-Tools/blob/master/image/install.gif?raw=true)

##### 配置插件

![](https://github.com/jiansong0720/Language-Tools/blob/master/image/config.gif?raw=true)

##### 使用插件

![](https://github.com/jiansong0720/Language-Tools/blob/master/image/use.gif?raw=true)

### 注意事项

插件文件引入了第三方包，开发时package.json文件的插件入口需要配置成./extension.js，方便我们调试。

```json
"main": "./extension.js",
```

但当进行vsce打包时，首先需要先npm run webpack，将文件输出到dist文件夹下，然后更改package.json的插件入口为./dist/extension.js后，运行打包命令vsce package。

```json
"main": "./dist/extension.js",
```

