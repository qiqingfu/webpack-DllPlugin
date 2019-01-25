/**
 *  将一些依赖库提前打包, 之后只对更改的js文件进行打包,提升构建速度
 *  DLLPlugin 和 DLLReferencePlugin 用某种方法实现了拆分 bundles，
 *  libtary react react-dom
 */

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