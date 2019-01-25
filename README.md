### before 
![before](https://qiqingfu.github.io/webpack-DllPlugin/image/before.png)

### after 
![before](https://qiqingfu.github.io/webpack-DllPlugin/image/after.png)

## webpack-DllPlugin
项目中使用的生产依赖库, 能不能提前构建好呢? 运行的时候直接通过`script`标签引入。 

`DLLPlugin` 和 `DLLReferencePlugin` 用某种方法实现了拆分 bundles，同时还大大提升了构建的速度。  


首先, 创建一个 `webpack.config.react.js` 配置文件, 主要将 react、react-dom这些库提前打包出来。并生成一个 `.json`动态链接库文件。 

这个.json文件用在 webpack总配置文件中引用的。  

webpack.config.react.js 
```javascript
const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const packages = require('./package.json')

const dependencies = Object.keys(packages.dependencies) || []

module.exports = {
  mode: 'production',
  entry: {
    react: dependencies,
  },
  output: {
    filename: '_dll_[name]_[hash:8].js',
    path: path.resolve(__dirname, 'dist'),
    library: '_dll_[name]_[hash:8]',
    libraryTarget: 'var'
  },
  plugins: [
    // 让 DLLReferencePlugin 映射到相关的依赖上去的
    new webpack.DllPlugin({
      name: '_dll_[name]_[hash:8]',
      path: path.resolve(__dirname, 'dist', 'manifest.json')
    }),
    // [hash].js 映射表
    new AssetsPlugin({
      filename: 'webpack-assets.json',
      path: path.resolve(__dirname, 'dist')
    })
  ]
}
``` 

entry就是哪些库需要提前构建。也可以构建多个。    
output就是输出的路径和输出的文件名  

DllPlugin里的path会输出一个 `manifest json`文件。 
DllPlugin中的name是暴露出的 DLL 的函数名, 也就是output.library同名。可以暴露出 (也叫做放入全局域) dll 函数。 

执行: `webpack --config webpack-config.react.js`  
会在根目录的 dist目录下生成一个 `manifest.json`文件和一个_dll_[react]_(8位hash值).js的文件。  

各自打开看一下，就会看到依赖库的源码和匹配id。  

AssetsPlugin插件: 生成一个 `webpack-assets.json`文件, 对应的是output生成的[hash]的js文件名。需要在模版文件中使用。  


webpack.config.js 主配置文件: 
```javascript
	const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const WebpackAssetsPath = require('./dist/webpack-assets.json')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash:8].js'
  },
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    progress: true
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      vendorJsName: WebpackAssetsPath.react.js,
      title: 'Webpack Dll'
    }),
    // webpack 主配置文件中设置
    // 把只有 dll 的 bundle(们)(dll-only-bundle(s)) 引用到需要的预编译的依赖。
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dist', 'manifest.json')
    })
  ]
}
``` 

`manifest`: 包含 content 和 name 的对象，或者在编译时(compilation)的一个用于加载的 JSON manifest 绝对路径。 

最后在模版文件src/index.html文件中引入通过 DllPlugin输出的.js文件。 

```html
<script src="<%= htmlWebpackPlugin.options.vendorJsName %>"></script>
```  

## end



