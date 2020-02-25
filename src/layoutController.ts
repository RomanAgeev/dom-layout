import { LayoutContext } from "./layoutContext";
import { DragContext } from "./dragContext";
import { placeElementPixel, LayoutItemRect } from "./layoutUtils";
import { LayoutSide, isLayoutLeaf, LayoutItem, LayoutLeaf } from "./layout";
import { DropContext } from "./dropContext";
import { hideHTMLElement, showHTMLElement } from "./domUtils";

const dropIndicatorId = "dropIndicator";

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

        if (!this._dragContext.isDragging) {
            this._dragContext.beginDrag();
        }

        const dragRect = this._dragContext.calcDragRect(e.pageX, e.pageY);
        placeElementPixel(this._dragContext.dragElement, dragRect);

        this._hideDropIndicator();
        
        let dropElement = this._getDropElement(e.clientX, e.clientY);
        if (!dropElement) {
            this._dropContext = undefined;
            return;
        }

        if (!this._dropContext || this._dropContext.dropElement !== dropElement) {
            const dropElementRect = dropElement.getBoundingClientRect();
            if (dropElementRect.width === 0 || dropElementRect.height === 0) {
                this._dropContext = undefined;
                return;
            }
    
            this._dropContext = new DropContext(
                dropElement,
                dropElementRect.left,
                dropElementRect.top,
                dropElementRect.width,
                dropElementRect.height
            );
        }

        this._dropContext.calcDropEdge(e.clientX, e.clientY);

        const dropRect = this._dropContext.calcDropRect(window.pageXOffset, window.pageYOffset);
        this._showDropIndicator(dropRect);
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        this._hideDropIndicator();

        let dropLeaf: LayoutLeaf | undefined = undefined;
        if (this._dropContext) {
            const dropItem = this._context.idToItem(this._dropContext.dropElement.id);
            if (dropItem && isLayoutLeaf(dropItem)) {
                dropLeaf = dropItem;
            }
        }

        if (dropLeaf) {
            this._dragContext.endDrag(dropLeaf, this._dropContext!.dropEdge);
        } else {
            this._dragContext.cancelDrag();
        }

        this._dragContext = undefined;
        this._dropContext = undefined;
    }

    private _getDropElement(x: number, y: number): HTMLElement | null {
        if (!this._dragContext) {
            throw new Error("dragContext doesn't exist");
        }

        hideHTMLElement(this._dragContext.dragElement);
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
            showHTMLElement(this._dragContext.dragElement);
        }
    }

    private _hideDropIndicator(): void {
        const dropIndicator = document.getElementById(dropIndicatorId);
        if (dropIndicator) {
            hideHTMLElement(dropIndicator);
        }
    }

    private _showDropIndicator(indicatorRect: LayoutItemRect): void {
        let dropIndicator = document.getElementById(dropIndicatorId);
        if (!dropIndicator) {
            dropIndicator = document.createElement("div");
            dropIndicator.id = dropIndicatorId;
            document.body.append(dropIndicator);
        }
        showHTMLElement(dropIndicator);
        placeElementPixel(dropIndicator, indicatorRect);
    }
}