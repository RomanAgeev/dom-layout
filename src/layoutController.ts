import { LayoutRenderer } from "./layoutRenderer";
import { LayoutContext } from "./layoutContext";
import { DragContext } from "./dragContext";
import { placeElementPixel } from "./layoutUtils";

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

    private _dragContext?: DragContext;

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

        const element = document.getElementById(this._context.itemToId(item)!)!;
        const rect = element.getBoundingClientRect();

        this._dragContext = new DragContext(
            item,
            itemTarget,
            e.clientX - rect.left,
            e.clientY - rect.top,
            rect.width,
            rect.height);
    }

    private _mouseMove(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        if (!this._dragContext.isDragging) {
            const item = this._dragContext.item;
            const itemTarget = this._dragContext.itemTarget;

            const element = document.getElementById(this._context.itemToId(item)!);
            const elementTarget = document.getElementById(this._context.itemToId(itemTarget)!);
            if (!element || !elementTarget) {
                this._dragContext = undefined;
                return;
            }

            elementTarget.style.border = "";
            element.style.opacity = "0.7";

            document.body.append(element);

            const parentItem = item.parent!;
            const parentElement = document.getElementById(this._context.itemToId(parentItem)!)!;
            const itemIndex = parentItem.removeItem(item);

            this._renderer.reRenderGroup(parentItem, parentElement, this._context);

            this._dragContext.startDrag(element, elementTarget, itemIndex);
        }

        placeElementPixel(this._dragContext.element!, this._dragContext.getRect(e.pageX, e.pageY));
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        if (!this._dragContext.isDragging) {
            this._dragContext = undefined;
            return;
        }

        this._dragContext.elementTarget!.style.opacity = "";

        const item = this._dragContext.item;
        const itemIndex = this._dragContext.itemIndex!;

        const parentItem = item.parent!;
        const parentElement = document.getElementById(this._context.itemToId(parentItem)!)!;
        parentItem.insertItem(item, itemIndex);

        this._renderer.reRenderGroup(parentItem, parentElement, this._context);

        this._dragContext = undefined;
    }
}