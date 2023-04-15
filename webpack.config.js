// webpack.config.js

module.exports = {
    mode: 'development', // or 'production'
    // rest of your webpack configuration
    entry: './app.js',
    resolve: {
        fallback: {
            zlib: false,
            querystring: false,
            path: false,
            "stream": false,
            "crypto": false,
            "fs": false,
            "http": false,
            "net": false


        }
    }

};