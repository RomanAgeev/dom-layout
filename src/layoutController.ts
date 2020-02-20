import { LayoutItem, LayoutLeaf, isLayoutLeaf, LayoutGroup } from "./layout";
import { isHTMLElement } from "./domUtils";
import { LayoutRenderer } from "./layoutRenderer";
import { LayoutContext } from "./layoutContext";

export class LayoutController {
    constructor(
        private readonly _context: LayoutContext,
        private readonly _renderer: LayoutRenderer) {

        this._itemOver = this._itemOver.bind(this);
        this._itemOut = this._itemOut.bind(this);
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);

        const rootElement = document.getElementById(this._context.rootId)!;

        rootElement.addEventListener("mouseover", this._itemOver);
        rootElement.addEventListener("mouseout", this._itemOut);
        rootElement.addEventListener("dragstart", (e: DragEvent) => e.preventDefault());
        rootElement.addEventListener("mousedown", this._mouseDown);
        document.addEventListener("mousemove", this._mouseMove);
        document.addEventListener("mouseup", this._mouseUp);
    }

    private _dragItem?: LayoutItem;
    private _dragItemTarget?: LayoutItem;
    private _dragElement?: HTMLElement;
    private _dragElementTarget?: HTMLElement;
    private _dragItemIndex = -1;
    private _shiftX = -1;
    private _shiftY = -1;

    private _itemOver(e: Event): void {
        (e.target as HTMLElement).style.border = "2px solid black"
        e.preventDefault();
    }

    private _itemOut(e: Event): void {
        (e.target as HTMLElement).style.border = "";
        e.preventDefault();
    }

    private _mouseDown(e: MouseEvent): void {
        if (!e.target) {
            return;
        }

        const elementTarget = e.target as HTMLElement;

        const itemTarget = this._context.idToItem(elementTarget.id);
        if (!itemTarget) {
            return;
        }

        let item = itemTarget;
        while (item.parent && item.parent.count < 2) {
            item = item.parent;
        }

        if (item.parent === null) {
            return;
        }

        this._dragItem = item;
        this._dragItemTarget = itemTarget;

        const element = document.getElementById(this._context.itemToId(this._dragItem)!)!;

        const rect = element.getBoundingClientRect();

        this._shiftX = e.clientX - rect.left;
        this._shiftY = e.clientY - rect.top;
    }

    private _mouseMove(e: MouseEvent): void {
        if (!this._dragItem || !this._dragItemTarget) {
            return;
        }

        if (!this._dragElement && !this._dragElementTarget) {
            const element = document.getElementById(this._context.itemToId(this._dragItem)!);
            const elementTarget = document.getElementById(this._context.itemToId(this._dragItemTarget)!);
            if (!element || !elementTarget) {
                this._dragItem = undefined;
                this._dragElementTarget = undefined;
                return;
            }

            elementTarget.style.border = "";

            const rect = element.getBoundingClientRect();

            document.body.append(element);
            element.style.width = rect.width + "px";
            element.style.height = rect.height + "px";
            element.style.opacity = "0.7";

            const parentItem = this._dragItem.parent!;
            const parentElement = document.getElementById(this._context.itemToId(parentItem)!)!;
            this._dragItemIndex = parentItem.removeItem(this._dragItem);

            this._renderer.reRenderGroup(parentItem, parentElement, this._context);

            this._dragElement = element;
            this._dragElementTarget = elementTarget;
        }

        this._dragElement!.style.left = e.pageX - this._shiftX + "px";
        this._dragElement!.style.top = e.pageY - this._shiftY + "px";
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragItem) {
            return;
        }

        if(!this._dragElement) {
            this._dragItem = undefined;
            this._dragItemTarget = undefined;
            return;
        }

        this._dragElementTarget!.style.opacity = "";

        const parentItem = this._dragItem.parent!;
        const parentElement = document.getElementById(this._context.itemToId(parentItem)!)!;
        parentItem.insertItem(this._dragItem, this._dragItemIndex);

        this._renderer.reRenderGroup(parentItem, parentElement, this._context);

        this._dragItem = undefined;
        this._dragItemTarget = undefined;
        this._dragElement = undefined;
        this._dragElementTarget = undefined;
        this._dragItemIndex = -1;
}
}