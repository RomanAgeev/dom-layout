import { identity, constant, idGenerator } from "./utils";
import { isHTMLElement } from "./domUtils";

export enum LayoutDirection {
    Horizontal,
    Vertical
}

export class LayoutItem {
    constructor(
        readonly parent: LayoutItem | null,
        readonly direction: LayoutDirection,
        readonly color: string | null,
        readonly weight: number = 1) {
    }

    readonly children: LayoutItem[] = [];

    visible = true;
}

export class Layout {
    constructor(
        readonly container: HTMLElement,
        readonly root: LayoutItem) {

        this._itemOver = this._itemOver.bind(this);
        this._itemOut = this._itemOut.bind(this);
        this._itemClick = this._itemClick.bind(this);
        this._itemDragStart = this._itemDragStart.bind(this);
        this._itemDragOver = this._itemDragOver.bind(this);
        this._itemDrop = this._itemDrop.bind(this);

        this.container.addEventListener("mouseover", this._itemOver);
        this.container.addEventListener("mouseout", this._itemOut);
        this.container.addEventListener("dragstart", this._itemDragStart);
        this.container.addEventListener("dragover", this._itemDragOver);
        this.container.addEventListener("drop", this._itemDrop);
        this.container.addEventListener("click", this._itemClick);
    }    
    
    private readonly _domToLayout = new Map<string, LayoutItem>();
    private readonly _layoutToDom = new Map<LayoutItem, string>();
    private readonly _idGenerator = idGenerator("ra-layout");

    private _dragId: string | null = null;
    
    build(): void {
        const element = document.createElement("div");
        element.id = this._idGenerator();
        element.style.position = "absolute";
        element.style.left = "0";
        element.style.top = "0";
        element.style.width = "100%";
        element.style.height = "100%";
        this.container.appendChild(element);
        this._buildItem(this.root, element);
    }

    private _buildItem(item: LayoutItem, placeholder: HTMLElement): void {
        this._domToLayout.set(placeholder.id, item);
        this._layoutToDom.set(item, placeholder.id);

        if (!item.children || item.children.length === 0) {
            placeholder.style.background = item.color;
            placeholder.setAttribute("draggable", "true");
            return;
        }

        const childrenVisible = item.children.filter(child => child.visible)
    
        const sum = childrenVisible.reduce((acc, child) => acc + child.weight, 0);
    
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
        for (const child of childrenVisible) {
            const size = child.weight / sum * 100;

            const id = this._idGenerator();
    
            const element = document.createElement("div");
            element.id = id;
            element.style.position = "absolute";
            element.style.left = getLeft(start) + "%";
            element.style.top = getTop(start) + "%";
            element.style.width = getWidth(size) + "%";
            element.style.height = getHeight(size) + "%";
            placeholder.appendChild(element);
    
            start += size;
    
            this._buildItem(child, element);
        }
    }

    private _hideItem(item: LayoutItem): void {
        if (!item.parent) {
            return;
        }

        const parent = item.parent!;

        item.visible = false;

        const parentId = this._layoutToDom.get(parent);

        const childrenVisible = parent.children.filter(child => child.visible)
        if (childrenVisible.length === 0) {
            this._hideItem(parent);
            return;
        }
    
        const sum = childrenVisible.reduce((acc, child) => acc + child.weight, 0);
    
        let getLeft: (start: number) => number;
        let getTop: (start: number) => number;
        let getWidth: (size: number) => number;
        let getHeight: (size: number) => number;
        if (parent.direction === LayoutDirection.Horizontal) {
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

        const parentPlaceholder = this.container.querySelector("#" + parentId) as HTMLElement;

        let start = 0;
        for (const child of parent.children) {
            const element = parentPlaceholder.querySelector("#" + parentId + " > " + "#" + this._layoutToDom.get(child)) as HTMLElement;
            if (!child.visible) {
                element.style.display = "none";
                continue;
            }

            const size = child.weight / sum * 100;
    
            element.style.position = "absolute";
            element.style.left = getLeft(start) + "%";
            element.style.top = getTop(start) + "%";
            element.style.width = getWidth(size) + "%";
            element.style.height = getHeight(size) + "%";
    
            start += size;
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

    private _itemDragStart(e: DragEvent): void {
        if (!e.dataTransfer) {
            return;
        }

        if (!isHTMLElement(e.target)) {
            return;
        }

        const id = e.target.id;
        if (!this._domToLayout.has(id)) {
            return;
        }

        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";

        this._hideItem(this._domToLayout.get(id)!);
    }

    private _itemDragOver(e: DragEvent): void {
        if (!e.dataTransfer) {
            return;
        }

        if (e.dataTransfer.effectAllowed !== "move") {
            return;
        }

        if (!isHTMLElement(e.target)) {
            return;
        }

        const id = e.target.id;
        if (!this._domToLayout.has(id)) {
            return;
        }

        if (e.dataTransfer.types[0] !== "text/plain") {
            return;
        }

        e.dataTransfer.dropEffect = "move";

        e.preventDefault();
    }

    private _itemDrop(e: DragEvent): void {
        if (!e.dataTransfer) {
            return;
        }
        
        const target = e.target as HTMLElement;

        alert("Drop " + e.dataTransfer.getData("text/plain") + " onto " + target.id);

        e.preventDefault();
    }

    private _itemClick(e: Event): void {
        const item = this._domToLayout.get((e.target as HTMLElement).id);
        if (!item) {
            return;
        }

        console.log(item.color);
    }
}

