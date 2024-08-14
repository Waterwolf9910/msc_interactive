import dom from "react-dom/client"
import { StrictMode, useState } from "react"
import Footer from "./components/footer"

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


let JSXRender = ({ Element }: { Element: React.JSX.Element | (() => React.JSX.Element) }) => {
    let show = window.sessionStorage.getItem('show_header')
    let [show_header, set_show] = useState(show != null ? show == 'true' : true)
    let toggle_header = (e: KeyboardEvent) => {
        if (e.key == "Escape") {
            set_show(!show_header)
            window.sessionStorage.setItem("show_header", `${!show_header}`)
        }
    }

    window.removeEventListener("keydown", toggle_header)
    window.addEventListener("keydown", toggle_header)

    return <StrictMode>
        <main>
            {typeof Element == "function" ? <Element /> : Element}
        </main>
        {process.env.NODE_ENV == 'development' && show_header ? <Footer /> : <></>}
    </StrictMode>
}

export const render = (Element: React.JSX.Element | (() => React.JSX.Element)) => {
    
    try {
        root.render(<JSXRender Element={Element} />)
    } catch (err) {
        root.render(<p style={{color: "crimson"}}>
            The following fatal error has occured within this application:
            <p style={{color: "white"}}>{JSON.stringify(err, null, 2)}</p>
        </p>)
    }
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

//@ts-ignore
export const isMobile: boolean = navigator?.userAgentData?.mobile ?? false

let temp = page_list[0]
let i = page_list.findIndex(v => v.section == '')!
page_list[0] = page_list[i]
page_list[i] = temp

export const _root = root

export default {
    render,
    page_list,
    isMobile,
    // _root
}
