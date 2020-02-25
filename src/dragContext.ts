import { LayoutItem, LayoutSide, LayoutGroup, LayoutLeaf } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class DragContext {
    constructor(
        private readonly _item: LayoutItem,
        private readonly _group: LayoutGroup,
        private readonly _weight: number,
        private readonly _index: number,
        private readonly _innerElement: HTMLElement,
        private readonly _outerElement: HTMLElement,
        private readonly _offsetX: number,
        private readonly _offsetY: number,
        private readonly _width: number,
        private readonly _height: number) {
    }

    private _isDragging = false;

    get isDragging(): boolean {
        return this._isDragging;
    }

    get dragElement(): HTMLElement {
        return this._outerElement;
    }

    beginDrag(): void {
        this._prepareElementDrag();
        this._group.removeItem(this._item);
        this._isDragging = true;
    }

    endDrag(dropItem: LayoutLeaf, dropEdge: LayoutSide): void {
        this._prepareElementDrop();
        dropItem.insertSide(this._item, dropEdge);
    }

    cancelDrag(): void {
        this._prepareElementDrop();
        this._group.insertItem(this._item, this._index, this._weight);
    }

    calcDragRect(x: number, y: number): LayoutItemRect {
        return {
            left: x - this._offsetX,
            top: y - this._offsetY,
            width: this._width,
            height: this._height
        };
    }

    private _prepareElementDrag(): void {
        this._innerElement.style.border = "";
        this._outerElement.style.opacity = "0.7";
        document.body.append(this._outerElement);
    }

    private _prepareElementDrop(): void {
        this._outerElement.style.opacity = "";
    }
}