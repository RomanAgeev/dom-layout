import { LayoutItem, isLayoutLeaf, isLayoutGroup, LayoutGroup, LayoutDirection, LayoutLeaf } from "./layout";
import { idGenerator, identity, constant } from "./utils";
import { LayoutController } from "./layoutController";
import { LayoutArranger } from "./layoutArranger";
import { placeElementPercent } from "./layoutUtils";
import { LayoutContext } from "./layoutContext";

const idGen = idGenerator("ra-layout");

export class LayoutRenderer {
    constructor(
        readonly root: LayoutGroup) {

        this._layoutChanged = this._layoutChanged.bind(this);

        this.root.subscribeLayoutChanged(this._layoutChanged);
    }
    
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);

    private _context?: LayoutContext;
    
    render(container: HTMLElement): LayoutController {
        const rootElement = this._createRootElement(container);

        this._context = new LayoutContext(rootElement.id);
        this._context.register(rootElement.id, this.root);

        this._renderGroup2(this.root);

        return new LayoutController(this._context);
    }

    private _layoutChanged(groupChanged: LayoutGroup, itemsRemoved: LayoutItem[]): void {
        for (const item of itemsRemoved) {
            this._removeItemElement(item);
        }

        this._renderGroup2(groupChanged);
    }

    private _removeItemElement(item: LayoutItem): void {
        const itemId = this._context!.itemToId(item);
        if (itemId) {
            const itemElement = document.getElementById(itemId);
            if (itemElement) {
                itemElement.remove();
            }
            this._context!.unregiterItem(item);
        }

        if (isLayoutGroup(item)) {
            for (const [child, weight] of item) {
                this._removeItemElement(child);
            }
        }
    }

    private _renderLeaf2(leaf: LayoutLeaf): void {
        const leafElement = this._extractElement(leaf);
        leafElement.style.background = leaf.payload as string;
    }

    private _renderGroup2(group: LayoutGroup): void {
        const groupElement = this._extractElement(group);

        const arranger: LayoutArranger = this._getLayoutArranger(group);

        for (const [item, rect] of arranger.arrangeGroup(group)) {
            let itemId = this._context!.itemToId(item);
            if (!itemId) {
                itemId = idGen();
                this._context!.register(itemId, item);
            }

            let isNew = false;

            let itemElement = document.getElementById(itemId);
            if (!itemElement) {
                itemElement = document.createElement("div");
                itemElement.id = itemId;
                isNew = true;
            }

            placeElementPercent(itemElement, rect);
            groupElement.append(itemElement);

            if (isLayoutGroup(item)) {
                this._renderGroup2(item);
            }

            if (isLayoutLeaf(item) && isNew) {
                this._renderLeaf2(item);
            }
        }
    }

    private _extractElement(item: LayoutItem): HTMLElement {
        const id = this._context!.itemToId(item);
        if (!id) {
            throw new Error("TODO");
        }

        const element = document.getElementById(id);
        if (!element) {
            throw new Error("TODO");
        }

        return element;
    }

    private _createRootElement(container: HTMLElement): HTMLElement {
        const element = document.createElement("div");
        element.id = idGen();
        placeElementPercent(element, { left: 0, top: 0, width: 100, height: 100 });
        container.append(element);
        return element;
    }

    private _getLayoutArranger(group: LayoutGroup): LayoutArranger {
        return group.direction === LayoutDirection.Horizontal ?
            this._horizontalArranger :
            this._verticalArranger;
    }
}
