import { LayoutItem, isLayoutLeaf, isLayoutGroup, LayoutGroup, LayoutDirection, LayoutLeaf } from "./layout";
import { idGenerator, identity, constant } from "./utils";
import { LayoutController } from "./layoutController";
import { LayoutArranger } from "./layoutArranger";
import { placeElement } from "./layoutUtils";

export class LayoutRenderer {
    constructor(
        readonly root: LayoutItem) {
    }
    
    private readonly _idGenerator = idGenerator("ra-layout");
    private readonly _horizontalArranger = new LayoutArranger(identity, constant(0), identity, constant(100));
    private readonly _verticalArranger = new LayoutArranger(constant(0), identity, constant(100), identity);
    
    render(container: HTMLElement): LayoutController {
        const rootElement = this._createRootElement(container);
        const controller = new LayoutController(rootElement, this);

        this._renderItem(this.root, rootElement, controller);

        return controller;
    }

    private _createRootElement(container: HTMLElement): HTMLElement {
        const element = document.createElement("div");
        element.id = this._idGenerator();        
        placeElement(element, { left: 0, top: 0, width: 100, height: 100 });
        container.append(element);
        return element;
    }

    private _renderItem(item: LayoutItem, element: HTMLElement, controller: LayoutController): void {
        controller.registerElement(element, item);

        if (isLayoutLeaf(item)) {
            this._renderLeaf(item, element);
            return;
        }

        if (isLayoutGroup(item)) {
            this._renderGroup(item, element, controller);
            return;
        }
    }

    private _renderLeaf(leaf: LayoutLeaf, element: HTMLElement): void {
        element.style.background = leaf.payload as string;
        element.setAttribute("draggable", "true");
    }

    private _renderGroup(group: LayoutGroup, element: HTMLElement, controller: LayoutController): void {
        const arranger: LayoutArranger = this.getLayoutArranger(group);

        const rects = arranger.arrangeGroup(group,(item: LayoutItem) => item.visible);
        
        for (const [item, rect] of rects) {
            const itemElement = document.createElement("div");
            itemElement.id = this._idGenerator();
            placeElement(itemElement, rect);
            element.append(itemElement);
            this._renderItem(item, itemElement, controller);
        }        
    }

    private getLayoutArranger(group: LayoutGroup): LayoutArranger {
        return group.direction === LayoutDirection.Horizontal ?
            this._horizontalArranger :
            this._verticalArranger;
    }

    hideItem(item: LayoutItem, controller: LayoutController): void {
        if (!item.parent) {
            return;
        }

        const parent = item.parent!;

        item.visible = false;

        const parentId = controller.getElementId(parent);

        const arranger = this.getLayoutArranger(parent);

        let parentPlaceholder = document.getElementById(parentId!);
        if (!parentPlaceholder) {
            parentPlaceholder = controller.container;
        }

        const rects = arranger.arrangeGroup(parent,(item: LayoutItem) => item.visible);
        if (rects.size === 0) {
            this.hideItem(parent, controller);
            return;
        }

        for (const [item, _] of parent) {
            const itemElement = parentPlaceholder.querySelector("#" + parentId + " > " + "#" + controller.getElementId(item)) as HTMLElement;
            const rect = rects.get(item);
            if (rect) {
                placeElement(itemElement, rect);
            } else {
                itemElement.style.display = "none";
            }
        }
    }
}
