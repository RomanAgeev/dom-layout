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

export class LayoutItem {
    public parent?: LayoutGroup;
}

export class LayoutLeaf extends LayoutItem {
    constructor(
        readonly payload: unknown) {

        super();
    }

    insertSide(item: LayoutItem, side: LayoutSide): void {
        if (this.parent) {
            this.parent.insertNearChild(this, item, side);
        }
    }
}

const layoutChangedEvent = "Layout_CHANGED";

export type LayoutChangedEventHandler = (groupChanged: LayoutGroup, itemsRemoved: LayoutItem[]) => void;

export class LayoutGroup extends LayoutItem implements Iterable<[LayoutItem, number]> {
    constructor(
        readonly direction: LayoutDirection) {
            
        super();
    }

    private readonly _items: LayoutItem[] = [];
    private readonly _weights = new Map<LayoutItem, number>();
    private readonly _events = new EventEmitter();

    get count(): number {
        return this._items.length;
    }

    subscribeLayoutChanged(handler: LayoutChangedEventHandler): void {
        this._events.addListener(layoutChangedEvent, handler);
    }

    unsubscribeLayoutChanged(hander: LayoutChangedEventHandler): void {
        this._events.removeListener(layoutChangedEvent, hander);
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
        const leaf = new LayoutLeaf(payload);
        this._insertIndex(this.count, leaf, weight);
        this._raiseGroupChanged(this, []);
        return leaf;
    }

    addGroup(direction: LayoutDirection, weight: number = 1): LayoutGroup {
        const group = new LayoutGroup(direction);
        this._insertIndex(this.count, group, weight);
        this._raiseGroupChanged(this, []);
        return group;
    }

    insertItem(item: LayoutItem, index: number, weight: number): void {
        this._insertIndex(index, item, weight);
        this._raiseGroupChanged(this, []);
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

            const group = new LayoutGroup(oppositeDirection);

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

        this._raiseGroupChanged(this, []);
    }

    removeItem(item: LayoutItem): void {
        const index = this.index(item);
        if (index < 0) {
            throw new Error("item doesn't exist");
        }
        this._removeIndex(index);
        this._raiseGroupChanged(this, [item]);
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
        item.parent = undefined
    }

    private _raiseGroupChanged(groupChanged: LayoutGroup, itemsRemoved: LayoutItem[]): void {
        this._events.emit(layoutChangedEvent, groupChanged, itemsRemoved);

        if (this.parent) {
            this.parent._raiseGroupChanged(groupChanged, itemsRemoved);
        }
    }

    [Symbol.iterator](): Iterator<[LayoutItem, number]> {
        const count = this.count;
        const items = this._items;
        const weights = this._weights;
        const empty = new LayoutItem();

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
