import "css/caeser.scss"
import utils from "../utils"
import { useRef } from "react"

// Our original alphabet
const alphabet = Array(26).fill(0).map((_, i) => String.fromCharCode(0x61 + i))
// letter index pair of each letter
const a_loopup = Object.fromEntries(alphabet.map((v, i) => [v, i]))

let page = () => {
    let input_ref = useRef<HTMLTextAreaElement>(null)
    let output_ref = useRef<HTMLTextAreaElement>(null)
    let shift = 11
    let decrypt = false

    // Similar to vigenere.tsx 
    let on_input = () => {
        let plain_text = input_ref.current!.value
        let encrypted = ''

        for (let char of plain_text) {
            if (a_loopup[char.toLowerCase()] == undefined) {
                encrypted += char
                continue
            }

            let newchar = decrypt ? alphabet.at((a_loopup[char.toLowerCase()] - shift || 1) % 26)! : alphabet[(a_loopup[char.toLowerCase()] + shift || 1) % 26]
            
            if (char == char.toUpperCase()) {
                encrypted += newchar.toUpperCase()
            } else {
                encrypted += newchar
            }
        }

        output_ref.current!.value = encrypted
    }

    return <div className="col center_items">
        <div>
            <p>The ceaser cipher is an method used to encrypt text</p>
        </div>
        <div className="row center_items">
            <label htmlFor="shift">Shift: </label>
            <input defaultValue='11' type="number" min={1} max={25} minLength={1} id='shift' onChange={(e) => {e.target.valueAsNumber = e.target.value.length < 1 ? 1 : e.target.valueAsNumber; shift = e.target.valueAsNumber; on_input();}} />
        </div>
        <div className="col">
            <label htmlFor="plaintext">Input: </label>
            <textarea defaultValue='Hello World' wrap="hard" cols={50} rows={4} id='plaintext' onChange={on_input} ref={input_ref} />
        </div>
        <div className="col">
            <label htmlFor="output">Output: </label>
            <textarea value={'Spwwz Hzcwo'} wrap="hard" cols={50} rows={4} id="output" readOnly ref={output_ref} />
        </div>
        <div className="row center_items form-switch">
            <label htmlFor="decrypt">Decrypt: </label>
            <input type="checkbox" id="decrypt" className="form-check-input" onChange={e => { decrypt = e.target.checked; input_ref.current!.value = output_ref.current!.value; on_input() }} />
        </div>
        <p>Set shift value in Shift.</p>
        <p>Enter text into the input box and get an output</p>
        <p>Decrypt will flip the values and decrypt input</p>
        {/* <Description /> */}
    </div>
}

utils.render(page)
