import { LayoutContext } from "./layoutContext";
import { DragContext } from "./dragContext";
import { placeElementPixel } from "./layoutUtils";
import { LayoutSide, isLayoutLeaf } from "./layout";

export class LayoutController {
    constructor(
        private readonly _context: LayoutContext) {
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
            item.parent,
            item.parent.weight(item),
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

            const itemIndex = item.parent!.removeItem(item);

            this._dragContext.startDrag(element, elementTarget, itemIndex);
        }

        placeElementPixel(this._dragContext.element!, this._dragContext.getRect(e.pageX, e.pageY));

        let dropIndicator = document.getElementById("dropIndicator");
        if(dropIndicator) {
            dropIndicator.style.display = "none";
        }
        
        let dropElement: HTMLElement | null = null;

        this._dragContext.element!.style.display = "none";
        try {
            dropElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
            if(!this._context.idToItem(dropElement.id)) {
                dropElement = null;
            }
        }
        finally {
            this._dragContext.element!.style.display = "";
        }

        if (!dropElement) {
            this._dragContext.clearDropTarget();
            return;
        }

        const dropRect = dropElement.getBoundingClientRect();

        const h = dropRect.height;
        const w = dropRect.width;

        if (h === 0 || w === 0) {
            return;
        }

        const x = e.clientX - dropRect.left;
        const y = e.clientY - dropRect.top;

        const k = dropRect.height / dropRect.width;

        const y1 = k * x;
        const y2 = -k * x + h;

        const beforeY1 = y < y1;
        const beforeY2 = y < y2;

        let q1 = beforeY1 && beforeY2;
        let q2 = beforeY1 && !beforeY2;
        let q3 = !beforeY1 && !beforeY2;
        let q4 = !beforeY1 && beforeY2;

        if (!dropIndicator) {
            dropIndicator = document.createElement("div");
            dropIndicator.id = "dropIndicator";
            dropIndicator.style.position = "absolute";
            dropIndicator.style.display = "none";
            dropIndicator.style.border = "5px solid black"
            document.body.append(dropIndicator);
        }

        const dropElementX = dropRect.left + window.pageXOffset;
        const dropElementY = dropRect.top + window.pageYOffset;

        dropIndicator.style.display = "";

        if (q1) {
            dropIndicator.style.left = dropElementX + "px";
            dropIndicator.style.top = dropElementY + "px";
            dropIndicator.style.width = dropElement.clientWidth + "px";
            dropIndicator.style.height = (dropElement.clientHeight / 2) + "px";

            this._dragContext.setDropTarget(dropElement, LayoutSide.Top);
        }
        if (q2) {
            dropIndicator.style.left = dropElementX + (dropElement.clientWidth / 2) + "px";
            dropIndicator.style.top = dropElementY + "px";
            dropIndicator.style.width = (dropElement.clientWidth / 2) + "px";
            dropIndicator.style.height = dropElement.clientHeight + "px";

            this._dragContext.setDropTarget(dropElement, LayoutSide.Right);
        }
        if (q3) {
            dropIndicator.style.left = dropElementX + "px";
            dropIndicator.style.top = dropElementY + (dropElement.clientHeight / 2) + "px";
            dropIndicator.style.width = dropElement.clientWidth + "px";
            dropIndicator.style.height = (dropElement.clientHeight / 2) + "px";

            this._dragContext.setDropTarget(dropElement, LayoutSide.Bottom);
        }
        if (q4) {
            dropIndicator.style.left = dropElementX + "px";
            dropIndicator.style.top = dropElementY + "px";
            dropIndicator.style.width = (dropElement.clientWidth / 2) + "px";
            dropIndicator.style.height = dropElement.clientHeight + "px";

            this._dragContext.setDropTarget(dropElement, LayoutSide.Left);
        }
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        if (!this._dragContext.isDragging) {
            this._dragContext = undefined;
            return;
        }

        let dropIndicator = document.getElementById("dropIndicator");
        if(dropIndicator) {
            dropIndicator.style.display = "none";
        }

        this._dragContext.element!.style.opacity = "";

        const item = this._dragContext.item;

        if (this._dragContext.hasDropTarget) {
            const dropItem = this._context.idToItem(this._dragContext.dropElement.id)!;
            if (isLayoutLeaf(dropItem)) {
                dropItem.insertSide(item, this._dragContext.dropEdge);
            }
        } else {
            const itemIndex = this._dragContext.itemIndex!;
            this._dragContext.itemParent.insertItem(item, itemIndex, this._dragContext.itemWeight);
        }

        this._dragContext = undefined;
    }
}