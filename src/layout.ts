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
        if (this.parent) {
            this.parent.insertNearChild(this, item, side);
        }
    }
}

export type LayoutGroupChanged = (group: LayoutGroup) => void;

export class LayoutGroup extends LayoutItem implements Iterable<[LayoutItem, number]> {
    constructor(
        parent: LayoutGroup | null,
        readonly direction: LayoutDirection) {
            
        super(parent);
    }

    private static readonly ChangedEvent = "changed";

    private readonly _items: LayoutItem[] = [];
    private readonly _weights = new Map<LayoutItem, number>();
    private readonly _events = new EventEmitter();

    get count(): number {
        return this._items.length;
    }

    item(index: number): LayoutItem | undefined {
        if (index < 0 || index >= this._items.length) {
            return undefined;
        }
        return this._items[index];
    }

    weight(item: LayoutItem): number | undefined {
        return this._weights.get(item);
    }
    
    addLeaf(payload: unknown, weight: number = 1): LayoutLeaf {
        const leaf = new LayoutLeaf(this, payload);
        this._addItem(leaf, weight);
        this._raiseChanged();
        return leaf;
    }

    addGroup(direction: LayoutDirection, weight: number = 1): LayoutGroup {
        const group = new LayoutGroup(this, direction);
        this._addItem(group, weight);
        this._raiseChanged();
        return group;
    }

    removeItem(item: LayoutItem): number {
        for (let i = 0; i < this.count; i++) {
            if (this._items[i] === item) {
                this._items.splice(i, 1);

                const itemWeight = this._weights.get(item)!;
                if (i > 0) {
                    const weightBefore = this._weights.get(this._items[i - 1])!;
                    this._weights.set(this._items[i - 1], weightBefore + itemWeight);
                } else if (i < this.count) {
                    const weightAfter = this._weights.get(this._items[i + 1])!;
                    this._weights.set(this._items[i + 1], weightAfter + itemWeight);
                }

                this._weights.delete(item);
                item.parent = null
                this._raiseChanged();
                return i;
            }
        }
        return -1;
    }

    insertItem(item: LayoutItem, index: number, weight: number): void {
        this._items.splice(index, 0, item);
        this._weights.set(item, weight);
        item.parent = this;
        this._raiseChanged();
    }

    insertNearChild(child: LayoutItem, item: LayoutItem, side: LayoutSide): void {
        const index = this._getItemIndex(child);
        if (index < 0) {
            return;
        }

        const childWeight = this._weights.get(child)!;
        const halfWeight = childWeight / 2;

        if (isItemAppend(side, this.direction)) {
            this._weights.set(child, halfWeight)
            this.insertItem(item, index + 1, halfWeight);
            return;
        }

        if (isItemPrepend(side, this.direction)) {
            this._weights.set(child, halfWeight)
            this.insertItem(item, index, halfWeight);
            return;
        }

        this.removeItem(child);

        const group = new LayoutGroup(this, oppositeDirection(this.direction));
        group.insertItem(child, 0, childWeight);
        group.insertNearChild(child, item, side);

        this.insertItem(group, index, childWeight);
    }

    subscribeChanged(handler: LayoutGroupChanged): void {
        this._events.addListener(LayoutGroup.ChangedEvent, handler);
    }

    getItemWeight(item: LayoutItem): number | undefined {
        return this._weights.get(item);
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

    private _getItemIndex(item: LayoutItem): number {
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i] === item) {
                return i;
            }
        }
        return -1;
    }

    private _addItem(item: LayoutItem, weight: number): void {
        this._items.push(item);
        this._weights.set(item, weight);
    }

    private _raiseChanged(): void {
        this._events.emit(LayoutGroup.ChangedEvent, this);
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

const oppositeDirection = (direction: LayoutDirection): LayoutDirection =>
    direction === LayoutDirection.Horizontal ? LayoutDirection.Vertical : LayoutDirection.Horizontal;


