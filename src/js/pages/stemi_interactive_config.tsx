import "css/base.scss"
import "highlight.js/scss/monokai-sublime.scss"
import clipboard from "bootstrap-icons/icons/clipboard.svg"
import utils from "js/utils";
import ConfigEntry from "js/components/config_entry"
import "bootstrap"
import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import json_hl from "highlight.js/lib/languages/json"

hljs.registerLanguage("json", json_hl)

enum element_types {
    fill,
    associations,
    image_hotspots,
    mark_the_word,
    flip_cards,
    other
}

let allowed_types = (path: string, type: element_types): string[] => {
    let types: string[] = []

    if (type != element_types.flip_cards && type != element_types.other && path == "root") {
        types.push("object")
    }

    switch (type) {
        case element_types.fill: {
            if (/\.Item [0-9]+$/.test(path)) {
                types.push('number', 'string')
            }
            break;
        }
        case element_types.associations: {
            if (/\.Item [0-9]+$/.test(path)) {
                types.push('object')
            }
            if (/\.Item [0-9]+\.(left|right)$/.test(path)) {
                types.push('string')
            }
            break
        }
        case element_types.image_hotspots: {
            if (/\.Item [0-9]+\.points\.Item [0-9]+$/.test(path)) {
                types.push('string')
                break
            }
            if (/\.Item [0-9]+$/.test(path)) {
                types.push('array', 'string')
            }
            if (/\.Item [0-9]+\.points$/.test(path)) {
                types.push('object')
            }
            break
        }
        case element_types.mark_the_word: {
            if (/\.Item [0-9]+$/.test(path)) {
                types.push('number')
            }
            break
        }
        case element_types.flip_cards: {
            if (path.endsWith("root")) {
                types.push('array')
            }
            if (/\.(content|alternativeContent)$/.test(path)) {
                types.push('object')
            }
            if (/\.Item [0-9]+$/.test(path)) {
                types.push('string')
            }
        }
    }

    return types
}

let allowed_names = (path: string, type: element_types): string[] => {
    let names: string[] = []
    console.log(path, type)
    switch (type) {
        case element_types.fill: {
            if (/\.Item [0-9]+$/.test(path)) {
                names.push('index', 'key', 'answer')
            }
            break
        }
        case element_types.associations: {
            if (/\.Item [0-9]+$/.test(path)) {
                names.push('left', 'right')
            }
            if (/\.Item [0-9]+\.(left|right)$/.test(path)) {
                names.push('type', 'src')
            }
            break
        }
        case element_types.image_hotspots: {
            if (/\.Item [0-9]+\.points\.Item [0-9]+$/.test(path)) {
                names.push('x', 'y')
                break
            }
            if (/\.Item [0-9]+$/.test(path)) {
                names.push('key', 'type', 'answer', 'points', 'x', 'y', 'info')
            }
            break
        }
        case element_types.mark_the_word: {
            if (/\.Item [0-9]+$/.test(path)) {
                names.push('index')
            }
            break
        }
        case element_types.flip_cards: {
            if (path.endsWith('root')) {
                names.push('content', 'alternativeContent')
            }
            if (/\.Item [0-9]+$/.test(path)) {
                names.push('type', 'src', 'align', 'textAlign')
            }
        }
    }
    return names;
}
let getEnums = (path: string, type: element_types): string[] | null => {
    switch (type) {
        case element_types.associations: {
            if (path.endsWith(".type")) {
                return ['image', 'text', 'audio']
            }
            break
        }
        case element_types.image_hotspots: {
            if (path.endsWith("type")) {
                return ['Rectangle']
            }
            break
        }
        case element_types.flip_cards: {
            // [Aa]lign
            if (path.endsWith('lign')) {
                return ['right', 'left', 'center']
            }
            if (path.endsWith('type')) {
                return ['image', 'text', 'audio']
            }
            break
        }
        case element_types.mark_the_word:
    }
    return null
}

let page = () => {
    let [type, set_type] = useState<element_types>(element_types.fill)
    let [value, set_value] = useState<jsonable>([])
    let [indent, set_indent] = useState(4)
    let hl_ref = useRef<HTMLElement>(null)

    let on_change = (path: string, _value: jsonable) => {
        let val = value
        let split = path.split('.').map(_v => {
            let v = parseInt(_v.replace(/Item ([0-9]+)/, '$1'))
            return isNaN(v) ? _v : v
        })

        if (value instanceof Array) {
            split.shift()
        }

        if (split[0] == 'root') {
            split.shift()
        }

        let holder: any = val!
        for (let i = 0; i < split.length; ++i) {
            if (i == split.length - 1) {
                holder[split[i]] = _value
                break
            }
            holder = holder[split[i]]
        }

        if (val instanceof Array) {
            return set_value([...val])
        }
        if (typeof val == 'object') {
            return set_value({...val})
        }
        console.log(val) // should not get hit
    }
    
    // let hl = hljs.highlight(JSON.stringify(value), { language: 'json' })
    useEffect(() => {
        delete hl_ref.current!.dataset.highlighted
        hljs.highlightAll()
    })

    return <div>
        <div style={{paddingBottom: '10px'}}>
            <label htmlFor="type">Type</label>
            <select id="type" onChange={(e) => {
                set_value(parseInt(e.target.value) == element_types.flip_cards || parseInt(e.target.value) == element_types.other ? {} : [])
                set_type(parseInt(e.target.value))
            }}>
                <option label={element_types[element_types.fill]} value={element_types.fill} />
                <option label={element_types[element_types.associations]} value={element_types.associations} />
                <option label={element_types[element_types.flip_cards]} value={element_types.flip_cards} />
                <option label={element_types[element_types.image_hotspots]} value={element_types.image_hotspots} />
                <option label={element_types[element_types.mark_the_word]} value={element_types.mark_the_word} />
                <option label={element_types[element_types.other]} value={element_types.other} />
            </select>
        </div>
        <ConfigEntry config_key="root" value={value} on_change={on_change} customizer={{allowed_types: (p) => allowed_types(p, type), allowed_names: (p) => allowed_names(p, type), getEnums: (p) => getEnums(p, type)}} />
        {/* <div dangerouslySetInnerHTML={{__html: hl.value}}></div> */}
        <div>
            <label htmlFor="indent" style={{paddingRight: '10px'}}>Indent: </label>
            <input id="indent" type="number" defaultValue={indent} onChange={e => set_indent(e.target.valueAsNumber)} min={0}/>
        </div>
        <div className="row">
            <img src={clipboard} onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(value, null, indent))
            }} style={{filter: 'invert(1)', cursor: 'pointer', alignSelf: "start"}} />
            <pre style={{flexGrow: 1}}>
                <code ref={hl_ref} className="language-json">
                    {JSON.stringify(value, null, indent)}
                </code>
            </pre>
        </div>
    </div>
}
//@ts-ignore
window.hljs = hljs
utils.render(page)
