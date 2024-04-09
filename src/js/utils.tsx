import dom from "react-dom/client"
import { StrictMode } from "react"
import Header from "./components/header"

let root: dom.Root

if (module.hot) {
    root = module.hot.data?.root ?? dom.createRoot(document.getElementById("root")!)
    module.hot.addDisposeHandler((data) => {
        data.root = root
    })
    module.hot.accept()
} else {
    root = dom.createRoot(document.getElementById('root')!)
}

export const render = (Element: React.JSX.Element | (() => React.JSX.Element)) => {
    root.render(<StrictMode>
        <Header />
        {/**TODO: Add Header for all pages*/}
        <main>
            {typeof Element == "function" ? <Element /> : Element}
        </main>
    </StrictMode>)
}

export const upperFirst = (str: string) => {
    let val = str.split(' ')
    for (let i = 0; i < val.length; ++i) {
        val[i] = val[i][0].toUpperCase() + val[i].substring(1)
    }

    return val.join(' ')
}

export const page_list = require.context("./pages", true, /\.tsx$/, 'lazy').keys()
    .map(v => {
        let section = v.replace("./", '').replace(".tsx", '.html').replace("index.html", '')
        let name = section.length < 1 ? "Homepage" : upperFirst(section[0].toUpperCase() + section.substring(1)
            .replace('.html', '')
            .replace(/\/$/, '')
            .replace(/_|-/g, ' ')
        )
        return {
            section,
            name
        }
    })

let temp = page_list[0]
let i = page_list.findIndex(v => v.section == '')!
page_list[0] = page_list[i]
page_list[i] = temp

export default {
    render,
    page_list
}
