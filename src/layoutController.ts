import { LayoutContext } from "./layoutContext";
import { DragContext } from "./dragContext";
import { placeElementPixel, LayoutItemRect } from "./layoutUtils";
import { LayoutSide, isLayoutLeaf } from "./layout";
import { DropContext } from "./dropContext";

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
    private _dropContext?: DropContext;

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

        const innerElement = e.target as HTMLElement;
        const innerId = innerElement.id;

        const innerItem = this._context.idToItem(innerId);
        if (!innerItem) {
            return;
        }

        let outerItem = innerItem;
        while (outerItem.parent && outerItem.parent.count < 2) {
            outerItem = outerItem.parent;
        }
        if (outerItem.parent === null) {
            return;
        }

        const outerId = this._context.itemToId(outerItem);
        if (!outerId) {
            return;
        }

        const outerElement = document.getElementById(outerId);
        if (!outerElement) {
            return;
        }
        
        const rect = outerElement.getBoundingClientRect();

        this._dragContext = new DragContext(
            outerItem,
            outerItem.parent,
            outerItem.parent.weight(outerItem),
            outerItem.parent.index(outerItem),
            innerElement,
            outerElement,
            e.clientX - rect.left,
            e.clientY - rect.top,
            rect.width,
            rect.height
        );
    }

    private _mouseMove(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        this._dragContext.dragBy(e.pageX, e.pageY);

        this._hideDropIndicator();
        
        let dropElement = this._getDropElement(e.clientX, e.clientY);
        if (!dropElement) {
            this._dropContext = undefined;
            return;
        }

        const dropElementRect = dropElement.getBoundingClientRect();
        if (dropElementRect.width === 0 || dropElementRect.height === 0) {
            this._dropContext = undefined;
            return;
        }

        if (!this._dropContext || this._dropContext.dropElement !== dropElement) {
            this._dropContext = new DropContext(
                dropElement,
                dropElementRect.left,
                dropElementRect.top,
                dropElementRect.width,
                dropElementRect.height
            );
        }

        this._dropContext.calcDropEdge(e.clientX, e.clientY);

        const indicatorRect = this._dropContext.calcDropRect(window.pageXOffset, window.pageYOffset);
        this._showDropIndicator(indicatorRect);
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        const item = this._dragContext.item;

        this._dragContext.outerElement.style.opacity = "";

        this._hideDropIndicator();

        if (this._dropContext) {
            const dropItem = this._context.idToItem(this._dropContext.dropElement.id)!;
            if (isLayoutLeaf(dropItem)) {
                dropItem.insertSide(item, this._dropContext.dropEdge);
            }

        } else {
            const itemIndex = this._dragContext.index;
            this._dragContext.group.insertItem(item, itemIndex, this._dragContext.weight);
        }

        this._dragContext = undefined;
        this._dropContext = undefined;
    }

    private _getDropElement(x: number, y: number): HTMLElement | null {
        this._dragContext!.hideDragElement();
        try {
            let dropElement = document.elementFromPoint(x, y);
            if (!dropElement) {
                return null;
            }
            if(!this._context.idToItem(dropElement.id)) {
                return null;
            }
            return dropElement as HTMLElement;
        }
        finally {
            this._dragContext!.showDragElement();
        }
    }

    private _hideDropIndicator(): void {
        const dropIndicator = document.getElementById("dropIndicator");
        if (dropIndicator) {
            dropIndicator.style.display = "none";
        }
    }

    private _showDropIndicator(indicatorRect: LayoutItemRect): void {
        let dropIndicator = document.getElementById("dropIndicator");
        if (!dropIndicator) {
            dropIndicator = document.createElement("div");
            dropIndicator.id = "dropIndicator";
            dropIndicator.style.border = "5px solid black"
            document.body.append(dropIndicator);
        }
        dropIndicator.style.display = "";
        placeElementPixel(dropIndicator, indicatorRect);
    }
}