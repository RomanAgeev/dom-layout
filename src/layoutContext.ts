import { LayoutItem, isLayoutGroup, LayoutGroup } from "./layout";
import { idGenerator } from "./utils";

export class LayoutContext {
    constructor(idPrefix: string) {
        this._idGen = idGenerator(idPrefix);
    }

    private readonly _domToLayout = new Map<string, LayoutItem>();
    private readonly _layoutToDom = new Map<LayoutItem, string>();
    private readonly _idGen: () => string;

    registerItem(item: LayoutItem): string {
        if (this._layoutToDom.has(item)) {
            throw new Error("TODO");
        }

        const itemId = this._idGen();
        this._register(itemId, item);
        return itemId;
    }

    registerItemId(item: LayoutItem, itemId: string): void {
        if (this._layoutToDom.has(item)) {
            throw new Error("TODO");
        }
        if (this._domToLayout.has(itemId)) {
            throw new Error("TODO");
        }

        this._register(itemId, item);
    }

    unregisterId(id: string): void {
        if (!this._domToLayout.has(id)) {
            throw new Error("id is unknown");
        }

        const item = this._domToLayout.get(id)!;

        this._unregister(id, item);
    }

    unregiterItem(item: LayoutItem): void {
        if (!this._layoutToDom.has(item)) {
            throw new Error("item is unknown");
        }

        const id = this._layoutToDom.get(item)!;

        this._unregister(id, item);

        if (isLayoutGroup(item)) {
            for (const [child, weight] of item) {
                this.unregiterItem(child);
            }
        }
    }

    idToItem(id: string): LayoutItem | undefined {
        return this._domToLayout.get(id);
    }

    itemToId(item: LayoutItem): string | undefined {
        return this._layoutToDom.get(item);
    }

    private _register(id: string, item: LayoutItem): void {
        this._domToLayout.set(id, item);
        this._layoutToDom.set(item, id);
    }

    private _unregister(id: string, item: LayoutItem): void {
        this._domToLayout.delete(id);
        this._layoutToDom.delete(item);
    }
}