declare module "*.txt" {
    let str: string
    export default str;
}

declare module "*.scss" {
    export default interface styles {
        [key: string]: string
    }
}
