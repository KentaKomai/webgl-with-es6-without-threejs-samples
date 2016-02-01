
module.exports = {
  entry: {
    app: './assets/sources/es6/app.js',
    x014: './assets/sources/es6/x014/app.js',
    x015: './assets/sources/es6/x015/app.js'
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
