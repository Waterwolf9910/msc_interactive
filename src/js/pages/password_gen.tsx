import "css/password_gen.scss"
import utils from "../utils"
import { useRef, useState } from "react"
import _random from "wolf_utils/random.js"
let random = _random()

let page = () => {
    let resultRef = useRef<HTMLInputElement>(null)
    let lengthRef = useRef<HTMLInputElement>(null)
    let [uppercase, set_uppercase] = useState(false)
    let [numbers, set_numbers] = useState(false)
    let [spec_chars, set_spec_chars] = useState(false)

    return <div className="col center_items">
        <div className="row center_items input-group btn-group">
            <span id="result_label" className="input-group-text">Password Generator</span>
            <input aria-labelledby="result_label" type="text" className="form-control" ref={resultRef} readOnly />
            <input type="button" id="gen" className="btn btn-success" value={"Generate"} onClick={e => {
                let exclude = /[^#!@&*$\-_=+?]/g
                if (numbers && spec_chars) {
                    resultRef.current!.value = random.alphaNumSpecial(uppercase, exclude, lengthRef.current!.valueAsNumber)
                    return
                }
                if (numbers) {
                    resultRef.current!.value = random.alphaNum(uppercase, lengthRef.current!.valueAsNumber)
                    return
                }
                if (spec_chars) {
                    resultRef.current!.value = random.alphaSpecial(uppercase, exclude, lengthRef.current!.valueAsNumber)
                    return
                }
                resultRef.current!.value = random.alpha(uppercase, lengthRef.current!.valueAsNumber)
            }} />
        </div>
        <div className="row center_items options">
            <div className="row btn-group">
                <span id="upper_label" className="input-group-text">Uppercase</span>
                <input type="button" aria-labelledby="upper_label" value={uppercase ? "Enabled" : "Disabled"} className={`btn btn-${uppercase ? 'success' : 'danger'}`} onClick={() => set_uppercase(!uppercase)} />
            </div>
            <div className="row btn-group">
                <span id="number_label" className="input-group-text">Number</span>
                <input type="button" aria-labelledby="number_label" value={numbers ? "Enabled" : "Disabled"} className={`btn btn-${numbers ? 'success' : 'danger'}`} onClick={() => set_numbers(!numbers)} />
            </div>
            <div className="row btn-group">
                <span id="char_label" className="input-group-text">Spec Chars</span>
                <input type="button" aria-labelledby="char_label" value={spec_chars ? "Enabled" : "Disabled"} className={`btn btn-${spec_chars ? 'success' : 'danger'}`} onClick={() => set_spec_chars(!spec_chars)}/>
            </div>
            <div className="row input-group">
                <span id="length_label" className="input-group-text">Length</span>
                <input aria-labelledby="length_label" type="number" defaultValue="50" min={1} className="form-control" ref={lengthRef}/>
            </div>
        </div>
        <div>
            <p>Set options above then click green generate button</p>
        </div>
        <p></p>
        {/* <Description /> */}
    </div>
}

utils.render(page)
