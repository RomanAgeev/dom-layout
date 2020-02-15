export enum LayoutDirection {
    Horizontal,
    Vertical
}

export class LayoutItem {
    constructor(
        readonly direction: LayoutDirection,
        readonly color: string | null,
        readonly weight: number = 1) {
    }

    readonly children: LayoutItem[] = [];
}