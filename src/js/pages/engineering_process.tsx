import "css/engineering_process.scss"
import utils from "../utils";
import blank from "assets/EDP/0204/MC EDP Circle Diagram.png"
import {array} from "wolf_utils/utils.js"
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useState } from "react";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Property } from "csstype";

// Data of a dropped item
interface DropItem {
    id: number,
    title: string,
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
    top: number,
    left: number,
    width?: number
    height?: number,
}

let DragObject = ({item}: DragObjectProps) => {
    let [, drag] = useDrag(() => ({
        type: "_",
        item: item,
        collect: (monitor) => {
            
        }
    }))

    return <div ref={drag}>
        <p style={{ fontSize: "20px", fontWeight: "700" }}>{item.title}</p>
        <p>{item.msg}</p>
    </div>
}

let DropArea = ({top, left, width, height, callbacks}: DropAreaProps) => {
    let [last_drop, set_last_drop] = useState<DropItem>()
    let [mark, set_mark] = useState<Property.Color>("aqua")
    height = height || 150
    width = width || 150

    let [{hover}, drop] = useDrop(() => ({
        accept: ["_"],
        drop: (item, monitor) => {
            if (monitor.didDrop()) {
                return
            }
            console.log(item, monitor)
            set_last_drop(item as DropItem)
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

    return <div ref={drop} style={{backgroundColor: hover ? 'rgba(0,0,0,.4)' : 'transparent', top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`, borderColor: mark}}>
        <p style={{fontSize: "20px", fontWeight: "700"}}>{last_drop?.title || ''}</p>
        <div>
            <p style={{fontSize: "16px"}}>{last_drop?.msg || ""}</p>
        </div>
    </div>
}


let setup: {
    drop_points: {
        top: number,
        left: number,
        height?: number,
        width?: number,
    }[],
    items: DropItem[]
    } = {
        drop_points: [
            {
                left: 295,
                top: 25,
            },
            {
                top: 135,
                left: 525
            },
            {
                top: 370,
                left: 570
            },
            {
                top: 565,
                left: 425
            },
            {
                top: 565,
                left: 175
            },
            {
                top: 370,
                left: 30
            },
            {
                top: 135,
                left: 75
            }
        ],
        items: [
            {
                id: 0,
                title: "Ask",
                msg: "Identify the needs and constraints"
            },
            {
                id: 1,
                title: "Research",
                msg: "Discover the problem and relevant information"
            },
            {
                id: 2,
                title: "Imagine",
                msg: "Develop possible solutions"
            },
            {
                id: 3,
                title: "Plan",
                msg: "Select a promising solution"
            },
            {
                id: 4,
                title: "Create",
                msg: "Build a prototype"
            },
            {
                id: 5,
                title: "Test",
                msg: "Test and evaluate the prototype"
            },
            {
                id: 6,
                title: "Analyze",
                msg: "Document and analyze the results"
            }
        ]
}

array.shuffle(setup.items)

let DesignPuzzle = () => {
    let [msg, _set_msg] = useState("")
    let [msg_color, set_msg_color] = useState<'red' | 'green'>('red')

    let resets: (() => any)[] = []

    let cur_items: {[key: number]: {item: (() => DropItem | undefined), set_mark: (color: Property.Color) => any}} = {}
    let drop_points: React.JSX.Element[] = setup.drop_points.map((v, i) =>
        <DropArea top={v.top} left={v.left} height={v.height} width={v.width} key={i} 
        callbacks={({get_last_drop, reset, set_mark}) => {
            resets.push(reset)
            cur_items[i] = {item: get_last_drop, set_mark}
        }}
        />
    )
    let items: React.JSX.Element[] = setup.items.map((v, i) => 
        <DragObject item={v} key={v.id} />
    )

    let check = () => {
        for (let i in cur_items) {
            let {item: _item, set_mark} = cur_items[i]
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
        <div style={{width: "100%"}}><p style={{textAlign: 'center'}}>The engineering design process is a process used build and optimize projects</p></div>
        <div className="container">
            <div className="puzzle">
                {drop_points}
                <img src={blank} height={750} width={750} alt="" />
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
                <p style={{ color: msg_color }}>{msg}</p>
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
