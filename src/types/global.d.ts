
declare global {
    interface Window {
        Buffer: typeof import("buffer/").Buffer
    }
    type Buffer = import("buffer/").Buffer
    let Buffer: typeof import("buffer/").Buffer
}

export {}
