const path = require('path');

module.exports = [
{
    entry: {
        main: './main/main.ts',
        stream_thread: "./main/stream/stream_thread.ts",
        file_sender: "./main/stream/file_sender.ts",
        file_loader: "./main/stream/file_loader.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
    module: {
        rules: [{
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: "babel-loader",
        },],
    },
    target: "electron-main",
},
{
    entry: './main/preload.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'preload.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }]
    },
    target: "electron-preload"
},
]
