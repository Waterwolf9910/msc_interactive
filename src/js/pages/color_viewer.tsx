import "css/color_viewer.scss"
import { useRef } from "react"
import utils from "../utils"

let page = () => {
    let hexRef = useRef<HTMLInputElement>(null)
    let rRef = useRef<HTMLInputElement>(null)
    let gRef = useRef<HTMLInputElement>(null)
    let bRef = useRef<HTMLInputElement>(null)
    let colorRef = useRef<HTMLInputElement>(null)

    let on_change = (_, change: 'rgb' | 'hex' = 'rgb') => {
        let hex = hexRef.current!.value.padEnd(6, '0')
        if (change == 'hex') {
            rRef.current!.value = Number('0x'+ hex[0] + hex[1]).toString()
            gRef.current!.value = Number('0x' +hex[2] + hex[3]).toString()
            bRef.current!.value = Number('0x' +hex[4] + hex[5]).toString()
        } else {
            hexRef.current!.value = rRef.current!.valueAsNumber.toString(16).padStart(2, '0') +
                gRef.current!.valueAsNumber.toString(16).padStart(2, '0') +
                bRef.current!.valueAsNumber.toString(16).padStart(2, '0')
        }

        colorRef.current!.style.backgroundColor = `#${hexRef.current!.value}`
    }

    return <div className="col center_items">
        <div className="row input_group">
            <span className="input-group-text" id="color-label">RGB | Hex</span>
            <input type="number" aria-labelledby="color-label" max={255} min={1} defaultValue={255} onChange={on_change} ref={rRef} />
            <input type="number" aria-labelledby="color-label" max={255} min={1} defaultValue={0} onChange={on_change} ref={gRef}/>
            <input type="number" aria-labelledby="color-label" max={255} min={1} defaultValue={0} onChange={on_change} ref={bRef} />
            <span className="input-group-text" id="hex-label">#</span>
            <input aria-labelledby="hex-label" maxLength={6} onChange={(e) => {e.target.value = e.target.value.replace(/[^a-f0-9]/, ''); on_change('', 'hex')}} ref={hexRef} defaultValue={'ff0000'} />
        </div>
        <div style={{height: '256px', width: '256px', backgroundColor: "#ff0000"}} ref={colorRef} />
    </div>
}

utils.render(page)
