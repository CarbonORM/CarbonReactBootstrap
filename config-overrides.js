/* config-overrides.js */
// @link https://github.com/timarney/react-app-rewired/
const getLogger = require('webpack-log');
const rewireTypingsForCssModule = require("react-app-rewire-typings-for-css-module");
const {
    override,
    addWebpackPlugin, getBabelLoader, addExternalBabelPlugins, useBabelRc, addBundleVisualizer, addBabelPreset,
} = require('customize-cra')
const log = getLogger({name: 'config-overrides.js'});
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');

const pkg = require('./package.json');

const {
    defaultGetLocalIdent
} = require("css-loader/dist/utils")


//log.info('webpack configuration post config-overrides.js', JSON.stringify(config))


// https://github.com/osdevisnot/react-app-rewire-create-react-library/blob/master/index.js
module.exports = override(
    addBundleVisualizer({}, true),
    (config) => {
        if (process.argv.includes('library')) {
            /**
             * Determine Library Name based on package name
             * basename will omit scope name from npm scoped packages
             */
            const libraryName = path.basename(pkg.name);
            /**
             * Read the entry and output filename from package.json's module and main properties
             * Why? Read here: https://github.com/dherman/defense-of-dot-js/blob/master/proposal.md#typical-usage
             */
            const entryFile = pkg.module;


            const outFile = path.basename(pkg.main);
            const outDir = pkg.main.replace(outFile, '');
            /**
             * add library configurations to webpack config
             */
            config.output.library = libraryName;
            config.output.libraryTarget = 'umd';
            /**
             * Change the webpack entry and output path
             */
            config.entry = {[libraryName]: path.resolve(entryFile)};
            config.output.filename = outFile;
            config.output.path = path.resolve(outDir);
            /**
             * Add all package dependencies as externals as commonjs externals
             */
            let externals = {};
            Object.keys(process.env).forEach(key => {

                if (key.includes('npm_package_dependencies_')) {

                    let pkgName = key.replace('npm_package_dependencies_', '');

                    pkgName = pkgName.replace(/_/g, '-');

                    // below if condition addresses scoped packages : eg: @storybook/react
                    if (pkgName.startsWith('-')) {
                        const scopeName = pkgName.substr(1, pkgName.indexOf('-', 1) - 1);
                        const remainingPackageName = pkgName.substr(pkgName.indexOf('-', 1) + 1, pkgName.length);
                        pkgName = `@${scopeName}/${remainingPackageName}`;
                    }

                    externals[pkgName] = `commonjs ${pkgName}`;

                }

            });

            config.externals = externals;

            /**
             * Clear all plugins from CRA webpack config
             */
            config.plugins = [];

        }
        return config;
    },
    addWebpackPlugin(new MiniCssExtractPlugin()),
    function (config, _env) {

        log.info('webpack env loaded rewireTypingsForCssModule')

        // what's going on here? @link https://stackoverflow.com/questions/73551420/removing-hash-from-react-css-modules
        // noinspection JSUnusedGlobalSymbols
        config = rewireTypingsForCssModule.factory({
            modules: {
                exportLocalsConvention: 'camelCase',
                mode: 'local',
                localIdentName: '[local]', // 'production' === process.env.NODE_ENV ? '[hash:base64:5]' : '[path][name]__[local]--[hash:base64:5]',
                exportGlobals: true,
                getLocalIdent: (context, localIdentName, localName, options) => {

                    if (false === context.resourcePath.includes('index.module.')
                        && false === context.resourcePath.includes('bootstrap.module.')
                        && false === context.resourcePath.includes('node_modules')) {

                        log.info(localName)

                        localName = defaultGetLocalIdent(context, localIdentName, localName, options)
                            .replace("[local]", localName)

                        log.info(localName)

                    }

                    return localName;

                }

            }
        })(config); // do not pass env as it will cause the production build will not be modified

        return config;

    },
    (config) => {

        const options = getBabelLoader(config).options;

        const originalPreset = options.presets.find((preset) => preset[0].includes('babel-preset-react-app'));

        if (originalPreset) {

            Object.assign(originalPreset[1], {
                development: true,
                importSource: '@welldone-software/why-did-you-render',
            });

        }

        return config;

    },
);