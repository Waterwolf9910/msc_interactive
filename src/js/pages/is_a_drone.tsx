import "css/is_a_drone.scss"
import utils from "../utils"
import drone1 from "assets/DTE/0102/Drone1.png"
import drone2 from "assets/DTE/0102/Drone2.png"
import drone3 from "assets/DTE/0102/Drone3.png"
import drone4 from "assets/DTE/0102/Drone4.png"
import drone5 from "assets/DTE/0102/Drone5.jpeg"
import drone6 from "assets/DTE/0102/Drone6.png"
import explanations from "assets/DTE/0102/explainations.json"
import { useRef, useState } from "react"
import { Tooltip } from "bootstrap"

let tooltips: Tooltip[] = []
tooltips.length = 6

let page = () => {
    let default_text = "Click a image to get information about the object"
    let [index, set_index] = useState(-1)

    let on_click = (e: React.MouseEvent<HTMLImageElement>) => {
        let new_index = parseInt(e.currentTarget.dataset.index!)
        if (isNaN(new_index) || new_index > explanations.length) {
            return
        }
        
        if (tooltips[index]) {
            tooltips[index].hide()
        }

        if (index == new_index) {
            return set_index(-1)
        }

        if (!tooltips[new_index]) {
            tooltips[new_index] = new Tooltip(e.currentTarget, {
                trigger: 'manual',
                placement: "auto",
                offset: [0, -128 + 72],
                title: (new_index == 2 || new_index == 5) ? "NO!" : "YES!"
            })
        }
        tooltips[new_index].setContent({ ".tooltip-inner": explanations[new_index] })
        tooltips[new_index].show()

        set_index(new_index)
    }

    return <div>
        <table className="drone_table">
            <tbody>
                <tr>
                    <td>
                        <div data-index={0} onClick={on_click}>
                            <p style={{display: index == 0 ? "block" : "none"}}>YES!</p>
                            <img src={drone1} alt="" />
                        </div>
                    </td>
                    <td>
                        <div data-index={1} onClick={on_click}>
                            <p style={{ display: index == 1 ? "block" : "none" }}>YES!</p>
                            <img src={drone2} alt="" />
                        </div>
                    </td>
                    <td>
                        <div data-index={2} onClick={on_click}>
                            <p style={{ display: index == 2 ? "block" : "none" }}>NO!</p>
                            <img src={drone3} alt="" />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div data-index={3} onClick={on_click}>
                            <p style={{ display: index == 3 ? "block" : "none" }}>YES!</p>
                            <img src={drone4} alt="" />
                        </div>
                    </td>
                        <div data-index={4} onClick={on_click}>
                            <p style={{ display: index == 4 ? "block" : "none" }}>YES!</p>
                            <img src={drone5} alt="" />
                        </div>
                    <td>
                        <div data-index={5} onClick={on_click}>
                            <p style={{ display: index == 5 ? "block" : "none" }}>NO!</p>
                            <img src={drone6} alt="" />
                        </div>
                    </td>
                </tr>
            </tbody>
            {/* <tfoot>
                <tr>
                    <td colSpan={3}>{index == -1 ? default_text : explanations[index]}</td>
                </tr>
            </tfoot> */}
        </table>
        <p style={{textAlign: 'center'}}>Click on a image to see if it is a drone or not</p>
    </div>
}

utils.render(page)
