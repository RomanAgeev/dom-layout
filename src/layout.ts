import { identity, constant } from "./utils";

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

export class Layout {
    constructor(
        readonly container: HTMLElement,
        readonly root: LayoutItem) {

        this._itemOver = this._itemOver.bind(this);
        this._itemOut = this._itemOut.bind(this);
        this._itemClick = this._itemClick.bind(this);

        this.container.addEventListener("mouseover", this._itemOver);
        this.container.addEventListener("mouseout", this._itemOut);
        this.container.addEventListener("click", this._itemClick);
    }

    private readonly _domToLayout = new Map<HTMLElement, LayoutItem>();

    build(): void {
        this._buildItem(this.root, this.container);
    }

    private _buildItem(item: LayoutItem, placeholder: HTMLElement): void {
        if (!item.children || item.children.length === 0) {
            placeholder.style.background = item.color;
            return;
        }
    
        const sum = item.children.reduce((acc, child) => acc + child.weight, 0);
    
        let getLeft: (start: number) => number;
        let getTop: (start: number) => number;
        let getWidth: (size: number) => number;
        let getHeight: (size: number) => number;
        if (item.direction === LayoutDirection.Horizontal) {
            getLeft = identity;
            getTop = constant(0);
            getWidth = identity;
            getHeight = constant(100);
        } else {
            getLeft = constant(0);
            getTop = identity;
            getWidth = constant(100);
            getHeight = identity;
        }
    
        let start = 0;
        for (const child of item.children) {
            const size = child.weight / sum * 100;
    
            const element = document.createElement("div");
            element.style.position = "absolute";
            element.style.left = getLeft(start) + "%";
            element.style.top = getTop(start) + "%";
            element.style.width = getWidth(size) + "%";
            element.style.height = getHeight(size) + "%";
            placeholder.appendChild(element);

            this._domToLayout.set(element, child);
    
            start += size;
    
            this._buildItem(child, element);
        }
    }

    private _itemOver(e: Event): void {
        (e.target as HTMLElement).style.border = "5px solid black"
        e.preventDefault();
    }

    private _itemOut(e: Event): void {
        (e.target as HTMLElement).style.border = "";
        e.preventDefault();
    }

    private _itemClick(e: Event): void {
        const item = this._domToLayout.get(e.target as HTMLElement);
        if (!item) {
            return;
        }

        alert(item.color);
    }
}