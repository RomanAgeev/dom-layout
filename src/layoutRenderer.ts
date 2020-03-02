import { Layout, LayoutItem, isLayoutGroup, LayoutGroup, LayoutDirection } from "./layout";
import { identity, constant } from "./utils";
import { LayoutController } from "./layoutController";
import { LayoutArranger } from "./layoutArranger";
import { placeElementPercent, headerId, contentId } from "./layoutUtils";
import { LayoutContext } from "./layoutContext";

export type ItemRender = (payload: unknown, container: HTMLElement) => void;

export class LayoutRenderer {
    constructor(
        private readonly _layout: Layout,
        private readonly _itemRender: ItemRender,
        idPrefix: string) {

        this._layoutContext = new LayoutContext(idPrefix);
        this._layoutController = new LayoutController(this._layout, this._layoutContext);
        this._layoutChanged = this._layoutChanged.bind(this);
        this._layout.subscribeLayoutChanged(this._layoutChanged);
    }
    
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);
    private readonly _layoutContext: LayoutContext;
    private readonly _layoutController: LayoutController;
    
    render(container: HTMLElement): void {
        const rootElement = this._createElement(this._layout.root);
        placeElementPercent(rootElement, { left: 0, top: 0, width: 100, height: 100 });
        container.append(rootElement);

        this._renderGroup(this._layout.root);

        this._layoutController.activate();
    }

    private _layoutChanged(groupChanged: LayoutGroup, itemsRemoved: LayoutItem[]): void {
        for (const item of itemsRemoved) {
            this._removeItemElement(item);
        }

        this._renderGroup(groupChanged);
    }

    private _removeItemElement(item: LayoutItem): void {
        const itemId = this._layoutContext.itemToId(item);
        if (itemId) {
            const itemElement = document.getElementById(itemId);
            if (itemElement) {
                itemElement.remove();
            }
            this._layoutContext.unregisterItem(item);
        }

        if (isLayoutGroup(item)) {
            for (const [child, weight] of item) {
                this._removeItemElement(child);
            }
        }
    }

    private _renderGroup(group: LayoutGroup): void {
        const groupElement = this._extractElement(group);

        const arranger: LayoutArranger = this._getLayoutArranger(group);

        for (const { item, rect } of arranger.arrangeGroup(group)) {
            if (!item) {
                const separatorElement = document.createElement("div");
                placeElementPercent(separatorElement, rect);
                groupElement.append(separatorElement);
                continue;
            }

            let itemId = this._layoutContext.itemToId(item);
            let itemElement =
                itemId ?
                document.getElementById(itemId) as HTMLElement :
                this._createElement(item);

            placeElementPercent(itemElement, rect);
            groupElement.append(itemElement);

            if (isLayoutGroup(item)) {
                this._renderGroup(item);

            } else if (!itemId) {
                this._renderItem(item);
            }
        }
    }

    private _renderItem(item: LayoutItem): void {
        const contanerElement = this._extractElement(item);

        const itemId: string = contanerElement.id;

        const headerElement = document.createElement("div");
        headerElement.id = headerId(itemId);
        headerElement.classList.add("item", "item-header");
        headerElement.style.background = item.payload as string;

        const contentElement = document.createElement("div");
        contentElement.id = contentId(itemId);
        contentElement.classList.add("item", "item-content");

        contanerElement.append(headerElement, contentElement);
        contanerElement.classList.add("item-container");
        contanerElement.style.borderColor = item.payload as string;

        this._itemRender(item.payload, contentElement);
    }

    private _extractElement(item: LayoutItem): HTMLElement {
        const id = this._layoutContext.itemToId(item);
        if (!id) {
            throw new Error("TODO");
        }

        const element = document.getElementById(id);
        if (!element) {
            throw new Error("TODO");
        }

        return element;
    }

    private _createElement(item: LayoutItem): HTMLElement {
        const element = document.createElement("div");
        element.id = this._layoutContext.registerItem(item);
        element.classList.add("item");
        return element;
    }

    private _getLayoutArranger(group: LayoutGroup): LayoutArranger {
        return group.direction === LayoutDirection.Horizontal ?
            this._horizontalArranger :
            this._verticalArranger;
    }
}
