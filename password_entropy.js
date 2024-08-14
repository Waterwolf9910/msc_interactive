
require("buffer")
let fs = require("fs")

let wordlist = fs.readFileSync("./src/assets/Cyber/10-million-password-list-top-1000000.txt", "utf-8").split('\n')

let num_of_possible_chars = (password) => {
    let last_char = ''
    let last_char_count = 0
    let repeat_count = 0
    let has_upper = false
    let has_lower = false
    let has_digits = false
    let has_specials = false

    for (let char of password) {
        let index = Buffer.from(char)[ 0 ]
        if (last_char == char) {
            ++last_char_count
            if (last_char_count > 2) {
                ++repeat_count
            }
        }
        last_char = char
        if ((index >= 21 && index <= 0x2f) || (index >= 0x3a && index <= 0x40) || (index >= 0x5b && index <= 0x60) || (index >= 0x7b && index <= 0x7e)) {
            has_specials = true
            continue
        }
        if (index >= 0x30 && index <= 0x39) {
            has_digits = true
            continue
        }
        if (index >= 0x41 && index <= 0x5a) {
            has_upper = true
            continue
        }
        if (index >= 0x61 && index <= 0x7a) {
            has_lower = true
            continue
        }
        throw new Error("Invalid Char found")
    }

    return {
        repeat_count,
        has_upper,
        has_lower,
        has_digits,
        has_specials,
        possible_chars: (has_upper ? 26 : 0) + (has_lower ? 26 : 0) + (has_digits ? 9 : 0) + (has_specials ? 34 : 0)
    }
} 

/**
 * 
 * @param {string} password 
 * @returns 
 */
let calc_pwd_entropy = (password) => {

    let info = num_of_possible_chars(password)

    // Equation from https://www.linkedin.com/pulse/math-based-approach-password-strength-walt-powell-cissp-cism
    let entropy = Math.log2(info.possible_chars) * password.length

    let _rc = info.repeat_count
    while (_rc > 0) {
        entropy -= 2.3 // My own removal
        --_rc
    }

    for (let pwd of wordlist) {
        if (password.includes(pwd)) {
            entropy -= 7 // My own removal
        }
    }

    return entropy
}

/**
 * 1 -> weak
 * 2 -> normal
 * 3 -> strong
 * 4 -> very strong
 * @param {number} entropy 
 * @returns strength in terms on a number
 */
let strength = (entropy) => {
    if (entropy < 40) {
        return 1
    }
    if (entropy < 60) {
        return 2
    }
    if (entropy < 80) {
        return 3
    }
    
    return 4
}

let strength_to_str = i => i == 1 ? "very weak" : i == 2 ? "weak" : i == 3 ? "strong" : "very strong"

//TODO: FIX
let time = (seconds) => {
    let _min = seconds / 60
    let _h = _min / 60
    let _da = _h / 24
    let _w = _da / 7
    let _mo = _w / 4.35
    let _y = _mo / 12
    let _de = _y / 10
    let _c = _de / 10
    
    let s = Math.floor(seconds)
    let min = Math.floor(seconds / 60)
    let h = Math.floor(_min / 60)
    let da = Math.floor(_h / 24)
    let w = Math.floor(_da / 7)
    let mo = Math.floor(_w / 4.35)
    let y = Math.floor(_mo / 12)
    let de = Math.floor(_y / 10)
    let c = Math.floor(_de / 10)
    let mil = Math.floor(_c / 10)
    if (c > 10) {
        return `${mil} millenia, ${c - (mil * 10)} centuries, ${de - (c * 10)} decades, ${y - (de * 10)} years, ${mo - (y * 12)} months, ${w - (mo * 4.35)} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (de > 10) {
        return `${c} centuries, ${de - (c * 10)} decades, ${y - (de * 10)} years, ${mo - (y * 12)} months, ${w - (mo * 4.35)} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (y > 10) {
        return `${de} decades, ${y - (de * 10)} years, ${mo - (y * 12)} months, ${w - (mo * 4.35)} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (mo > 12) {
        return `${y} years, ${mo - (y * 12)} months, ${w - (mo * 4.35)} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (w > 4.35) {
        return `${mo} months, ${w - (mo * 4.35)} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (da > 7) {
        return `${w} weeks, ${da - (w * 7)} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (h > 24) {
        return `${da} days, ${h - (da * 24)} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (min > 60) {
        return `${h} hours, ${min - (h * 60)} minutes, and ${s - (min * 60)} seconds`
    } else if (s > 60) {
        return `${min} minutes and ${s - (min * 60)} seconds`
    }
    return `${s} seconds`
    // return {s: s - min, min: min - h, h: h - da, da: da - w, w: w - mo, mo: mo - y, y: y - de, de: de - c, c: c - mil, mil}
}

let rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
})

let timeout = 5*60

rl.question("Password> ", (password) => {
    if (!password) {
        return
    }
    let info = num_of_possible_chars(password)
    let combinations = info.possible_chars**password.length
    // https://www.betterbuys.com/estimating-password-cracking-times/
    // year 2022
    let kps = 17042497.3
    let seconds = combinations/kps
    let entropy = calc_pwd_entropy(password)
    console.log("Password Entropy", entropy)
    console.log("Password is:", strength_to_str(strength(entropy)))
    console.log("It will take a maximum of", time(seconds), "to crack this password without using dictionary cracking")
    console.log("Simulating cracking a password via bruteforcing and simple dictionary")
    console.log("Timeout", time(timeout))

    
    let start = Date.now()
    let range = []
    if (info.has_upper) {
        range.push(...String.fromCharCode(...Array(26).fill(0).map((v, i) => 0x41 + i)).split(''))
    }
    if (info.has_lower) {
        range.push(...String.fromCharCode(...Array(26).fill(0).map((v, i) => 0x61 + i)).split(''))
    }
    if (info.has_digits) {
        range.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    }
    if (info.has_specials) {
        range
    }
    let cur_pwd = Array(password.length).fill(0x61)
    let index = cur_pwd.length - 1
    let rindex = 0
    let wordlist_index = 0
    let found = false
    let _time = Date.now()
    while (_time - start < timeout * 1000) {
        _time = Date.now()
        if (wordlist_index < wordlist.length) {
            if (password == wordlist[wordlist_index]) {
                found = true
                break
            }
            ++wordlist_index
        }
        if (String.fromCharCode(...cur_pwd) == password) {
            found = true
            break
        }
        if (rindex >= range.length) {
            rindex = 0
            ++index
            
            cur_pwd[index - 1] = range[0]
        }
        cur_pwd[index] = range[rindex]
        ++rindex
    }

    if (found) {
        console.log("Password found in", time((_time - start) / 1000))
    } else {
        console.log("Cracking Timed Out")
    }

    process.exit(0)
})
