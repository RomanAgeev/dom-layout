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

    idToItem(id: string): LayoutItem | undefined {
        return this._domToLayout.get(id);
    }

    itemToId(item: LayoutItem): string | undefined {
        return this._layoutToDom.get(item);
    }
}