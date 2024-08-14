import "css/drone_asm.scss"
import {DndProvider, useDrag, useDrop} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {TouchBackend} from "react-dnd-touch-backend"
import drone_base from "assets/DTE/drone.png"
import utils from "../utils"
import blue_cube from "assets/blue_cube.png"
import { useState } from "react"
import motor_img from "bootstrap-icons/icons/arrow-up-square-fill.svg"
import turn_arrow from "bootstrap-icons/icons/arrow-return-right.svg"

enum ItemType {
    motor = 'motor',
    lift_arrow = 'lift_arrow',
    turn_arrow = 'turn_arrow'
}

interface DropItem {
    flipped?: boolean,
    display: DisplayData
}

interface DragObjectProps {
    type: ItemType,
    item: DropItem
    // display: DisplayData
}

interface DropObjectProps {
    on_drop?: (item: DropItem, type: string) => any,
    callbacks?: (cbs: {
        get_last_drop: () => DropItem | undefined,
        get_last_drop_type: () => ItemType | undefined,
        reset: () => any
    }) => any
    top: number,
    left: number,
    width?: number
    height?: number,
}

interface DisplayData {
    name?: string
    width?: number,
    height?: number,
    flip_v?: boolean,
    flip_h?: boolean,
    rotate?: number
    top?: number,
    left?: number,
    img?: string,
    invert?: number,
    background?: string
}

// The item to drag
let DragObject = ({ type, item }: DragObjectProps) => {
    let {display} = item
    let [{}, drag] = useDrag(() => ({
        type: type,
        item: item,
        collect: (monitor) => ({
        })
    }))
    

    return <div ref={drag}>
        <img src={display.img} alt="" style={{ transform: `rotate(${display.rotate ?? 0}deg) scale(${display.flip_h ? -1 : 1}, ${display.flip_v ? -1 : 1})`, top: `${display.top}px`, left: `${display.left}px`, width: `${display.width ?? 32}px`, height: `${display.height ?? 32}px`, filter: `invert(${display.invert ?? 0})`, background: display.background }} />
        {/* <p>Hello</p> */}
    </div>
}

// The area to drop an item
let DropArea = ({on_drop, top, left, width = 40, height = 40, callbacks}: DropObjectProps) => {
    let [last_drop, set_last_drop] = useState<DropItem>()
    let [last_drop_type, set_last_drop_type] = useState<ItemType>()
    // let last_drop_type

    let [{hover}, drop] = useDrop(() => ({
        accept: Object.values(ItemType),
        // accept: Object.values(dragable_types),
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return
            }
            set_last_drop(item as DropItem)
            set_last_drop_type(monitor.getItemType() as ItemType)
            if (on_drop) {
                on_drop(item as DropItem, monitor.getItemType() as string)
            }
            return item
        },
        collect: (monitor) => {
            return {
                hover: monitor.isOver({shallow: true}),
            }
        },
    }))

    if (callbacks) {
        callbacks({
            get_last_drop: () => {
                return last_drop
            },
            reset: () => {
                set_last_drop(undefined)
            },
            get_last_drop_type: () => {
                return last_drop_type
            }
        })
    }

    return <p ref={drop} style={{backgroundColor: hover ? 'rgba(0,0,0,.4)' : 'transparent', width: `${width}px`, height: `${height}px`, top: `${top}%`, left: `${left}%`}}>
        {last_drop ? <img src={last_drop.display.img ?? blue_cube} alt="" style={{ transform: `rotate(${last_drop.display.rotate ?? 0}deg) scale(${last_drop.display.flip_h ? -1 : 1}, ${last_drop.display.flip_v ? -1 : 1})`, top: `${last_drop.display.top}px`, left: `${last_drop.display.left}px`, width: `${last_drop.display.width ?? 32}px`, height: `${last_drop.display.height ?? 32}px`, position: 'relative', filter: `invert(${last_drop.display.invert ?? 0})`, background: last_drop.display.background}} /> : ''}
    </p>
}

let setup: {
    drop_points: {
        top: number,
        left: number,
        correct_type: ItemType,
        height?: number,
        width?: number,
    }[],
    items: {
        // display: DisplayData
        type: ItemType,
        data: DropItem,
    }[]
} = {
    drop_points: [
        //#region Turn Arrows
        {
            top: 0,
            left: 15,
            height: 130,
            width: 210,
            correct_type: ItemType.turn_arrow
        },
        {
            top: 38,
            left: 0,
            height: 153,
            width: 240,
            correct_type: ItemType.turn_arrow
        },
        {
            top: 20,
            left: 62,
            width: 170,
            height: 130,
            correct_type: ItemType.turn_arrow
        },
        {
            top: 55,
            left: 55,
            width: 200,
            height: 150,
            correct_type: ItemType.turn_arrow
        },
        //#endregion Turn Arrows
        //#region Motors
        {
            top: 13,
            left: 37,
            correct_type: ItemType.motor
        },
        {
            top: 51,
            left: 24,
            correct_type: ItemType.motor
        },
        {
            top: 30,
            left: 76,
            correct_type: ItemType.motor
        },
        {
            top: 69,
            left: 72,
            correct_type: ItemType.motor
        },
        //#endregion Motors
    ],
    items: [
        {
            data: {
                display: {
                    name: "Prop Rotation",
                    img: turn_arrow,
                    invert: 1,
                    background: 'rgb(255,255,255)'
                }
            },
            type: ItemType.turn_arrow,
        },
        {
            data: {
                flipped: true,
                display: {
                    img: turn_arrow,
                    invert: 1,
                    flip_h: true,
                    background: 'rgb(255,255,255)'
                }
            },
            type: ItemType.turn_arrow,
        },
        {
            data: {
                display: {
                    name: "Motor",
                    invert: 0,
                    img: motor_img,
                    background: 'rgb(255,255,255)'
                }
            },
            type: ItemType.motor
        }
    ]
}

let Drone = () => {
    let [msg, _set_msg] = useState("")
    let [msg_color, set_msg_color] = useState<'red' | 'green'>("red")
    let items: JSX.Element[] = setup.items.map((v, i) => <>
        <span>{v.data.display.name}</span>
        <DragObject item={v.data ?? {display: {img: blue_cube}}} type={v.type} />
    </>)
    let drop_points = setup.drop_points.map((v, i) => <DropArea
        left={v.left}
        top={v.top}
        height={v.height}
        width={v.width}
        // on_drop={console.log}
        key={`point.${i}`}
        callbacks={(cbs) => {
            resets.push(cbs.reset)
            checks[`point_${i}`] ={
                getItem: () => [cbs.get_last_drop_type(), cbs.get_last_drop()],
                point_data: v
            }
        }}
        />
    )
    let resets: (() => any)[] = []
    let checks: { [key: string]: { point_data: typeof setup['drop_points'][0], getItem: () => [ItemType | undefined, DropItem | undefined]}} = {}
    
    // TODO: Error message on each incorrect 
    let check = () => {
        let set_msg = (msg: string = "Success", correct: boolean = false) => {
            _set_msg(msg)
            set_msg_color(correct ? "green" : 'red')
        }
        let flipped: number = 0
        for (let check of Object.values(checks)) {
            let item = check.getItem()
            if (item[0] == undefined) {
                return set_msg("A zone is missing it's item")
            }
            if (check.point_data.correct_type != item[0]) {
                return set_msg(`There is an incorrect ${item[0]} placement`)
            }

            if (item[1]?.flipped) {
                flipped++
            }
        }

        if (flipped != 2) {
            return set_msg("Too many props going in the same direction")
        }
        set_msg("Success!", true)
    }

    return <div>
        <div className="container">
            <div className="drone">
                {drop_points}
                {/* <DropObject on_drop={console.log} /> */}
                <img src={drone_base} alt="" />
            </div>
            <div className="item_container">
                <p>Drag the items below to their appropriate spot, then click check answer</p>
                <div>
                    {items}
                </div>
                <div>
                    <button onClick={() => resets.forEach(r => r())}>Reset</button>
                    <button onClick={check}>Check Answer</button>
                </div>
                <p style={{color: msg_color}}>{msg}</p>
                {/* <DragObject item={{}} type={ItemType.turn_arrow} /> */}
            </div>
        </div>
    </div>
}

let page = () => {
    return <DndProvider backend={utils.isMobile ? TouchBackend : HTML5Backend} options={{}}>
        <Drone />
    </DndProvider>
}

utils.render(page)
