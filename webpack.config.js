let rrt = require("react-refresh-typescript")
let rrwp = require("@pmmmwh/react-refresh-webpack-plugin")
let fs = require("fs")
let path = require("path")
let webpack = require("webpack")
let html = require("html-webpack-plugin")
let inline = require("html-inline-script-webpack-plugin")
let terser = require("terser-webpack-plugin")
let autoprefixer = require('autoprefixer')

let isDev = process.env.NODE_ENV == "development"
let html_template = fs.readFileSync(path.resolve(__dirname, "src/template.html"), {encoding: 'utf-8'})

let entries = (() => {
    // Get all of our pages
    let pages = fs.readdirSync(path.resolve(__dirname, 'src/js/pages'), {withFileTypes: true})
    /**@type {webpack.EntryObject} */
    let r = {}
    for (let page of pages) {
        let name = page.name.replace(/\.(js|ts)x?$/, '')
        r[name] = {
            import: `./${path.relative(path.resolve(__dirname, "src"), page.path).replace(/\\/g, '/')}/${page.name}`,
            filename: `${name}.js`,
        }
        // if (isDev) {
        //     r[name].import.unshift("")
        // }
    }
    return r
})()

// Create a list of html objects from our list of pages
let html_list = Object.keys(entries).map(name => new html({
    cache: true,
    chunks: [ name ],
    filename: `${name}.html`,
    inject: "body",
    minify: isDev ? {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
    } : false,
    templateContent: html_template.replace("&{_title_}", name == 'index' ? "Homepage" : `${name[0].toUpperCase()}${name.substring(1)}`)
}))

/**
 * @type {import('webpack-dev-server').WebpackConfiguration}
 */
let config = {
    entry: entries,
    target: ['web'],
    stats: 'normal',
    context: path.resolve(__dirname, "src"),
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    output: {
        path: path.resolve(__dirname, 'build'),
        charset: true,
        clean: true,
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
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
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "singletonStyleTag",
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
                test: /\.(png|jpeg|jpg|gif|webp|ico)$/i,
                dependency: { not: [ 'url' ] },
                type: 'asset/inline',
            }
        ]
    },
    optimization: isDev ? {} : {
        minimize: true,
        minimizer: [
            new terser({
                parallel: true,
                extractComments: true,
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
