import profile from "assets/AFS/0102/airwolf_profile_wire_transparent.png";
import top from "assets/AFS/0102/airwolf_top_wire_transparent.png";
import arrow from "bootstrap-icons/icons/arrow-up.svg";
import "css/airplane_parts.scss";
import { Property } from "csstype";
import { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { array } from "wolf_utils/utils.js";
import utils from "../utils";

// Data of a dropped item
interface DropItem {
    id: number,
    msg: string
}

interface DragObjectProps {
    item: DropItem
}

interface DropAreaProps {
    callbacks?: (cbs: {
        get_last_drop: () => DropItem | undefined,
        set_mark: (color: Property.Color) => any,
        reset: () => any
    }) => any
    on_drop?: (item: DropItem, id: number) => any
    id: number
    top: number,
    left: number,
    width?: number
    height?: number,
    rotate?: number
}

let DragObject = ({ item }: DragObjectProps) => {
    let [, drag] = useDrag(() => ({
        type: "_",
        item: item,
        collect: (monitor) => {

        }
    }))

    return <div ref={drag}>
        <p>{item.msg}</p>
    </div>
}

let DropArea = ({ id, top, left, width, height, rotate, callbacks, on_drop }: DropAreaProps) => {
    let [last_drop, set_last_drop] = useState<DropItem>()
    let [mark, set_mark] = useState<Property.Color>("aqua")
    height ||= 150
    width ||= 150
    on_drop ??= () => {}

    let [{ hover }, drop] = useDrop(() => ({
        accept: ["_"],
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return
            }
            console.log(item, monitor)
            set_last_drop(item as DropItem)
            on_drop!(item as DropItem, id)
            return item
        },
        collect: (monitor) => ({
            hover: monitor.isOver()
        })
    }))

    if (callbacks) {
        callbacks({
            get_last_drop: () => last_drop,
            reset: () => {
                set_last_drop(undefined)
                set_mark('aqua')
            },
            set_mark
        })
    }

    return <div ref={drop} style={{ backgroundColor: hover ? 'rgba(0,0,0,.4)' : 'transparent', top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`, borderColor: mark, rotate: `${rotate ?? 0}deg`, zIndex: 10 }}>
        {/* <div>
            <p style={{ fontSize: "16px", color: 'black' }}>{last_drop?.msg || ""}</p>
        </div> */}
    </div>
}


let setup: {
    drop_points: {
        top: number,
        left: number,
        height?: number,
        width?: number,
        rotate?: number,
    }[],
    arrows: {
        top: number,
        left: number,
        height?: number,
        align?: "start" | "end" | "center",
        rotate?: number
    }[],
    items: DropItem[]
} = {
    drop_points: [
        { // Prop
            top: 135,
            left: 0,
            height: 40,
            width: 40
        },
        { // Empennage
            top: 110,
            left: 350,
            width: 200,
            height: 90,
            // rotate: 30
        },
        { // Rudder
            top: 45,
            left: 490,
            width: 110,
            height: 30,
            rotate: -75
        },
        { // Fuselage
            top: 75,
            left: 130,
            width: 225,
            height: 120,
            rotate: 0
        },
        { // Vertical Stablizer
            top: 30,
            left: 440,
            width: 120,
            height: 46,
            rotate: -75
        },
        { // Engine
            top: 140,
            left: 50,
            width: 90,
            height: 60
        },
        { // Canopy
            top: 485,
            left: 240,
            width: 100,
            height: 40,
            rotate: 35
        },
        { // Wing
            top: 540,
            left: 175,
            width: 130,
            height: 70,
            rotate: -55
        },
        { // Aileron
            top: 375,
            left: 315,
            width: 90,
            height: 75,
            rotate: -55
        },
        { // Elevator
            top: 560,
            left: 340,
            width: 150,
            height: 50,
            rotate: -55
        },
        { // Flap
            top: 435,
            left: 285,
            width: 60,
            height: 65,
            rotate: -55
        },
    ],
    arrows: [
        { // Prop
            top: 30,
            left: 0,
            rotate: -150,
            align: "start",
            // height: 40,
        },
        { // Empennage
            top: 200,
            left: 395,
            align: "start",
            // height: 60,
            rotate: 0
        },
        { // Rudder
            top: 30,
            left: 560,
            align: "start",
            // height: 30,
            rotate: -40
        },
        { // Fuselage
            top: 200,
            left: 200,
            // height: 60,
            rotate: 0
        },
        { // Vertical Stablizer
            top: 0,
            left: 240,
            // height: 60,
            rotate: 90
        },
        { // Engine
            top: 200,
            left: 0,
            // height: 60
        },
        { // Canopy
            top: 340,
            left: 175,
            rotate: -180,
            height: 80
            // height: 40,
        },
        { // Wing
            top: 500,
            left: -25,
            rotate: 105
        },
        { // Aileron
            top: 400,
            left: 400,
            rotate: -90
            // height: 75,
        },
        { // Horizontal Stablizer & Elevator
            top: 560,
            left: 445,
            rotate: -90
            // height: 50,
        },
        { // Flap
            top: 460,
            left: 345,
            rotate: -90
            // height: 65,
        },
    ],
    items: [
        {
            id: 0,
            msg: "Propeller"
        },
        {
            id: 1,
            msg: "Empennage"
        },
        {
            id: 2,
            msg: "Rudder"
        },
        {
            id: 3,
            msg: "Fuselage"
        },
        {
            id: 4,
            msg: "Vertical Stablizer"
        },
        {
            id: 5,
            msg: "Engine"
        },
        {
            id: 6,
            msg: "Canopy"
        },
        {
            id: 7,
            msg: "Wing"
        },
        {
            id: 8,
            msg: "Aileron"
        },
        {
            id: 9,
            msg: "Horizontal Stablizer & Elevator"
        },
        {
            id: 10,
            msg: "Flap"
        },
    ]
}

array.shuffle(setup.items)

let DesignPuzzle = () => {
    
    let resets: (() => any)[] = []
    let refs: { [id: number]: ReturnType<typeof useRef<HTMLParagraphElement | null>> } = {}

    let cur_items: { [key: number]: { item: (() => DropItem | undefined), set_mark: (color: Property.Color) => any } } = {}
    let drop_points: React.JSX.Element[] = setup.drop_points.map((v, i) =>
        <DropArea id={i} top={v.top} left={v.left} height={v.height} width={v.width} rotate={v.rotate} key={i}
            callbacks={({ get_last_drop, reset, set_mark }) => {
                resets.push(reset)
                cur_items[i] = { item: get_last_drop, set_mark }
            }}
            on_drop={(item, id) => {
                refs[id].current!.innerText = item.msg
            }}
        />
    )
    let arrows: React.JSX.Element[] = setup.arrows.map(v => ({...v, rotate: v.rotate ?? 0})).map((v, i) => {
        let side = (v.rotate > -135 && v.rotate < -45) || (v.rotate > 45 && v.rotate < 135)
        let ref = useRef<HTMLParagraphElement>(null)
        let text = <p style={{ textAlign: !side ? 'center' : (v.rotate > 45 && v.rotate < 135) ? 'end' : 'start' }} ref={ref}></p>
        refs[i] = ref
        if (v.rotate == 90) {
            console.log(side)
        }
        return <div key={i} className={`arrow_container ${side ? 'side' : ''}`} style={{ left: `${v.left}px`, top: `${v.top}px`, border: 'none', alignItems: v.align ?? 'center', zIndex: 20 }}>
            {v.rotate < -135 || v.rotate > 45 ? text : ''}
            <img className="info_arrow" src={arrow} style={{height: `${v.height || 60}px`, rotate: `${v.rotate}deg`}} alt=""/>
            {v.rotate >= -135 && v.rotate <= 45 ? text : ''}
        </div>
    })
    let items: React.JSX.Element[] = setup.items.map((v) =>
        <DragObject item={v} key={v.id} />
    )

    let check = () => {
        for (let i in cur_items) {
            let { item: _item, set_mark } = cur_items[i]
            let item = _item()
            if (item == undefined) {
                set_mark('aqua')
                continue
            }
            if (i != `${item.id}`) {
                set_mark('red')
                continue
            }
            set_mark('green')
        }
    }

    return <div>
        <div className="container">
            <div className="puzzle">
                {drop_points}
                {arrows}
                {/* <img src={arrow} alt="" style={{position: "absolute"}} /> */}
                <img src={profile} alt="" />
                <img src={top} height={300} width={300} style={{position: 'relative', left: '180px', top: '130px'}} alt="" />
            </div>
            <div className="item_container">
                <div>
                    <p>Drag and Drop the boxes below then press Check Answer</p>
                </div>
                <div>
                    {items}
                </div>
                <div>
                    <button onClick={() => resets.forEach(r => r())}>Reset</button>
                    <button onClick={check}>Check Answer</button>
                </div>
            </div>
        </div>
    </div>
}

let page = () => {
    return <div>
        <DndProvider backend={utils.isMobile ? TouchBackend : HTML5Backend}>
            <DesignPuzzle />
        </DndProvider>
    </div>
}

utils.render(page)

