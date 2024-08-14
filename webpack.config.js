let fs = require("fs")
let path = require("path")
let webpack = require("webpack")
let html = require("html-webpack-plugin") // Used to inject our assets into the template page
let inline = require("html-inline-script-webpack-plugin") // Inline the js to the html page
let terser = require("terser-webpack-plugin") // Minimiser
let autoprefixer = require('autoprefixer') // Needed for bootstrap
let tspaths = require("tsconfig-paths-webpack-plugin").TsconfigPathsPlugin // For basepath
let rrwp = require("@pmmmwh/react-refresh-webpack-plugin") // Hot reload for react
let rrt = require("react-refresh-typescript") // Typescript support for the above

let isDev = process.env.NODE_ENV == "development"
let html_template = fs.readFileSync(path.resolve(__dirname, `src/${isDev ? 'dev_' : ''}template.html`), {encoding: 'utf-8'})

// Get a list on entries from our page list
let entries = (() => {
    // Get all of our pages
    let pages = fs.readdirSync(path.resolve(__dirname, 'src/js/pages'), {withFileTypes: true, recursive: true})
        .filter(v => v.isFile() && v.name.endsWith(".tsx"))
        .map(v => ({...v, path: v.path.replace(/^\/([A-Z]:)/, '$1')}))
    /**@type {webpack.EntryObject} */
    let r = {}
    for (let page of pages) {
        // let file_dir = 
        let file_path = ('./' + path
            .relative(path.resolve(__dirname, "src"), page.path)
            .replace(/\\/g, '/')
            + '/' + page.name
        )
        .replace(/^\//, '')
        r[file_path.replace('./js/pages/', '').replace(/\.(js|ts)x/, '')] = {
            import: [path.resolve(__dirname, 'src/js/inject.tsx'), file_path],
                filename: file_path.replace(/\.(js|ts)x/, '.js').replace(/^\.\//, '')
        }
    }
    return r
})()

/**
 * 
 * @param {string} str 
 * @returns 
 */
const upperFirst = (str) => {
    let val = str.split('_')
    for (let i = 0; i < val.length; ++i) {
        val[ i ] = val[ i ][ 0 ].toUpperCase() + val[ i ].substring(1)
    }

    return val.join(' ')
}

// Create a list of html objects from our list of pages
let html_list = Object.keys(entries).map(name => {
    let _name = name.split('/').at(name.endsWith('/index') ? -2 : -1)
    return new html({
        cache: true,
        chunks: [ name ],
        filename: `${name}.html`,
        inject: "body",
        favicon: path.resolve(__dirname, 'src/assets/favicon.ico'),
        minify: isDev ? {
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
        } : false,
        templateContent: html_template
            .replace("&{_title_}", 
                (name == 'index' ? "Homepage" : `${upperFirst(_name)}`)
                .replace('_', ' ')
            )
    })
})

/**
 * @type {import('webpack-dev-server').WebpackConfiguration}
 */
let config = {
    entry: entries,
    target: ['web', 'es2022'],
    stats: 'normal',
    context: path.resolve(__dirname, "src"),
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    output: {
        path: path.resolve(__dirname, 'build'),
        charset: true,
        clean: true,
        publicPath: '/' // Ignore and create from script; set as slash for dev server
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        plugins: [new tspaths],
        // alias: {
        //     assets: path.resolve(__dirname, "src/assets"),
        //     css: path.resolve(__dirname, "src/css"),
        //     js: path.resolve(__dirname, "src/js")
        // }
        alias: {
            'assert/strict': path.resolve(__dirname, 'src/js/polyfills/assert/strict')
        }
    },
    devServer: {
        hot: true,
        port: 3000,
        client: {
            logging: "warn",
            overlay: {
                errors: false,
                warnings: false
            }
        },
        liveReload: true,
    },
    plugins: (() => {
        /*** @type {webpack.WebpackPluginInstance[]} */
        let plugins = [
            ...html_list,
        ]
        if (isDev) {
            plugins.push(
                new rrwp({overlay: { sockIntegration: 'wds', }})
            )
        } else {
            plugins.push(
                new inline()
            )
        }
        return plugins
    })(),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    getCustomTransformers: () => {
                        if (isDev) {
                            return {before: [rrt.default()]}
                        }
                    }
                }
            },
            {
                test: /\.(sc|c|sa)ss$/i,
                sideEffects: true,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: isDev ? 'styleTag' : "singletonStyleTag",
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            // modules: {
                            //     mode: "global",
                            //     namedExport: true
                            // },
                            import: true,
                            modules: false,
                            importLoaders: 0,
                            sourceMap: isDev
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer
                                ]
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // api: "modern",
                            sourceMap: isDev,
                            sassOptions: {
                                fiber: false
                            }
                        }
                    },
                ]
            },
            {
                test: /\.(png|jpeg|jpg|gif|webp|ico|bmp|svg)$/i,
                dependency: { not: [ 'url' ] },
                type: 'asset/inline',
            },
            {
                test: /\.(txt|music)$/,
                dependency: { not: [ 'url' ] },
                type: 'asset/source'
            }
        ]
    },
    optimization: isDev ? {} : {
        minimize: true,
        usedExports: "global",
        minimizer: [
            new terser({
                parallel: true,
                extractComments: false,
                terserOptions: {
                    sourceMap: false,
                    compress: {
                        booleans: true,
                        conditionals: true,
                        dead_code: true,
                        drop_console: false,
                        drop_debugger: true,
                        if_return: true,
                        join_vars: true,
                        keep_infinity: true,
                        loops: true,
                        negate_iife: false,
                        properties: false,
                    },
                    format: {
                        indent_level: 0,
                    }
                }
            })
        ],
        providedExports: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        concatenateModules: true
    },
}

module.exports = config
