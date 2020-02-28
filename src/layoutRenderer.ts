import { LayoutItem, isLayoutLeaf, isLayoutGroup, LayoutGroup, LayoutDirection, LayoutLeaf } from "./layout";
import { idGenerator, identity, constant } from "./utils";
import { LayoutController } from "./layoutController";
import { LayoutArranger } from "./layoutArranger";
import { placeElementPercent } from "./layoutUtils";
import { LayoutContext } from "./layoutContext";

export class LayoutRenderer {
    constructor(
        private readonly _layoutRoot: LayoutGroup,
        idPrefix: string) {

        this._layoutContext = new LayoutContext(idPrefix);
        this._layoutController = new LayoutController(this._layoutRoot, this._layoutContext);
        this._layoutChanged = this._layoutChanged.bind(this);
        this._layoutRoot.subscribeLayoutChanged(this._layoutChanged);
    }
    
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);
    private readonly _layoutContext: LayoutContext;
    private readonly _layoutController: LayoutController;
    
    render(container: HTMLElement): void {
        const rootElement = this._createElement(this._layoutRoot);
        placeElementPercent(rootElement, { left: 0, top: 0, width: 100, height: 100 });
        container.append(rootElement);

        this._renderGroup(this._layoutRoot);

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
            this._layoutContext.unregiterItem(item);
        }

        if (isLayoutGroup(item)) {
            for (const [child, weight] of item) {
                this._removeItemElement(child);
            }
        }
    }

    private _renderLeaf(leaf: LayoutLeaf): void {
        const leafElement = this._extractElement(leaf);
        leafElement.style.background = leaf.payload as string;
    }

    private _renderGroup(group: LayoutGroup): void {
        const groupElement = this._extractElement(group);

        const arranger: LayoutArranger = this._getLayoutArranger(group);

        for (const [item, rect] of arranger.arrangeGroup(group)) {
            let itemId = this._layoutContext.itemToId(item);
            let itemElement =
                itemId ?
                document.getElementById(itemId) as HTMLElement :
                this._createElement(item);

            placeElementPercent(itemElement, rect);
            groupElement.append(itemElement);

            if (isLayoutGroup(item)) {
                this._renderGroup(item);
            }

            if (isLayoutLeaf(item) && !itemId) {
                this._renderLeaf(item);
            }
        }
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
        return element;
    }

    private _getLayoutArranger(group: LayoutGroup): LayoutArranger {
        return group.direction === LayoutDirection.Horizontal ?
            this._horizontalArranger :
            this._verticalArranger;
    }
}
