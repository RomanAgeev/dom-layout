import { LayoutItem, LayoutSide, LayoutGroup, isLayoutGroup } from "./layout";
import { LayoutContext } from "./layoutContext";
import { DropContext } from "./dropContext";
import { LayoutItemRect } from "./layoutUtils";

export class DragContext {
    constructor(
        private readonly _layoutContext: LayoutContext,
        private readonly _innerItem: LayoutItem,
        private readonly _outerItem: LayoutItem,
        private readonly _offsetX: number,
        private readonly _offsetY: number,
        private readonly _width: number,
        private readonly _height:  number) {

        this.innerId = this._layoutContext.itemToId(this._innerItem)!;
        this.outerId = this._layoutContext.itemToId(this._outerItem)!;

        this._group = this._outerItem.parent!;
        this._weight = this._group.weight(this._outerItem);
        this._index = this._group.index(this._outerItem);
    }
    
    readonly innerId: string;
    readonly outerId: string;

    private readonly _group: LayoutGroup;
    private readonly _weight: number;
    private readonly _index: number;
    private readonly _stash: { item: LayoutItem, itemId: string }[] = [];

    private _isDragging = false;

    get isDragging(): boolean {
        return this._isDragging;
    }

    beginDrag(): void {
        this._stashRecursive(this._outerItem);
        this._group.removeItem(this._outerItem);
        this._isDragging = true;
    }

    endDrag(dropContext?: DropContext): void {
        this._unstash();
        
        if (dropContext && dropContext.dropItem) {
            this._completeDrag(dropContext.dropItem, dropContext.dropEdge);
        } else {
            this._cancelDrag();
        }
    }    

    calcDragRect(x: number, y: number): LayoutItemRect {
        return {
            left: x - this._offsetX,
            top: y - this._offsetY,
            width: this._width,
            height: this._height
        };
    }

    private _stashRecursive(item: LayoutItem): void {
        const itemId = this._layoutContext.itemToId(item);
        if (!itemId) {
            throw new Error("TODO");
        }

        this._stash.push({ item, itemId });

        this._layoutContext.unregisterItem(item);

        if (isLayoutGroup(item)) {
            for (const [child, weight] of item) {
                this._stashRecursive(child);
            }
        }
    }

    private _unstash(): void {
        if (this._stash.length === 0) {
            throw new Error("TODO");
        }

        this._stash.forEach(({item, itemId}) => this._layoutContext.registerIndex(item, itemId));
        this._stash.length = 0;
    }

    private _completeDrag(dropItem: LayoutItem, dropEdge: LayoutSide): void {
        dropItem.insertSide(this._outerItem, dropEdge);
    }

    private _cancelDrag(): void {
        this._group.insertItem(this._outerItem, this._index, this._weight);
    }
}