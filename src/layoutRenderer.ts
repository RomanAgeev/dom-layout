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

        this._layoutGroupChanged = this._layoutGroupChanged.bind(this);
    }
    
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);

    private _context?: LayoutContext;
    
    render(container: HTMLElement): LayoutController {
        const rootElement = this._createRootElement(container);

        this._context = new LayoutContext(rootElement.id);

        this.root.subscribeGroupChanged(this._layoutGroupChanged);

        this._renderItem(this.root, rootElement, this._context);

        return new LayoutController(this._context);
    }

    private _reRenderGroup(group: LayoutGroup, element: HTMLElement, context: LayoutContext): void {        
        const arranger: LayoutArranger = this._getLayoutArranger(group);

        const rects = arranger.arrangeGroup(group);
        for (const [item, rect] of rects) {
            let itemId = context.itemToId(item);
            if (!itemId) {
                itemId = idGen();
                context.register(itemId, item);
            }

            let itemElement = document.getElementById(itemId);
            if (!itemElement) {
                itemElement = document.createElement("div");
                itemElement.id = itemId;
            }

            element.append(itemElement);
            placeElementPercent(itemElement, rect);
            this._reRenderItem(item, itemElement, context);
        }
    }

    private _reRenderItem(item: LayoutItem, element: HTMLElement, context: LayoutContext): void {
        if (isLayoutLeaf(item)) {
            this._renderLeaf(item, element, context);
            return;
        }

        if (isLayoutGroup(item)) {
            this._reRenderGroup(item, element, context);
            return;
        }
    }

    private _layoutGroupChanged(_sender: unknown, group: LayoutGroup, removedItems: LayoutItem[]): void {
        const groupElement = document.getElementById(this._context!.itemToId(group)!)!;
        this._reRenderGroup(group, groupElement, this._context!);
    }

    private _createRootElement(container: HTMLElement): HTMLElement {
        const element = document.createElement("div");
        element.id = idGen();
        placeElementPercent(element, { left: 0, top: 0, width: 100, height: 100 });
        container.append(element);
        return element;
    }

    private _renderItem(item: LayoutItem, element: HTMLElement, context: LayoutContext): void {
        context.register(element.id, item);

        if (isLayoutLeaf(item)) {
            this._renderLeaf(item, element, context);
            return;
        }

        if (isLayoutGroup(item)) {
            this._renderGroup(item, element, context);
            return;
        }
    }

    private _renderLeaf(leaf: LayoutLeaf, element: HTMLElement, _context: LayoutContext): void {
        element.style.background = leaf.payload as string;
    }

    private _renderGroup(group: LayoutGroup, element: HTMLElement, context: LayoutContext): void {
        const arranger: LayoutArranger = this._getLayoutArranger(group);

        const rects = arranger.arrangeGroup(group);
        
        for (const [item, rect] of rects) {
            const itemElement = document.createElement("div");
            itemElement.id = idGen();
            placeElementPercent(itemElement, rect);
            element.append(itemElement);
            this._renderItem(item, itemElement, context);
        }
    }

    private _getLayoutArranger(group: LayoutGroup): LayoutArranger {
        return group.direction === LayoutDirection.Horizontal ?
            this._horizontalArranger :
            this._verticalArranger;
    }
}
