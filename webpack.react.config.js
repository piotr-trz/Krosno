const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 

module.exports = {
    // Change to your "entry-point".
    entry: './react/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'react.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\.css$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|svg|jpg|jpeg|gif|ttf)$/i,
            exclude: /node_modules/,
            type: 'asset/resource'
        }]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './react/index.html'
      })
    ]
};
