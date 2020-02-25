import { LayoutItem } from "./layout";

export class LayoutContext {
    constructor(
        readonly rootId: string) {
    }

    private readonly _domToLayout = new Map<string, LayoutItem>();
    private readonly _layoutToDom = new Map<LayoutItem, string>();

    register(id: string, item: LayoutItem): void {
        this._domToLayout.set(id, item);
        this._layoutToDom.set(item, id);
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
    }

    idToItem(id: string): LayoutItem | undefined {
        return this._domToLayout.get(id);
    }

    itemToId(item: LayoutItem): string | undefined {
        return this._layoutToDom.get(item);
    }

    private _unregister(id: string, item: LayoutItem): void {
        this._domToLayout.delete(id);
        this._layoutToDom.delete(item);
    }
}