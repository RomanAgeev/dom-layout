import { EventEmitter } from "events";

export enum LayoutDirection {
    Horizontal,
    Vertical
}

export enum LayoutSide {
    Left,
    Top,
    Right,
    Bottom
}

export abstract class LayoutItem {
    protected constructor(
        public parent: LayoutGroup | null) {
    }

}

export class LayoutEmpty extends LayoutItem {
    constructor() {
        super(null);
    }
}

export class LayoutLeaf extends LayoutItem {
    constructor(
        parent: LayoutGroup,
        readonly payload: unknown) {

        super(parent);
    }

    insertSide(item: LayoutItem, side: LayoutSide): void {
        this.parent!.insertNearChild(this, item, side);
    }
}

export type LayoutGroupChanged = (group: LayoutGroup) => void;

export class LayoutGroup extends LayoutItem implements Iterable<[LayoutItem, number]> {
    static readonly EventChanged = "CHANGED";

    constructor(
        parent: LayoutGroup | null,
        readonly direction: LayoutDirection) {
            
        super(parent);
    }

    private readonly _items: LayoutItem[] = [];
    private readonly _weights = new Map<LayoutItem, number>();

    readonly events = new EventEmitter();

    get count(): number {
        return this._items.length;
    }

    item(index: number): LayoutItem {
        if (index < 0 || index >= this._items.length) {
            throw new Error("index out of range");
        }
        return this._items[index];
    }

    index(item: LayoutItem): number {
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i] === item) {
                return i;
            }
        }
        return -1;
    }

    weight(item: LayoutItem): number {
        if (!this._weights.has(item)) {
            throw new Error("item doesn't exist in the group");
        }
        return this._weights.get(item)!;
    }
    
    addLeaf(payload: unknown, weight: number = 1): LayoutLeaf {
        const leaf = new LayoutLeaf(this, payload);
        this._insertIndex(this.count, leaf, weight);
        this._raiseChanged();
        return leaf;
    }

    addGroup(direction: LayoutDirection, weight: number = 1): LayoutGroup {
        const group = new LayoutGroup(this, direction);
        this._insertIndex(this.count, group, weight);
        this._raiseChanged();
        return group;
    }

    insertItem(item: LayoutItem, index: number, weight: number): void {
        this._insertIndex(index, item, weight);
        this._raiseChanged();
    }

    insertNearChild(child: LayoutItem, item: LayoutItem, side: LayoutSide): void {
        const index = this.index(child);
        if (index < 0) {
            throw new Error("child doesn't exist in the group");
        }

        const weight = this.weight(child);
        const halfWeight = weight / 2;

        if (isItemAppend(side, this.direction)) {
            this._weights.set(child, halfWeight);
            this._insertIndex(index + 1, item, halfWeight);

        } else if (isItemPrepend(side, this.direction)) {
            this._weights.set(child, halfWeight)
            this._insertIndex(index, item, halfWeight);

        } else {
            const oppositeDirection =
                this.direction === LayoutDirection.Horizontal ?
                LayoutDirection.Vertical :
                LayoutDirection.Horizontal;

            const group = new LayoutGroup(this, oppositeDirection);

            this._removeIndex(index);
            this._insertIndex(index, group, weight);

            if (isItemAppend(side, oppositeDirection)) {
                group._insertIndex(0, child, 1);
                group._insertIndex(1, item, 1);
            } else {
                group._insertIndex(0, item, 1);
                group._insertIndex(1, child, 1);
            }
        }

        this._raiseChanged();
    }

    removeItem(item: LayoutItem): number {
        const index = this.index(item);
        if (index >= 0) {
            this._removeIndex(index);
            this._raiseChanged();
        }
        return index;
    }

    private _insertIndex(index: number, item: LayoutItem, weight: number): void {
        this._items.splice(index, 0, item);
        this._weights.set(item, weight);
        item.parent = this;
    }

    private _removeIndex(index: number): void {
        const item: LayoutItem = this._items[index];
        this._items.splice(index, 1);
        this._weights.delete(item);
        item.parent = null
    }

    private _raiseChanged(): void {
        this.events.emit(LayoutGroup.EventChanged, this);
    }

    [Symbol.iterator](): Iterator<[LayoutItem, number]> {
        const count = this.count;
        const items = this._items;
        const weights = this._weights;
        const empty = new LayoutEmpty();

        let index = 0;

        return {
            next(): IteratorResult<[LayoutItem, number]> {
                if (index === count) {
                    return { done: true, value: [empty, 0] }
                }

                const item = items[index++];
                const weight = weights.get(item)!;

                return { done: false, value: [item, weight] }
            }
        };
    }
}

export const isLayoutLeaf = (item: LayoutItem): item is LayoutLeaf => item instanceof LayoutLeaf;
export const isLayoutGroup = (item: LayoutItem): item is LayoutGroup => item instanceof LayoutGroup;

const isItemPrepend = (side: LayoutSide, direction: LayoutDirection): boolean => 
    direction === LayoutDirection.Horizontal && side === LayoutSide.Left ||
    direction === LayoutDirection.Vertical && side === LayoutSide.Top;

const isItemAppend = (side: LayoutSide, direction: LayoutDirection): boolean => 
    direction === LayoutDirection.Horizontal && side === LayoutSide.Right ||
    direction === LayoutDirection.Vertical && side === LayoutSide.Bottom;
