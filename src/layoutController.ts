import { LayoutItem, LayoutLeaf } from "./layout";
import { isHTMLElement } from "./domUtils";
import { LayoutRenderer } from "./layoutRenderer";

export class LayoutController {
    constructor(
        readonly container: HTMLElement,
        private readonly _renderer: LayoutRenderer) {

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

    registerElement(element: HTMLElement, item: LayoutItem): void {
        this._domToLayout.set(element.id, item);
        this._layoutToDom.set(item, element.id);
    }

    getElementId(item: LayoutItem): string | undefined {
        return this._layoutToDom.get(item);
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

        this._renderer.hideItem(this._domToLayout.get(id)!, this);
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
        const item = this._domToLayout.get((e.target as HTMLElement).id) as LayoutLeaf;
        if (!item) {
            return;
        }

        console.log(item.payload);
    }
}