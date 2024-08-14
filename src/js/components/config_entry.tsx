import react, { useRef } from 'react'
import "./css/config.scss"
import trash from "bootstrap-icons/icons/trash3-fill.svg"
import plus from "bootstrap-icons/icons/plus-lg.svg"

/**
 * Path to element
 */
type customizer_funcs = {
    from?: (path: string, value: jsonable) => jsonable,
    to?: (path: string, value: jsonable) => jsonable,
    allowed_types?: (path: string) => string[],
    allowed_names?: (path: string) => string[],
    getEnums?: (path: string) => string[] | null
}

interface entry_props {
    config_key: string,
    value: jsonable,
    config_path?: string,
    no_key_in_path?: boolean
    customizer?: customizer_funcs,
    on_change?: (path: string, value: jsonable) => any,
    /**
     * @internal
     * @private
     */
    on_delete?: (config_key: string) => any
}

interface obj_props extends entry_props {
    value: Record<string, any> | jsonable[]
}


// let getEnums = (path: string): string[] | null => {
//     return null
// }

let NestEntry = ({config_key, value, config_path, on_change, on_delete, customizer}: obj_props) => {
    let default_values = {
        string: 'hello world',
        number: 42,
        boolean: true,
        array: [],
        object: {},
        null: null
    }
    let [add_type, set_add_type] = react.useState<keyof typeof default_values>('null')
    let [add_name, set_obj_name] = react.useState('')
    let [add_value, set_add_value] = react.useState<any>()
    let [_value, _set_value] = react.useState(value)
    let add_type_ref = useRef<HTMLSelectElement>(null)
    let add_name_ref = useRef<HTMLSelectElement | HTMLInputElement>(null)
    let add_value_ref = useRef<HTMLSelectElement | HTMLInputElement>(null)
    if (!Object.is(value, _value)) { // TODO: Better check then this
        _set_value(value)
    }
    customizer ??= {}
    customizer.from ??= (_, val) => val
    customizer.to ??= (_, val) => val
    
    let set_value = (v: typeof value) => {
        if (on_change) {
            on_change(config_path!, v)
        }
        _set_value(v)
        set_add_type('null')
        set_add_value(null)
        set_obj_name('')
        if (add_type_ref.current) {
            add_type_ref.current.value = 'null'
        }
        if (add_name_ref.current) {
            add_name_ref.current!.value = ''
        }
        if (add_value_ref.current) {
            add_value_ref.current!.value = ''
        }
    }

    let _on_delete = (config_key: string) => {
        if (value instanceof Array) {
            set_value(value.map((_, i) => `${i}` != config_key.replace("Item ", '')))
            return
        }
        delete value[config_key]
        set_value({...value})
    }

    let elements: React.JSX.Element[] = []
    let modal_name = `${config_path!.replace(/Item ([0-9]+)/g, '$1')}_add-modal`
    if (_value instanceof Array) {
        for (let index in _value) {
            elements.push(<li className='list-group-item' key={`Item ${index}`}>
                <Entry config_path={config_path} config_key={`Item ${index}`} value={
                    customizer.from(index, _value[index])
                } on_change={on_change} customizer={customizer} on_delete={_on_delete} />
            </li>
            )
        }
    } else {
        for (let key in _value) {
            elements.push(<li className='list-group-item' key={key}>
                <Entry config_path={config_path} config_key={key} value={
                    customizer.from(key, _value[key])
                } on_change={on_change} customizer={customizer} on_delete={_on_delete}/>
            </li>
            )
        }
    }

    return <div className="card">
        <div className="card-header row" style={{ justifyContent: 'space-between' }}>
            {config_key}
            <div className='row' style={{alignItems: "center"}}>
                {/** TODO: Finish Duplicate Button */}
                {/* {/Item [0-9]+/.test(config_key!) ? <p title='Duplicate Element' style={{paddingRight: '10px', cursor: 'pointer', margin: 0}} onClick={(e) => {
                    .push(value[parseInt(config_key.replace("Item ", ''))])
                    set_value(value)
                }}>&</p> : <></>} */}
                <img src={trash} onClick={() => {
                    on_delete ? on_delete(config_key) : ''
                }} style={{ filter: 'invert(1)', cursor: 'pointer', paddingRight: '10px', height: '16px' }}></img>
                <img src={plus} data-bs-toggle="modal" data-bs-target={`#${modal_name}`} style={{ cursor: 'pointer', margin: 0, height: '16px', filter: 'invert(1)' }} />
            </div>
        </div>
        <div className="modal fade" id={modal_name} data-bs-backdrop="static" tabIndex={-1} aria-hidden>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title" title={config_path}>Add to {config_key}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">x</button>
                    </div>
                    <div className="modal-body col center-items">
                        {!(_value instanceof Array) ? <div className='input-group form-check'>
                            <span className='input-group-text' id={`${config_path}_obj-name_label`}>name</span>
                            {(() => {
                                let names = customizer.allowed_names ? customizer.allowed_names(config_path!) : []
                                return names.length > 0 ? <select className='form-select' aria-describedby={`${config_path}_obj-name_label`} onChange={(e) => {
                                    set_obj_name(e.target.value)
                                //@ts-ignore
                                }} ref={add_name_ref}>
                                    <option value={''} label='Select a name' />
                                    {names.map(name => <option key={name} value={name} label={name} />)}
                                </select> : <input
                                    className='form-control'
                                    aria-describedby={`${config_path}_obj-name_label`}
                                    style={{ flexGrow: 1 }}
                                    defaultValue={add_name}
                                    onChange={(e) => set_obj_name(e.target.value)}
                                    //@ts-ignore
                                    ref={add_name_ref}
                                />
                            })()}
                        </div> : ''}
                        <div className='input-group form-check'>
                            <span className='input-group-text' id={`${config_path}_type_label`}>type</span>
                            <select className='form-select' defaultValue={"null"} aria-labelledby={`${config_path}_type_label`} onChange={(e) => {
                                set_add_type(e.target.value as 'string')
                                set_add_value(default_values[e.target.value as 'string'])
                            }} ref={add_type_ref}>
                                <option value={'null'} label='Select a type' />
                                {(() => {
                                    let types = customizer.allowed_types ? customizer.allowed_types(config_path!) : []
                                    return (types.length > 0 ? types : ['string', 'number', 'boolean', 'array', 'object']).map(type => <option key={type} value={type} label={type} />)
                                })()}
                            </select>
                        </div>
                        {add_type == 'number' || add_type == "string" || add_type == 'boolean' ? <div className='input-group form-check'>
                            <span className='input-group-text' id={`${config_path}_value_label`}>value</span>
                            {add_type == 'string' ? (() => {
                                let valid_values = customizer.getEnums ? customizer.getEnums(config_path! + `.${add_name}`) : []
                                if ((valid_values || []).length > 0) {
                                    if (add_value == default_values['string']) {set_add_value(valid_values![0])}
                                    return <select className='form-select' title={config_key} defaultValue={valid_values![0]} onChange={(e) => set_add_value(e.target.value)}
                                    //@ts-ignore
                                    ref={add_value_ref}>
                                        {valid_values!.map(v => <option label={v} value={v} key={v}></option>)}
                                    </select>
                                }
                                return <input
                                    type='text'
                                    minLength={1}
                                    aria-describedby={`${config_path}_value_label`}
                                    style={{ flexGrow: 1 }}
                                    defaultValue={add_value}
                                    className='form-control'
                                    onChange={(e) => set_add_value(e.target.value)}
                                    //@ts-ignore
                                    ref={add_value_ref}
                                />}
                            )() : add_type == "boolean" ?
                                <button
                                    type="button"
                                    className={`form-control btn btn-${add_value ? "success" : "danger"}`}
                                    aria-describedby={`${config_path}_value_label`}
                                    defaultChecked={add_value}
                                    title={add_value.toString()}
                                    onClick={() => set_add_value(!add_value)}
                                    //@ts-ignore
                                    ref={add_value_ref}>
                                    {add_value ? "Enabled" : "Disabled"}
                                </button> : <input
                                    className='form-control'
                                    minLength={1}
                                    type={'number'}
                                    defaultValue={add_value}
                                    style={{ flexGrow: 1 }}
                                    onChange={(e) => set_add_value(e.target.value)}
                                    //@ts-ignore
                                    ref={add_value_ref}
                                />}
                        </div> : ''}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button"
                            className="btn btn-primary"
                            disabled={add_type == 'null' || (add_name == '' && !(_value instanceof Array))}
                            data-bs-dismiss="modal"
                            onClick={() => {
                                let v = _value
                                if (v instanceof Array) {
                                    v.push(add_value)
                                } else {
                                    v[add_name] = add_value
                                }
                                set_value(v)
                            }}
                        >Add</button>
                    </div>
                </div>
            </div>
        </div>
        <ul className="list-group">
            {elements}
        </ul>
    </div>
}

const Entry = ({config_key, value, config_path, no_key_in_path, on_change, on_delete, customizer}: entry_props) => {
    let value_element: React.JSX.Element | React.JSX.Element[]
    let entry_type
    let [internal_value, _set_value] = react.useState(value)
    if (!config_path) {
        config_path = no_key_in_path ? '' : config_key
    } else {
        config_path = config_path + '.' + config_key
    }
    if (!Object.is(value, internal_value)) { // TODO: Better check then this
        _set_value(value)
    }
    customizer ??= {}
    customizer.from ??= (_, val) => val
    customizer.to ??= (_, val) => val
    customizer.getEnums ??= (_) => null

    let set_value = (value: jsonable) => {
        if (on_change) {
            on_change(config_path!, value);
        }
        _set_value(value)
    }

    if (typeof internal_value == 'object') {
        value_element = <NestEntry config_path={config_path} config_key={config_key} value={internal_value} on_change={on_change} customizer={customizer} on_delete={on_delete}/>
    } else {
        let customized = customizer.from(config_path, internal_value) as Exclude<jsonable, Record<string, any> | any[]>
        entry_type = typeof customized
        switch (typeof customized) {
            case "string": {
                let valid_values = customizer.getEnums(config_path)
                if (valid_values) {
                    value_element = <select className='form-select' title={config_key} defaultValue={customized} onChange={e => set_value(e.target.value)}> 
                        {valid_values.map(v => <option
                            value={customizer!.to!(config_path!, internal_value) as number}
                            label={v}
                            key={`${config_path}_${v}`}
                         />)}
                    </select>
                } else {
                    value_element = <input
                        type='text'
                        className='form-control'
                        aria-describedby={config_key + "_" + entry_type}
                        style={{flexGrow: 1}}
                        defaultValue={customized}
                        onChange={(e) => set_value(e.target.value)}
                    />
                }
                break
            }
            case "number":
                value_element = <input
                    style={{ flexGrow: 1 }}
                    type="number"
                    className="form-control"
                    aria-describedby={config_key + "_" + entry_type}
                    defaultValue={customized}
                    onChange={(e) => set_value(e.target.valueAsNumber)}
                />
                break
            case "boolean": {
                value_element = <button 
                    type="button" 
                    className={`form-control btn btn-${internal_value ? "success" : "danger"}`}
                    aria-describedby={config_key + "_" + entry_type}
                    defaultChecked={customized}
                    title={internal_value.toString()}
                    onClick={() => set_value(!internal_value)}>
                    {internal_value ? "Enabled" : "Disabled"}
                </button>
                break
            }
            default: {
                value_element = <>Error</>
            }
        }
    }

    let prefix: JSX.Element = <></>
    if (entry_type == 'string') {
        prefix = <span id={config_key + "_" + entry_type} className="input-group-text">{config_key}</span>
    } else if (entry_type == 'boolean' || entry_type == 'number') {
        prefix = <span style={entry_type == 'boolean' ? {flexGrow: 5} : {}} id={config_key + "_" + entry_type} className="input-group-text">{config_key}</span>
    }

    return <div className="entry">
            {prefix}
            {value_element}
            { typeof value != 'object' ? <span id={config_key + '_' + entry_type} className='input-group-text'>
                <img src={trash} onClick={() => {
                    on_delete ? on_delete(config_key) : ''
                }} style={{ filter: 'invert(1)', cursor: 'pointer' }}></img>
            </span> : '' }
        {/* {config_key ? <pre>{config_key == ' ' ? '' : indenter(config_key, indent) + ":"} </pre> : ''} */}
    </div>
}

export default Entry
