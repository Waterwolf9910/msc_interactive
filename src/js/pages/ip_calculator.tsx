
import "css/ipcalc.scss"
import utils from "../utils"
import { useRef, useState } from "react"

let page = () => {
    let subnetRef = useRef<HTMLInputElement>(null)
    let addressRef = useRef<HTMLInputElement>(null)
    let [calc, set_calc] = useState<{u_range: string, hosts: number, u_host: number, class: 'a' | 'b' | 'c' | 'd' | 'e'} | null>()

    return <div>
        <div className="input-group">
            <span id="address-label">IP Address</span>
            <input aria-labelledby="address-label" ref={addressRef} onInput={(e) => {e.currentTarget.value = e.currentTarget.value.replace(/[^.0-9]/g, '')}} defaultValue={"10.0.0.1"}/>
            <span id="subnet-label">Network Subnet</span>
            <input aria-labelledby="subnet-label" ref={subnetRef} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^.0-9]/g, '') }} defaultValue={"255.255.255.0"} />
            <input type="button" value={"Calculate"} onClick={() => {
                let id = parseInt(addressRef.current!.value.split('.')[0]);
                let subnet = Number('0b' + subnetRef.current!.value
                    .split(".")
                    .map(v => parseInt(v).toString(2).padStart(8, "0")).join(''))
                let clazz: Exclude<typeof calc, null | undefined>["class"]
                if (id < 128) {
                    clazz = "a"
                } else if (id < 192) {
                    clazz = "b"
                } else if (id < 224) {
                    clazz = "c"
                } else if (id < 240) {
                    clazz = "d"
                } else {
                    clazz = "e"
                }
                set_calc({
                    class: clazz,
                    hosts: (~subnet + 1) >>> 0,
                    u_host: (~subnet - 1) >>> 0,
                    u_range: "TODO"
                })
            }}/>
        </div>
        {(calc) ? <div>
            {/* <p>Usable Range: {calc.u_range}</p> */}
            <p># of Hosts: {calc.hosts}</p>
            <p># of Usable Hosts: {calc.u_host}</p>
            <p>Network Class: {calc.class.toUpperCase()}</p>
        </div> : <></>}
        <div>
            <br />
            <p>Enter a address and Network Subnet</p>
            <p>Network class is retrieved from the first part of address</p>
            <p>Number of hosts and usable host is calculated from the bits of subnet</p>
        </div>
    </div>
}

utils.render(page)
