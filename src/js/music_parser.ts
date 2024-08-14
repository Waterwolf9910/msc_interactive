
export const note_hz_value = {
    c: 32.703195662574829, // C1
    "c#": 34.647828872119012, // C#/Db1
    db: 34.647828872109012, // C#/Db1
    d: 36.708095989675945, // D1
    "d#": 38.890872965260113, // D#/Eb1
    eb: 38.890872965260113, // D#/Eb1
    e: 41.203444614108741, // E1
    f: 43.653528929125485, // F1
    "f#": 46.249302838954299, // F#/Gb1
    gb: 46.249302838954299, // F#/Gb1
    g: 48.999429497718661, // G1
    "g#": 51.913087197493142, // G#/Ab1
    ab: 51.913087197493142, // G#/Ab1
    a: 55.000000000000000, // A1
    "a#": 58.270470189761239, // A#/Bb1
    bb: 58.270470189761239, // A#/Bb1
    b: 61.735412657015513, // B1,
    r: 0
}

type track_type = { values: { [key: number]: number }, type: 'sine' | 'sawtooth' | 'square' | 'triangle' }

// Allowed 0 values -> A-B, Last 8 value: C
export const parser = (val: string, separator = ',', delimiter = '.') => {
    const lines = val.split("\n");
    if (separator == ' ' || delimiter == " ") {
        throw new Error("Invalid Separator or Delimiter");
    }
    let bpm = 0
    let version = ''
    let name = 'Song'
    if (lines[lines.length - 1] == "") {
        lines.pop();
    }
    let tracks: { [key: number]: track_type } = {}

    // utils values
    let length_map = {
        w: 0,
        h: 0,
        q: 0,
        e: 0,
        s: 0,
        t: 0,
        dw: 0,
        dh: 0,
        dq: 0,
        de: 0,
        ds: 0,
    }
    let line_count = 1

    // Parse the file line by line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].replace(/ /g, '');
        if (i == 0) {
            let _version = /Version:([0-9.]+)/.exec(line)?.[1]
            if (!_version) {
                throw new Error("Invalid Version");
            }
            version = _version
            continue
        }
        let _bpm = /BPM:([0-9]+)/i.exec(line)?.[1]
        if (i == 1) {
            bpm = parseFloat(_bpm ?? '')
            if (isNaN(bpm) || bpm < 1) {
                throw new Error("Invalid BPM")
            }
            length_map.q = (60 * 1000) / bpm
            length_map.h = length_map.q*2
            length_map.w = length_map.q*4
            length_map.e = length_map.q/2
            length_map.s = length_map.q/4
            length_map.t = length_map.q/8
            length_map.dw = length_map.w + length_map.h
            length_map.dh = length_map.h + length_map.q
            length_map.dq = length_map.q + length_map.e
            length_map.de = length_map.e + length_map.s
            length_map.ds = length_map.s + length_map.t
            continue
        }
        if (i == lines.length - 1 && /Name:/i.test(line)) {
            name = lines[i].replace(/Name: ?/i, '')
            break
        }

        if (line.startsWith("#") || line.length < 1) {
            continue;
        }

        let line_info = /([0-9]+)?(sine|square|triangle|sawtooth):/i.exec(line)
        let start_beat = parseInt(line_info?.[1] ?? '0')
        let wave_type = line_info?.[2]?.toLowerCase()

        if (isNaN(start_beat) || start_beat < 0) {
            throw new Error(`Invalid Start Position on line: ${i+1}`)
        }
        if (!wave_type) {
            throw new Error(`Invalid Wave Type on line: ${i+1}`)
        }
        // Valid notes will be less than 6 chars
        let note_line = line.replace(/.*:/, '')
        if (parseFloat(version) >= 1.1) {
            note_line = note_line.replace(/\|/g, '')
        }
        const note_groups = note_line.toLowerCase().split(separator)
        // let track_start = (60*1000*start_beat)/bpm
        let track: track_type = {
            type: wave_type! as 'sine',
            values: {}
        }
        let next_note_offset = ((60 * 1000) / bpm) * start_beat
        for (let note_info of note_groups) {
            if (note_info.length < 1) {
                continue
            }
            if (note_info.length > 6) {
                throw new Error(`Invalid group: ${note_info} on line: ${i+1}`)
            }
            let pos = 0
            let note = note_info[pos++] + (/[#b]/.test(note_info[pos]) ? note_info[pos++] : '')
            let octave = note != 'r' ? parseInt(note_info[pos++]) : undefined
            let length = note_info.split(delimiter)[1]

            if (!/[a-gr][#b]?/.test(note) || note == 'b#' || note == 'cb' || note == 'e#' || note == 'fb') {
                throw new Error(`Invalid note: ${note} on line ${i+1}`)
            }

            if ((octave == undefined || isNaN(octave)) && note != 'r') {
                throw new Error(`Invalid Octave: ${octave} in note ${note} on line ${i+1}`)
            }

            if (octave == 0 || ((octave == 1 || octave == 8) && /ab[#b]?/.test(note))) {
                throw new Error(`Invalid Note Range: ${note} on line ${i+1}`)
            } else if (octave != 0) {
                octave!--
            }

            if (!/d?[whqest]/.test(length)) {
                throw new Error(`Invalid Note Type: ${length} on line ${i+1}`)
            }

            if (note == "r") {
                track.values[next_note_offset] = 0
                next_note_offset = next_note_offset + length_map[length]
                continue
            }
            track.values[next_note_offset] = note_hz_value[note] * (2 ** octave!)
            next_note_offset = next_note_offset + length_map[length]
        }
        track.values[length_map.t + next_note_offset] = 0
        tracks[line_count++] = track
        // console.log(start_beat, wave_type, line)
    }
    // console.log(name, bpm, lines)
    return {
        name,
        version,
        bpm,
        tracks,
        length_map
    }
}
