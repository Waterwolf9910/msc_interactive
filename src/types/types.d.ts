declare let str: string
declare let base64_url: string

declare type jsonable = string | number | boolean | Record<string, any> | jsonable[]
declare type jsonable_obj = { [key: string]: jsonable } 

declare module "*.txt" {
    export default str
}

declare module "*.music" {
    export default str
}

declare module "*.ico" {
    export default base64_url
}

declare module "*.svg" {
    export default base64_url
}

declare module "*.bmp" {
    export default base64_url
}

declare module "*.png" {
    export default base64_url
}

declare module "*.jpeg" {
    export default base64_url
}

declare module "*.gif" {
    export default base64_url
}

declare module "*.webp" {
    export default base64_url
}

declare module "*.scss" {
    export default interface styles {
        [key: string]: string
    }
}
