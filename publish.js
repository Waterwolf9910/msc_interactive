#!/usr/bin/env node

let fs = require('fs')
let path = require("path")
let base_file = fs.readFileSync("./fix.html", {encoding: "utf8"})
/**
 * @type {{[key: string]: {width: number, height: number}}}
 */
let base_info = require("./base_sizes.json")
let child_process = require("child_process")
let yargs = require("yargs/yargs")
let hidebin = require("yargs/helpers").hideBin
let argv = yargs(hidebin(process.argv))
.help(true)
.option('no_rebuild', {
    type: 'boolean',
    describe: 'Run the command without rebuilding every html file'
})
.option("input", {
    type: "string",
    describe: "The module to build for",
})
.options("height", {
    type: "number",
    describe: "The height (in pixels) for the module to be",
    default: null
})
.option("width", {
    type: "number",
    describe: "The width (in pixels) for the module to be",
    default: null
})
.parse()

if (!argv.no_rebuild) {
    let webpack = child_process.spawnSync("yarn", ["webpack", "-c", "webpack.config.js"], {stdio: 'inherit', shell: true})
    
    if (webpack.status != 0) {
        console.error("Error in webpack step")
        process.exit(webpack.status ?? 1)
    }
}

let files = fs.readdirSync(path.resolve(__dirname, "build"), { encoding: 'utf-8', withFileTypes: true, recursive: true }).filter(file => file.isFile() && file.name.endsWith(".html"))
files.forEach(file => {
    file.name = path.relative(path.resolve(__dirname, 'build'), path.resolve(file.parentPath, file.name))
    file.parentPath = path.resolve(__dirname, 'build')
})
let file_entries = Object.fromEntries(files.map(file => [file.name.replace(".html", ''), path.resolve(file.parentPath, file.name)]))

if (argv.input) {
    if (!file_entries[argv.input]) {
        console.error("No module found with the name", argv.input)
        process.exit(1)
    }
    let html = fs.readFileSync(file_entries[argv.input], {encoding: "utf-8"})
    // let out = base_file.replace('{html}', html)
    //     .replace('{height}', argv.height)
    //     .replace('{width}', argv.width)
    let width = argv.width || base_info[argv.input]?.width || 512
    let height = argv.height || base_info[argv.input]?.height || 512
    let out = base_file.replace('{html}', html)
        .replace('{height}', height)
        .replace('{width}', width)
        .replaceAll("{name}", argv.input)
    fs.writeFileSync(path.resolve(__dirname, `publish/${argv.input}.html`), out)
    console.log("Complete")
    process.exit(0)
}

for (let name in file_entries) {
    let html = fs.readFileSync(file_entries[ name ], { encoding: "utf-8" })
    let width = argv.width || base_info[ name ]?.width || 512
    let height = argv.height || base_info[ name ]?.height || 512
    let out = base_file.replace('{html}', html)
        .replace('{height}', height)
        .replace('{width}', width)
        .replaceAll("{name}", name.replace(path.sep, '-'))
    fs.mkdirSync(path.dirname(path.resolve(__dirname, `publish/${name}`)), {recursive: true})
    fs.writeFileSync(path.resolve(__dirname, `publish/${name}.html`), out)
}

console.log("Complete")
