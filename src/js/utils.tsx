import dom from "react-dom/client"
import { StrictMode } from "react"

let root: dom.Root

if (module.hot) {
    root = module.hot.data?.root ?? dom.createRoot(document.getElementById("root")!)
    module.hot.addDisposeHandler((data) => {
        data.root = root
    })
    module.hot.accept()
} else {
    console.log(document.getElementById('root'))
    root = dom.createRoot(document.getElementById('root')!)
}

export const render = (Element: React.JSX.Element | (() => React.JSX.Element)) => {
    root.render(<StrictMode>
        {/**TODO: Add Header for all pages*/}
        <main>
            {typeof Element == "function" ? <Element /> : Element}
        </main>
    </StrictMode>)
}

export default {
    render
}
