
module.exports = {
  entry: {
    app : './assets/sources/es6/app.js',
    x014: './assets/sources/es6/x014/app.js',
    x015: './assets/sources/es6/x015/app.js',
    x016: './assets/sources/es6/x016/app.js',
    x017: './assets/sources/es6/x017/app.js',
    x018: './assets/sources/es6/x018/app.js',
    x019: './assets/sources/es6/x019/app.js',
    x020: './assets/sources/es6/x020/app.js'
  },
  output: {
    path:__dirname + '/assets/sources/assets/dist/javascript',
    filename: '[name].bundle.js'
  },
  module:{
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      }
    ]
  }
}
