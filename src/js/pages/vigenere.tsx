import "css/vigenere.scss"
import { useRef } from "react"
import utils from "js/utils"
import Description from "js/components/vigenere_desc"

// Generate our table and lookup
const alphabet = Object.fromEntries(Array(26).fill(0).map((_, i) => [String.fromCharCode(0x61 + i), i]))
const table = Array(26).fill(0).map((_, i) => Array(26).fill(0).map((_, j) => String.fromCharCode(0x61 + (i + j) % 26)))

let page = () => {
    let input_ref = useRef<HTMLTextAreaElement>(null)
    let output_ref = useRef<HTMLTextAreaElement>(null)
    let stream_ref = useRef<HTMLInputElement>(null)
    let decrypt = false
    let key = 'secret'
    let keystream = 'secretsecre'

    // Handle input from user and encrypt message 
    let on_input = () => {
        let plain_text = input_ref.current!.value
        let encrypted = ''
        // Get our effective key from original key
        keystream = key.repeat(1 + plain_text.length).substring(0, plain_text.length).toLowerCase()

        for (let i = 0; i < plain_text.length; ++i) {
            let char = plain_text[i]
            // If add char if not in loopup table
            if (alphabet[char.toLowerCase()] == undefined) {
                encrypted += char
                continue
            }
            /**
             * Decrypt: ['a', 'b', ...][index of table[index of key char]]
             * Encrypt: ['a', 'b', ...][index of input char][index of key char]
             * (Indexes can be swapped, i.e: [ic][kc] -> [kc][ic])
             */
            let newchar = decrypt ? Object.keys(alphabet)[table[alphabet[keystream[i]]].indexOf(char.toLowerCase())] : table[alphabet[char.toLowerCase()]][alphabet[keystream[i]]]

            if (char == char.toUpperCase()) {
                encrypted += newchar.toUpperCase()
            } else {
                encrypted += newchar
            }

        }

        // Display are new message
        output_ref.current!.value = encrypted
        stream_ref.current!.value = keystream
    }

    return <div className="col center_items">
        <p><label htmlFor="key">Key + Keystream: </label></p>
        <input type="text" id='key' defaultValue='secret' onChange={e => { key = e.target.value = e.target.value.replace(/[^A-Za-z]/g, ''); on_input() }} />
        <input type="text" id="keystream" title="keystream" readOnly value={keystream} ref={stream_ref}/>
        <div className="bottom_separator">
            <p><label htmlFor="plaintext">Input: </label></p>
            <textarea defaultValue='Hello World' wrap="hard" cols={50} rows={4} id='plaintext' onChange={on_input} ref={input_ref} />
        </div>
        <div>
            <p><label htmlFor="encrypted">Output: </label></p>
            <textarea value='Zincs Ostch' wrap="hard" cols={50} rows={4} id="encrypted" readOnly ref={output_ref}/>
        </div>
        <div className="row form-switch">
            <label htmlFor="decrypt">Decrypt: </label>
            <input type="checkbox" id="decrypt" className="form-check-input" onChange={e => { decrypt = e.target.checked; input_ref.current!.value = output_ref.current!.value; on_input() }} />
        </div>
        <br />
        <table>
            <thead>
                <tr>
                    <th scope="col"> </th>
                    {Object.keys(alphabet).map(char => <th scope="col" key={char}>{char}</th>)}
                </tr>
            </thead>
            <tbody>
                {Object.entries(alphabet).map(([char, i]) => <tr key={char}>
                    <th scope="row">{char}</th>
                    {table[i].map(v => <td key={v + i}>{v}</td>)}
                </tr>)}
            </tbody>
        </table>
        <Description />
    </div>
}

utils.render(page)
