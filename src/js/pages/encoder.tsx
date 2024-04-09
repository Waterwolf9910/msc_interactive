import "css/encoder.scss"
import { useRef } from "react"
import utils from "../utils"

enum types {
    hex,
    binary,
    ascii,
    decimal
}

let page = () => {
    let asciiRef = useRef<HTMLInputElement>(null)
    let hexRef = useRef<HTMLInputElement>(null)
    let binaryRef = useRef<HTMLInputElement>(null)
    let decimalRef = useRef<HTMLInputElement>(null)

    let on_change = (type: types) => {
        let buf: Buffer
        switch (type) {
            case types.hex: {
                buf = Buffer.from(hexRef.current!.value.replace(/ /g, ''), 'hex')
                break
            }
            case types.binary: {
                buf = Buffer.from(binaryRef.current!.value)
                break
            }
            case types.ascii: {
                buf = Buffer.from(asciiRef.current!.value)
                break
            }
            case types.decimal: {
                buf = Buffer.from(decimalRef.current!.value.split(' ').map(v => parseInt(v)))
                break
            }
        }

        if (type != types.hex) {
            hexRef.current!.value = buf.toString('hex').replace(/(.{2})/g, '$1 ')
        }
        if (type != types.ascii) {
            asciiRef.current!.value = buf.toString('ascii')
        }
        let binary = ''
        let decimal = ''
        for (let val of buf) {
            decimal += val + ' '
            binary += val.toString(2).padStart(8, '0') + ' '
        }
        if (type != types.binary) {
            binaryRef.current!.value = binary
        }
        if (type != types.decimal) {
            decimalRef.current!.value = decimal
        }
    }

    return <div className="col center_items">
        <div className="row input-group">
            <span className="input-group-text" id="ascii-label">Ascii</span>
            <input className="form-control" aria-labelledby="ascii-label" ref={asciiRef} onChange={() => on_change(types.ascii)} />
        </div>
        <div className="row input-group">
            <span className="input-group-text" id="hex-label">Hex</span>
            <input className="form-control" aria-labelledby="hex-label" ref={hexRef} onChange={(e) => { e.target.value = e.target.value.replace(/[^a-f0-9 ]/, ''); on_change(types.hex)}} />
        </div>
        <div className="row input-group">
            <span className="input-group-text" id="binary-label">Binary</span>
            <input className="form-control" aria-labelledby="binary-label" ref={binaryRef} defaultValue={'00000000'} onChange={(e) => { e.target.value = e.target.value.replace(/[^0-9 ]/g, ''); on_change(types.binary) }} />
        </div>
        <div className="row input-group">
            <span className="input-group-text" id="decimal-label">Decimal</span>
            <input className="form-control" aria-labelledby="decimal-label" defaultValue={'00'} ref={decimalRef} onChange={(e) => { e.target.value = e.target.value.replace(/[^0-9 ]/g, ''); on_change(types.decimal)}} />
        </div>
    </div>
}

utils.render(page)
