import { LayoutItem } from "./layout";
import { idGenerator } from "./utils";

export class LayoutContext {
    constructor(idPrefix: string) {
        this._idGen = idGenerator(idPrefix);
    }

    private readonly _idToItem = new Map<string, LayoutItem>();
    private readonly _itemToId = new Map<LayoutItem, string>();
    private readonly _idGen: () => string;
    
    registerIndex(item: LayoutItem, itemId: string): void {
        this._checkItem(item);
        this._checkItemId(itemId);
        this._register(itemId, item);
    }

    registerItem(item: LayoutItem): string {
        this._checkItem(item);
        let itemId;
        while (this._idToItem.has(itemId = this._idGen()));
        this._register(itemId, item);
        return itemId;
    }

    unregisterItem(item: LayoutItem): void {
        if (!this._itemToId.has(item)) {
            throw new Error("TODO");
        }

        const itemId = this._itemToId.get(item);
        if (!itemId) {
            throw new Error("TODO");
        }

        this._unregister(itemId, item);
    }

    idToItem(id: string): LayoutItem | undefined {
        return this._idToItem.get(id);
    }

    itemToId(item: LayoutItem): string | undefined {
        return this._itemToId.get(item);
    }

    private _register(id: string, item: LayoutItem): void {
        this._idToItem.set(id, item);
        this._itemToId.set(item, id);
    }

    private _unregister(id: string, item: LayoutItem): void {
        this._idToItem.delete(id);
        this._itemToId.delete(item);
    }

    private _checkItem(item: LayoutItem): void {
        if (this._itemToId.has(item)) {
            throw new Error("TODO");
        }
    }

    private _checkItemId(itemId: string): void {
        if (this._idToItem.has(itemId)) {
            throw new Error("TODO");
        }
    }
}