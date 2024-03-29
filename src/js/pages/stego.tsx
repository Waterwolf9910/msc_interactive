import "css/stego.scss"
import test_img_src from "assets/black_blue.bmp"
import Description from "js/components/stego_desc"
import utils from "../utils"
import { useEffect, useRef, useState } from "react"
import { Popover, Tooltip } from "bootstrap"
import {bmpParser as parser, bmpWritter as writter, parsed_bmp, xyToIndex} from 'wolf_utils/bmp_parser.js'

let map: {[key: number]: {limit: number, mask: number}} = {
    1: {
        limit: 7,
        mask: 0b0000001
    },
    2: {
        limit: 6,
        mask: 0b0000011
    },
    3: {
        limit: 5,
        mask: 0b0000111
    },
    4: {
        limit: 4,
        mask: 0b0001111
    },
    5: {
        limit: 3,
        mask: 0b0011111
    },
    6: {
        limit: 2,
        mask: 0b0111111
    },
    7: {
        limit: 1,
        mask: 0b1111111
    }
}

let test_img = await (await (await fetch(test_img_src)).blob()).arrayBuffer()
let page = () => {
    let [img_data, _sid] = useState<parsed_bmp>(parser(test_img))
    let [new_pixel, _snpd] = useState<parsed_bmp['pixel_data']>({...img_data.pixel_data})
    let [allowed_bpp, _set_bpp] = useState(7)
    let tooltip_holder: { [key: string]: Tooltip } = {}
    let messageRef = useRef<HTMLInputElement>(null)

    let image: React.JSX.Element | '' = ''
    let preview_img: React.JSX.Element | '' = ''

    let clearTooltips = () => {
        for (let key in tooltip_holder) {
            tooltip_holder[key].dispose()
        }

    }
    let sid = (val: typeof img_data) => {
        clearTooltips()
        _sid(val)
    }

    let snpd = (val: typeof new_pixel) => {
        clearTooltips()
        _snpd(val)
    }

    let set_bpp = (val: typeof allowed_bpp) => {
        clearTooltips()
        _set_bpp(val)
    }

    // When a user uploads, take the image (if given) and parse it
    let on_upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files![0]
        if (!file) {
            return
        }
        let img: parsed_bmp

        let show_error = (msg: string) => {
            let _ = new Popover(document.getElementById("upload")!, {
                title: "Error!",
                content: msg,
                sanitize: false,
                placement: "bottom",
                trigger: "focus"
            })
            _.show()
            return _
        }

        try {
            img = parser(await file.arrayBuffer())
        } catch (err) {
            show_error("Invalid Bitmap Image")
            console.error(err)
            return
        }

        // Limit Color Depth to 24
        if (img.header.color_depth != 24) {
            show_error(`Bitmap Color Depth Must Be 24 (RGB888)\nReceived ${img.header.color_depth}`)
            return
        }

        if (img.header.height > 32 || img.header.width > 32) {
            show_error(`Image Size Must Be Less Then 32x32\nReceived ${img.header.width}x${img.header.height}`)
            return
        }

        sid(img)
        snpd({...img.pixel_data})
    }

    let on_click = (event: React.MouseEvent<HTMLTableCellElement>, x: number, y: number) => {
        let val = event.currentTarget.dataset.active
        event.currentTarget.dataset.active = val == 'true' ? 'false' : 'true'
        event.currentTarget.dataset.tooltip_open = 'true'
        //@ts-ignore
        Array(...document.querySelectorAll<'td'>('td[data-tooltip_open=true]'))
            .filter(v => v.id != event.currentTarget.id)
            .map(v => ({ e: v, h: tooltip_holder[v.id] }))
            .forEach(v => { v.h.hide(); v.e.dataset.tooltip_open = 'false'; v.e.dataset.active ? v.e.dataset.active = 'false' : '' })
    }

    let on_input = (message: string) => {
        // let message = event.target.value

        let buf: import("buffer/").Buffer = writter(img_data)
        // Start writting our data at the first pixel within the bitmap
        let _offset = img_data.file_header.data_offset
        let offset = img_data.file_header.data_offset

        let write = (asciiRep: number, bits_left = 7) => {
            if (bits_left <= 0) {
                return
            }

            // Shift the bits that will not be added to the beginning
            let new_val = asciiRep >> (bits_left < allowed_bpp ? bits_left : allowed_bpp)

            // Add our bit into the red byte of the pixel
            buf[offset + 2] |= asciiRep & map[allowed_bpp].mask
            offset += 3 // Go to the beginning of the next pixel

            // Reiterate until all bits are written
            write(new_val, bits_left - allowed_bpp)
        }

        let rebuild = ''
        let shifts: number[] = []
        let calcShifts = (bl = 7) => { // Calculate our shifts for decoding
            if (bl <= 0) {
                return
            }
            if (allowed_bpp < 3) {
                shifts.push(shifts.length * allowed_bpp)
            } else {
                let shift = shifts.reduce((prev, cur) => prev + cur, 0) + (bl < allowed_bpp ? bl : allowed_bpp)
                shifts.unshift(shift)
            }
            calcShifts(bl - allowed_bpp)
        }
        calcShifts()
        if (allowed_bpp > 2) {
            shifts = [0, ...shifts.slice(1).reverse()]
        }

        let read = (read_amt: number, i = 0) => {
            if (i == shifts.length) {
                return 0
            }

            // Mask out the invalid bits from the the byte then shift our bits to the correct position
            let new_bit: number = (buf[_offset + 2] & map[allowed_bpp].mask) << shifts[i]
            _offset += 3

            // OR each bytes together 
            return new_bit | read(read_amt + allowed_bpp, i + 1)
        }

        for (let val of message) {
            write(val.charCodeAt(0))
        }

        while (_offset < offset) {
            rebuild += String.fromCharCode(read(0))
        }

        if (rebuild != message) {
            console.log("Error within readding", rebuild, message)
        }
        snpd(parser(buf).pixel_data)
    }

    useEffect(() => {
        if (messageRef.current!.value) {
            on_input(messageRef.current!.value)
        }
    }, [allowed_bpp])

    if (img_data) {
        let x_index: number[] = []
        let y_index: number[] = []
        let addTooltip: React.JSX.Element[] = []
        for (let x = 0; x < img_data.header.width; ++x) {
            x_index.push(x)
        }
        for (let y = 0; y < img_data.header.height; ++y) {
            y_index.push(y)
        }
        image = <table>
            <thead>
                <tr>
                    <th scope="col"> </th>
                    {x_index.map(x => <th scope="col" key={x}>{x+1}</th>)}
                </tr>
            </thead>
            <tbody>
                {y_index.map(y => <tr key={"y"+y} data-last={y_index.at(-1) == y}>
                    <th scope="row">{y+1}</th>
                    {x_index.map(x => {
                        let i = xyToIndex(x, y, img_data.header.width, img_data.header.height)
                        let colors = img_data!.pixel_data[i]
                        let at = <td key={i + 'a'} id={i + 'a'} onClick={e => on_click(e, x, y)} style={{ background: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})`, borderColor: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})` }}></td>
                        addTooltip.push(at)
                        return at
                    })}
                </tr>)}
            </tbody>
            <tfoot>
                <tr><th colSpan={img_data.header.height+1}>Pixel Count: {img_data.length}</th></tr>
            </tfoot>
        </table>
        preview_img = <table id='preview'>
            <thead>
                <tr>
                    <th scope="col"> </th>
                    {x_index.map(x => <th scope="col" key={x}>{x + 1}</th>)}
                </tr>
            </thead>
            <tbody>
                {y_index.map(y => <tr key={"y" + y} data-last={y_index.at(-1) == y}>
                    <th scope="row">{y + 1}</th>
                    {x_index.map(x => {
                        let i = xyToIndex(x, y, img_data.header.width, img_data.header.height)
                        let colors = new_pixel![i]
                        let elem = <td key={i} id={i} onClick={e => on_click(e, x, y)} style={{ background: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})`, borderColor: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})` }} />
                        addTooltip.push(elem)
                        return elem
                    })}
                </tr>)}
            </tbody>
            <tfoot>
                <tr><th colSpan={img_data.header.height + 1}>Pixel Count: {img_data.length}</th></tr>
            </tfoot>
        </table>
        setTimeout(() => {
            let base_options: Partial<Tooltip.Options> = {
                sanitize: false,
                fallbackPlacements: ['right', 'top', 'bottom', 'left'],
                html: true,
                customClass: "tooltip-custom",
                placement: 'left',
                container: document.getElementById('preview')!,
                trigger: 'click'
            }
            for (let {key} of addTooltip) {
                let inital = img_data.pixel_data[key!.replace(/a$/, '')]
                let preview = new_pixel[key!.replace(/a$/, '')]
                    tooltip_holder[key!] = new Tooltip(document.getElementById(key!)!, {
                    ...base_options,
                    title: `<div style="display: flex;align-items: center;"><div style="background-color: rgba(${[inital.r]}, ${inital.g}, ${inital.b}, ${inital.a});width: 15px;height: 15px;display: inline-block;"></div>[inital] color: rgba(${inital.r}, ${inital.g}, ${inital.b}, ${inital.a})</div><div style="display: flex;align-items: center;"><div style="background-color: rgba(${preview.r}, ${preview.g}, ${preview.b}, ${preview.a});width: 15px;height: 15px;display: inline-block;"></div>[preview] color: rgba(${preview.r}, ${preview.g}, ${preview.b}, ${preview.a})</div>`,
                })
            }
        });
    }
    
    return <div className="col center_items">
        <input id="upload" type="file" title="Upload" accept="image/bmp, image/x-bmp" onChange={on_upload}/>
        <div className="row imgs">
            {image}
            {preview_img}
        </div>
        <div className="row">
            <label htmlFor="message">Enter Message</label>
            <input type="text" id="message" onChange={e => on_input(e.target.value)} ref={messageRef} maxLength={Math.floor(img_data.length / map[allowed_bpp].limit)}/>
        </div>
        <div className="row">
            <label htmlFor="bits_allowed_per_pixel">Allowed Bits</label>
            <input id="bits_allowed_per_pixel" type="range" min={1} max={7} defaultValue={7} onChange={e => set_bpp(e.target.valueAsNumber)}/>
        </div>
        <Description />
    </div>
}

utils.render(page)
