import "css/stego.scss"
import test_img_src from "assets/black_blue.bmp"
import Description from "js/components/stego_desc"
import utils from "../utils"
import { useEffect, useRef, useState } from "react"
import { Popover, Tooltip } from "bootstrap"
import {bmpParser as parser, bmpWritter as writter, parsed_bmp, xyToIndex} from 'wolf_utils/bmp_parser.js'

let map: { [key: number]: { limit: number, mask: number, length_multi: number }} = {
    1: {
        limit: 7,
        mask: 0b0000001,
        length_multi: 7
    },
    2: {
        limit: 6,
        mask: 0b0000011,
        length_multi: 4
    },
    3: {
        limit: 5,
        mask: 0b0000111,
        length_multi: 3
    },
    4: {
        limit: 4,
        mask: 0b0001111,
        length_multi: 2
    },
    5: {
        limit: 3,
        mask: 0b0011111,
        length_multi: 2
    },
    6: {
        limit: 2,
        mask: 0b0111111,
        length_multi: 2
    },
    7: {
        limit: 1,
        mask: 0b1111111,
        length_multi: 1
    }
}

let test_img = await (await (await fetch(test_img_src)).blob()).arrayBuffer()
//@ts-ignore
window.img = test_img
let page = () => {
    let [img_data, _set_img_data] = useState<parsed_bmp>(parser(test_img))
    let [new_pixel, _set_new_pixel] = useState<parsed_bmp['pixel_data']>({...img_data.pixel_data})
    let [allowed_bpp, _set_bpp] = useState(7)
    let [decode, _set_decode] = useState(false)

    let tooltip_holder: { [key: string]: Tooltip } = {}
    let messageRef = useRef<HTMLInputElement>(null)

    let image: React.JSX.Element | '' = ''
    let preview_img: React.JSX.Element | '' = ''
    let encoded_magic = "SI" // (S)tego (I)mage

    let clearTooltips = () => {
        for (let key in tooltip_holder) {
            tooltip_holder[key].dispose()
        }
        tooltip_holder = {}

    }

    let set_img_data = (val: typeof img_data) => {
        clearTooltips()
        _set_img_data(val)
    }

    let set_new_pixel = (val: typeof new_pixel) => {
        clearTooltips()
        _set_new_pixel(val)
    }

    let set_bpp = (val: typeof allowed_bpp) => {
        clearTooltips()
        _set_bpp(val)
    }

    let set_decode = (val: typeof decode) => {
        clearTooltips()
        _set_decode(val)
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

        set_img_data(img)
        set_new_pixel({...img.pixel_data})
    }

    let on_click = (event: React.MouseEvent<HTMLTableCellElement>) => {
        let val = event.currentTarget.dataset.active
        event.currentTarget.dataset.active = val == 'true' ? 'false' : 'true'
        event.currentTarget.dataset.tooltip_open = 'true'
        //@ts-ignore
        Array(...document.querySelectorAll<'td'>('td[data-tooltip_open=true]'))
            .filter(v => v.id != event.currentTarget.id)
            .map(v => ({ e: v, h: tooltip_holder[v.id] }))
            .forEach(v => { v.h.hide(); v.e.dataset.tooltip_open = 'false'; v.e.dataset.active ? v.e.dataset.active = 'false' : '' })
    }

    let on_input = (event: React.ChangeEvent<HTMLInputElement>) => {
        set_new_pixel(encode_message(event.target.value).pixel_data)
    }

    let encode_message = (message: string) => {
        // let message = event.target.value

        let buf = writter(img_data)
        // Start writting our data at the first pixel within the bitmap
        let offset = img_data.file_header.data_offset

        let write = (num_to_encode: number, bits_left = 7) => {
            if (bits_left <= 0) {
                return
            }

            // Shift the bits that will not be added to the beginning
            let new_val = num_to_encode >> (bits_left < allowed_bpp ? bits_left : allowed_bpp)

            // Add our bit into the red byte of the pixel
            buf[offset + 2] = (buf[offset + 2] & ~map[allowed_bpp].mask) | num_to_encode & map[allowed_bpp].mask
            offset += 3 // Go to the beginning of the next pixel

            // Reiterate until all bits are written
            write(new_val, bits_left - allowed_bpp)
        }

        buf[offset + 2] = (buf[offset + 2] & ~7) | allowed_bpp
        offset += 3
        for (let val of encoded_magic) {
            write(val.charCodeAt(0))
        }
        let length = (message.length) * 3 * map[allowed_bpp].length_multi
        write(length & 0b1111111) // Length Bottom 7
        write(length >> 7) // Length Top 7
        for (let val of message) {
            write(val.charCodeAt(0))
        }

        let new_img = parser(buf)

        let decoded = decode_message(new_img)
        if (decoded != message) {
            console.log("Error within readding", message, decoded, allowed_bpp, map[allowed_bpp])
        }

        return new_img
    }

    let decode_message = (img: parsed_bmp) => {
        let offset = img.file_header.data_offset
        let rebuild = ''
        let shifts: number[] = [0]
        let buf = writter(img)

        let calcShifts = (bl = 7) => { // Calculate our shifts for decoding
            if (bl <= 0) {
                return
            }
            if (_allowed_bpp < 3) {
                shifts.push(shifts.length * _allowed_bpp)
            } else {
                let shift = shifts.reduce((prev, cur) => prev + cur, 0) + (bl < _allowed_bpp ? bl : _allowed_bpp)
                shifts.unshift(shift)
            }
            calcShifts(bl - _allowed_bpp)
        }

        let read = (read_amt: number, i = 0): number => {
            if (i == shifts.length) {
                return 0
            }

            // Mask out the invalid bits from the the byte then shift our bits to the correct position
            let new_bit: number = (buf[offset + 2] & map[_allowed_bpp].mask) << shifts[i]
            offset += 3

            // OR each bytes together 
            return new_bit | read(read_amt + _allowed_bpp, i + 1)
        }

        let _allowed_bpp = 7
        _allowed_bpp = read(0) & 7

        if (_allowed_bpp == 0) {
            return ''// Invalid bpp
        }
         
        shifts = []
        calcShifts()

        if (_allowed_bpp > 2) {
            shifts = [0, ...shifts.slice(1).reverse()]
        }

        let magic = [read(0), read(0)]
        if (String.fromCharCode(...magic) != encoded_magic) {
            return ''// Not a image from us
        }
        let length = read(0) | (read(0) << 7)
        let _offset = offset
        while (offset < (_offset + length)) {
            rebuild += String.fromCharCode(read(0))
        }

        return rebuild
    }


    useEffect(() => {
        if (!decode && messageRef.current!.value) {
            set_new_pixel(encode_message(messageRef.current!.value).pixel_data)
        }
        if (decode) {
            messageRef.current!.value = decode_message(img_data)
        }
    }, [allowed_bpp, decode, img_data])

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
                        let at = <td key={i + 'a'} id={i + 'a'} onClick={on_click} style={{ background: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})`, borderColor: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})` }}></td>
                        addTooltip.push(at)
                        return at
                    })}
                </tr>)}
            </tbody>
            <tfoot>
                <tr><th colSpan={img_data.header.height+1}>Pixel Count: {img_data.length}</th></tr>
            </tfoot>
        </table>
        preview_img = decode ? '' : <table id='preview'>
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
                        let elem = <td key={i} id={i} onClick={on_click} style={{ background: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})`, borderColor: `rgba(${colors.r}, ${colors.g}, ${colors.b}, ${colors.a || 255})` }} />
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
                container: document.getElementById('images')!,
                trigger: 'click'
            }
            for (let {key} of addTooltip) {
                let inital = img_data.pixel_data[key!.replace(/a$/, '')]
                let preview = new_pixel[key!.replace(/a$/, '')]
                let inital_name = '#' + inital.hex_encoded.substring(2) // `rgba(${inital.r}, ${inital.g}, ${inital.b}, ${inital.a})`
                let preview_name = '#' + preview.hex_encoded.substring(2) // `rgba(${inital.r}, ${inital.g}, ${inital.b}, ${inital.a})`
                tooltip_holder[key!] = new Tooltip(document.getElementById(key!)!, {
                    ...base_options,
                    title: `<div style="display: flex;align-items: center;"><div style="background-color: rgba(${[inital.r]}, ${inital.g}, ${inital.b}, ${inital.a});min-width: 15px;min-height: 15px;display: inline-block;"></div>[inital] color: ${inital_name}</div><div style="display: flex;align-items: center;"><div style="background-color: rgba(${preview.r}, ${preview.g}, ${preview.b}, ${preview.a});min-width: 15px;min-height: 15px;display: inline-block;"></div>[preview] color: ${preview_name}</div>`,
                })
            }
        });
    }
    
    return <div className="col center_items">
        <div id="images" className="row imgs">
            {image}
            {preview_img}
        </div>
        <input id="upload" className="form-control" type="file" title="Upload" style={{ width: "80%" }} accept="image/bmp, image/x-bmp" onChange={on_upload} />
        <div className="row input-group">
            <span id="message_label" className="input-group-text">{decode ? "Result" : "Enter Message"}</span>
            <input type="text" id="message" aria-labelledby="message_label" className="form-control" onChange={on_input} ref={messageRef} maxLength={Math.floor(img_data.length / map[allowed_bpp].limit) - (2 * map[allowed_bpp].limit) - 6} readOnly={decode}/>
        </div>
        <div className="row input-group">
            <span id="bits_allowed_per_pixel_label" className="input-group-text">Allowed Bits</span>
            <input id="bits_allowed_per_pixel" className="form-control" aria-labelledby="bits_allowed_per_pixel_label" type="range" min={1} max={7} defaultValue={7} onChange={e => set_bpp(e.target.valueAsNumber)} disabled={decode}/>
        </div>
        <div className="row button-group">
            <span id="mode_label" className="input-group-text">Image Mode</span>
            <input id="mode" type="button" className="btn btn-info" aria-labelledby="mode_label" value={decode ? "Decode" : "Encode"} onClick={e => {
                set_img_data({ ...img_data, pixel_data: new_pixel })
                set_decode(!decode)
            }} />
        </div>
        <div className="row button-group">
            <span id="download_label" className="input-group-text">Download</span>
            <input type="button" id="download" className="btn btn-success" aria-labelledby="download_label" onClick={e => {
                let a = document.createElement('a')
                a.href = 'data:imgage/bmp;base64,' + writter({...img_data, pixel_data: new_pixel}).toString("base64")
                a.setAttribute("download", "download.bmp")
                a.click()
            }} disabled={decode} />
        </div>
        <Description />
    </div>
}

utils.render(page)
