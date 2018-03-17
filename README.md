# npm-chart

Use react , antd , echarts to build npm package download trend

# 配置 antd 按需加载

* 安装`babel-plugin-import`

```bash
$ npm install babel-plugin-import --save-dev
```

* 配置文件路径`node_modules/react-scripts/config/webpack.config.dev.js`,`node_modules/react-scripts/config/webpack.config.prod`
* 配置`babel-loader`

```js
plugins:[
    ["import",
        {
            "libraryName": "antd",
            "style": 'css'
        }
    ]
        ],
```
