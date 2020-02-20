export enum LayoutDirection {
    Horizontal,
    Vertical
}

export abstract class LayoutItem {
    protected constructor(
        readonly parent: LayoutGroup | null) {
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
}

export class LayoutGroup extends LayoutItem implements Iterable<[LayoutItem, number]> {
    constructor(
        parent: LayoutGroup | null,
        readonly direction: LayoutDirection) {
            
        super(parent);
    }

    private readonly _items: LayoutItem[] = [];
    private readonly _weights = new Map<LayoutItem, number>();

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
        return leaf;
    }

    addGroup(direction: LayoutDirection, weight: number = 1): LayoutGroup {
        const group = new LayoutGroup(this, direction);
        this._addItem(group, weight);
        return group;
    }

    removeItem(item: LayoutItem): number {
        for (let i = 0; i < this.count; i++) {
            if (this._items[i] === item) {
                this._items.splice(i, 1);
                return i;
            }
        }
        return -1;
    }

    insertItem(item: LayoutItem, index: number): void {
        this._items.splice(index, 0, item);
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

    private _addItem(item: LayoutItem, weight: number): void {
        this._items.push(item);
        this._weights.set(item, weight);
    }
}

export const isLayoutLeaf = (item: LayoutItem): item is LayoutLeaf => item instanceof LayoutLeaf;
export const isLayoutGroup = (item: LayoutItem): item is LayoutGroup => item instanceof LayoutGroup;



