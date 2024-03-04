import utils from "../utils";

let alphabet_table = Array(26).fill(0).map((_, i) => String.fromCharCode(0x61 + i))
let table = Array(26).fill(0)
    .map((_, i) => [...alphabet_table])

    utils.render(
    <div className="col center_items">
        <p>Test</p>
    </div>
)
