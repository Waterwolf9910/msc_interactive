/**
 * Use this file to inject js into the entire project
 */

import {Buffer} from "buffer/"

import utils from "./utils"

(() => {
    __webpack_public_path__ = location.href
    for (let page_info of utils.page_list) {
        __webpack_public_path__ = __webpack_public_path__.replace(page_info.section, '')
    }
})()

if (module.hot) {
    module.hot.accept()
}

window.Buffer = Buffer
