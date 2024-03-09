import "./css/header.scss"
import utils from "../utils"
import logo from "assets/logo.ico"

export default () => {
    let baseUrl = new URL(__webpack_public_path__)
    let p = location.href.replace(baseUrl.href, '')
    // TODO: Add dropdown for subdirectory pages
    return <nav className="nav nav-pills header">
        <a className="navbar-brand" href={__webpack_public_path__}>
            <img src={logo} alt="Logo" height={30} width={30} /> Insert Name Here
        </a>
        {/* <p>{new URL(__webpack_public_path__).href}</p> */}
        {utils.page_list.map(({name, section}) => {
            return <a key={name} className={"nav-item nav-link" + (p == section ? ' active disabled' : '')} href={new URL(section, baseUrl).href}>{name}</a>
            // return <a key={name} className="nav-link" href={new URL(section, baseUrl).href}><input type="button" value={name} className="btn btn-sm btn-info"></input></a>
        })}
    </nav>
}
