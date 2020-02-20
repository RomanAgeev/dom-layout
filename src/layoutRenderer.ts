import { LayoutItem, isLayoutLeaf, isLayoutGroup, LayoutGroup, LayoutDirection, LayoutLeaf } from "./layout";
import { idGenerator, identity, constant } from "./utils";
import { LayoutController } from "./layoutController";
import { LayoutArranger } from "./layoutArranger";
import { placeElementPercent } from "./layoutUtils";
import { LayoutContext } from "./layoutContext";

const idGen = idGenerator("ra-layout");

export class LayoutRenderer {
    constructor(
        readonly root: LayoutItem) {
    }
    
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);
    
    render(container: HTMLElement): LayoutController {
        const rootElement = this._createRootElement(container);

        const context = new LayoutContext(rootElement.id);

        this._renderItem(this.root, rootElement, context);

        return new LayoutController(context, this);
    }

    reRenderGroup(group: LayoutGroup, element: HTMLElement, context: LayoutContext): void {
        const arranger: LayoutArranger = this._getLayoutArranger(group);

        const rects = arranger.arrangeGroup(group);
        for (const [item, rect] of rects) {
            const itemElement = document.getElementById(context.itemToId(item)!)!;
            element.append(itemElement);
            placeElementPercent(itemElement, rect);
        }
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
