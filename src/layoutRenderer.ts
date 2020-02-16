import { LayoutItem, isLayoutLeaf, isLayoutGroup, LayoutGroup, LayoutDirection, LayoutLeaf } from "./layout";
import { idGenerator, identity, constant } from "./utils";
import { arrangeElement } from "./domUtils";
import { LayoutController } from "./layoutController";

export class LayoutRenderer {
    constructor(
        readonly root: LayoutItem) {
    }
    
    private readonly _idGenerator = idGenerator("ra-layout");
    
    render(container: HTMLElement): LayoutController {
        const rootElement = document.createElement("div");
        rootElement.id = this._idGenerator();
        arrangeElement(rootElement, 0, 0, 100, 100);
        container.appendChild(rootElement);

        const controller = new LayoutController(rootElement, this);

        this._renderItem(this.root, rootElement, controller);

        return controller;
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
        let sum = 0;
        for (const [item, weight] of group) {
            if (!item.visible) {
                continue;
            }
            sum += weight;
        }
    
        let getLeft: (start: number) => number;
        let getTop: (start: number) => number;
        let getWidth: (size: number) => number;
        let getHeight: (size: number) => number;
        if (group.direction === LayoutDirection.Horizontal) {
            getLeft = identity;
            getTop = constant(0);
            getWidth = identity;
            getHeight = constant(100);
        } else {
            getLeft = constant(0);
            getTop = identity;
            getWidth = constant(100);
            getHeight = identity;
        }
    
        let start = 0;
        for (const [item, weight] of group) {
            if (!item.visible) {
                continue;
            }

            const size = weight / sum * 100;

            const id = this._idGenerator();
    
            const itemElement = document.createElement("div");
            itemElement.id = id;
            arrangeElement(itemElement, getLeft(start), getTop(start), getWidth(size), getHeight(size));
            element.appendChild(itemElement);
    
            start += size;
    
            this._renderItem(item, itemElement, controller);
        }
    }

    hideItem(item: LayoutItem, controller: LayoutController): void {
        if (!item.parent) {
            return;
        }

        const parent = item.parent!;

        item.visible = false;

        const parentId = controller.getElementId(parent);

        let count = 0;
        let sum = 0;
        for (const [item, weight] of parent) {
            if (!item.visible) {
                continue;
            }
            count++;
            sum += weight;
        }

        if (count === 0) {
            this.hideItem(parent, controller);
            return;
        }    
    
        let getLeft: (start: number) => number;
        let getTop: (start: number) => number;
        let getWidth: (size: number) => number;
        let getHeight: (size: number) => number;
        if (parent.direction === LayoutDirection.Horizontal) {
            getLeft = identity;
            getTop = constant(0);
            getWidth = identity;
            getHeight = constant(100);
        } else {
            getLeft = constant(0);
            getTop = identity;
            getWidth = constant(100);
            getHeight = identity;
        }

        let parentPlaceholder = controller.container.querySelector("#" + parentId) as HTMLElement;
        if (!parentPlaceholder) {
            parentPlaceholder = controller.container;
        }

        let start = 0;
        for (const [item, weight] of parent) {
            const element = parentPlaceholder.querySelector("#" + parentId + " > " + "#" + controller.getElementId(item)) as HTMLElement;
            if (!item.visible) {
                element.style.display = "none";
                continue;
            }

            const size = weight / sum * 100;
    
            element.style.position = "absolute";
            element.style.left = getLeft(start) + "%";
            element.style.top = getTop(start) + "%";
            element.style.width = getWidth(size) + "%";
            element.style.height = getHeight(size) + "%";
    
            start += size;
        }
    }
}