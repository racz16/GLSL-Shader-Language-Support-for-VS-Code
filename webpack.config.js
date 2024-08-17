//@ts-check
'use strict';
/** @typedef {import('webpack').Configuration} WebpackConfig **/

module.exports = (_env, argv) => {
    const getServerConfigs = require('./GLSL-Language-Server/webpack.config.js');
    const [serverDesktopConfig, serverWebConfig] = getServerConfigs(_env, argv);
    const isProductionMode = argv.mode === 'production';
    const path = require('path');

    /** @type WebpackConfig */
    const clientWebConfig = {
        context: path.join(__dirname),
        mode: isProductionMode ? 'production' : 'development',
        target: 'webworker',
        entry: './src/client-web.ts',
        output: {
            filename: 'client-web.js',
            path: path.join(__dirname, 'out'),
            libraryTarget: 'commonjs',
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.ts', '.js'],
            alias: {
                '@vscode/extension-telemetry': path.resolve(
                    __dirname,
                    'node_modules/@vscode/extension-telemetry/dist/browser/browser/telemetryReporter.js'
                ),
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                    ],
                },
            ],
        },
        externals: {
            vscode: 'commonjs vscode',
        },
    };

    /** @type WebpackConfig */
    const clientDesktopConfig = {
        context: path.join(__dirname),
        mode: isProductionMode ? 'production' : 'development',
        target: 'node',
        entry: './src/client-desktop.ts',
        output: {
            filename: 'client-desktop.js',
            path: path.resolve(__dirname, 'out'),
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '../[resource-path]',
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
                    ],
                },
            ],
        },
        externals: {
            vscode: 'commonjs vscode',
        },
        devtool: isProductionMode ? false : 'source-map',
    };
    return [clientDesktopConfig, clientWebConfig, serverDesktopConfig, serverWebConfig];
};
