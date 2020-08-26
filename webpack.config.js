const CopyWebpackPlugin = require('copy-webpack-plugin-advanced');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const stylus_plugin = require('poststylus');
const path = require('path');

const testFolder = './src/views/quiz';
const fs = require('fs');

const puzzleNames = fs.readdirSync(testFolder, (err, files) => {
    return files;
});

console.log(puzzleNames);

const createPuzzleConfig = puzzleName => ({
    entry: `./src/javascripts/quiz/${puzzleName}`,
    output: {
        filename: `${puzzleName}/game.bundle.js`,
        path: path.resolve(__dirname, 'puzzles'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `./src/views/quiz/${puzzleName}.pug`,
            filename: `${puzzleName}/index.html`,
            inject: true,
        }),
        new HtmlWebpackPugPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.pug/,
                use: ['html-loader?attrs=false', 'pug-html-loader']
            },
            { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
            {
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'stylus-loader',
                        options: {
                            use: [stylus_plugin()],
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        query: {
                            name: `${puzzleName}/[name].[ext]`
                        }
                    },
                ],
            },
        ],
    },
});

const config = puzzleNames.map(filename => filename.split('.pug')[0]).map(puzzleName => createPuzzleConfig(puzzleName));

const mainConfig = {
    entry: './src/javascripts/core.js',
    output: {
        filename: 'core.bundle.js',
        path: path.resolve(__dirname, 'puzzles'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/views/list.pug',
            filename: 'index.html',
            inject: true,
        }),
        new HtmlWebpackPugPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.pug/,
                use: ['html-loader?attrs=false', 'pug-html-loader']
            },
            { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
            {
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'stylus-loader',
                        options: {
                            use: [stylus_plugin()],
                        },
                    },
                ],
            }
        ],
    },
};

module.exports = [
    mainConfig,
    // ...config,
];
