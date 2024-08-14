import "css/sounds.scss"
import { useEffect, useRef, useState } from "react";
import utils from "../utils";
import { parser, note_hz_value } from "../music_parser";
import docs from "assets/docs/Music File.txt"
import example from "assets/test.music"
import {Modal} from "bootstrap"

let order = ['c', 'c#/db', 'd', 'd#/eb', 'e', 'f', 'f#/gb', 'g', 'g#/ab', 'a', 'a#/bb', 'b']
let inputs = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']
let ctx = new AudioContext()
ctx.suspend()
let gain = ctx.createGain()
gain.connect(ctx.destination)
let _key_type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'triangle'

let order_i = 0
let _octave = 2;
let _held_keys = {}

for (let i = 0; i < inputs.length; ++i) {
    let key = order[order_i]
    let octave = _octave
    let press = () => {
        if (_held_keys[`${key}${octave}`]) {
            _held_keys[`${key}${octave}`].stop()
            _held_keys[`${key}${octave}`].disconnect()
        }
        if (ctx.state == "suspended") {
            ctx.resume()
        }
        let osc = ctx.createOscillator()
        osc.connect(gain)
        console.log(key.replace(/\/.*/, ''), octave)
        osc.frequency.value = note_hz_value[key.replace(/\/.*/, '')] * (2 ** octave)
        osc.type = _key_type
        _held_keys[`${key}${octave}`] = osc
        osc.start()
    }

    let release = () => {
        try {

            _held_keys[`${key}${octave}`].stop()
            _held_keys[`${key}${octave}`].disconnect()
            _held_keys[`${key}${octave}`] = undefined
        } catch {}
    }

    let _last_timestamp = 0
    console.log(i)
    window.addEventListener("keydown", (e) => {
        if (e.key == inputs[i] && !e.repeat && (e.timeStamp - 1) > _last_timestamp) {
            console.log(e, e.timeStamp, _last_timestamp, inputs[i])
            _last_timestamp = e.timeStamp
            press()
        }
    })
    window.addEventListener("keyup", (e) => {
        if (e.key == inputs[i]) {
            release()
        }
    })

    if (++order_i == order.length) {
        order_i = 0;
        ++_octave
    }
}

let page = () => {
    let [audio, set_audio] = useState(parser(example))
    let [key_type, _set_key_type] = useState<typeof OscillatorNode.prototype.type>("sine")
    let playRef = useRef<HTMLButtonElement>(null)
    let modalRef = useRef(null)
    let volume = .45
    // let volume = .15

    let set_key_type = (key_type: typeof _key_type) => {
        _key_type = key_type
        _set_key_type(key_type)
    }

    useEffect(() => {
        gain.gain.value = volume
        //@ts-ignore
        window.ctx = ctx
        //@ts-ignore
        window.gain = gain
    })

    let r = () => {
        for (let track of Object.values(audio.tracks)) {
            let osc = ctx.createOscillator()
            osc.frequency.value = 0
            osc.type = track.type
            osc.connect(gain)
            osc.start()
            let lengths = Object.keys(track.values)
            let count = 0;
            for (let i = 0; i < lengths.length; i++) {
                // if (i == 0) {
                //     osc.frequency.value = track.values[lengths[i]]
                //     continue
                // //     setTimeout(() => {
                // //         osc.frequency.value = track.values[lengths[i]]
                // //     }, parsed.length_map.q)
                // }
                setTimeout(() => {
                    osc.frequency.value = 0
                    setTimeout(() => {
                        osc.frequency.value = track.values[lengths[i]]
                        console.log(++count, track.values[lengths[i]], lengths[i])
                    }, audio.length_map.t/4)
                }, parseInt(lengths[i]))
            }
            setTimeout(() => {
                osc.stop()
                osc.disconnect()
            }, parseInt(lengths[lengths.length -1]) + audio.length_map.w)
        }
        ctx.resume()
    }
    console.log(audio)
    let held_keys: { [key: string]: OscillatorNode } = {}
    let keys: React.JSX.Element[] = []
    let counter = 0
    for (let i = 0; i < 8; ++i) {
        if (i == 7) {
            keys.push(<rect fill="white" stroke="black" key={"c8"} width={15} height={30} x={11 * (counter)} onMouseDown={() => {
                if (ctx.state == "suspended") {
                    ctx.resume()
                }
                let osc = ctx.createOscillator()
                osc.connect(gain)
                osc.frequency.value = note_hz_value["c"] * (2 ** 8)
                osc.type = key_type
                held_keys["c8"] = osc
                osc.start()
            }} onMouseUp={() => {
                held_keys["c8"].stop()
                held_keys["c8"].disconnect()
            }} />)
            break
        }

        for (let j = 0; j < order.length; ++j) {
            let key = order[j]
            let press = () => {
                if (ctx.state == "suspended") {
                    ctx.resume()
                }
                let osc = ctx.createOscillator()
                osc.connect(gain)
                osc.frequency.value = note_hz_value[key.replace(/\/.*/, '')] * (2 ** i)
                osc.type = key_type
                held_keys[key + (i + 1)] = osc
                osc.start()
            }
            let release = () => {
                try {
                    held_keys[key + (i + 1)].stop()
                    held_keys[key + (i + 1)].disconnect()
                } catch (e) {console.error(e) }
            }
            keys.push(<rect key={key + (i + 1)} fill={!key.includes("/") ? "white" : "black"} stroke={"black"} width={15} height={37} x={10.5 * (counter)} onMouseDown={press} onMouseUp={release} onMouseLeave={release} />)
            counter++
        }
    }
    return <div>
        <h1>{audio.name}</h1>
        <button type="button" className="btn btn-sm btn-primary" onClick={r} ref={playRef}>Play</button>
        <input title="volume" type="range" step={.05} max={1} min={0} onChange={e => gain.gain.value = volume = e.target.valueAsNumber} defaultValue={volume}/>
        <input type="file" title="Input" onChange={async (e) => {
            let file_data = await e.target.files![0].text()
            e.target.value = ''
            console.log(file_data.split('\n'))
            set_audio(parser(file_data))
        }}/>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => {
            let modal = new Modal(modalRef.current!)
            modal.show()
        }} >File Upload Docs</button>
        <div style={{paddingTop: "20px"}}>
            <svg width={900} height={50}>
                {keys}
            </svg>
        </div>
        <div>
            <p>Left Click on the keyboard or press on your pc keyboard to play</p>
        </div>
        
        <div className="modal fade" id="docsModal" ref={modalRef} tabIndex={-1} aria-labelledby="docsModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title" id="docsModalLabel">Music File Docs</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {docs.split('\n').map((v, i) => <p key={i}>{v}<br/></p>)}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

utils.render(page)
