declare module "*.txt" {
    let str: string
    export default str
}

declare module "*.ico" {
    let url: string
    export default url
}

declare module "*.png" {
    let url: string
    export default url
}

declare module "*.jpeg" {
    let url: string
    export default url
}

declare module "*.gif" {
    let url: string
    export default url
}

declare module "*.webp" {
    let url: string
    export default url
}

declare module "*.scss" {
    export default interface styles {
        [key: string]: string
    }
}
