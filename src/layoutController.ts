import { LayoutContext } from "./layoutContext";
import { DragContext } from "./dragContext";
import { placeElementPixel, LayoutItemRect, headerId } from "./layoutUtils";
import { Layout } from "./layout";
import { DropContext } from "./dropContext";
import { hideHTMLElement, showHTMLElement } from "./domUtils";

const dropIndicatorId = "dropIndicator";

export class LayoutController {
    constructor(
        private readonly _layout: Layout,
        private readonly _layoutContext: LayoutContext) {

        this._itemOver = this._itemOver.bind(this);
        this._itemOut = this._itemOut.bind(this);
        this._mouseDown = this._mouseDown.bind(this);
        this._mouseMove = this._mouseMove.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
    }

    private _dragContext?: DragContext;
    private _dropContext?: DropContext;

    activate(): void {
        const rootId = this._layoutContext.itemToId(this._layout.root);
        if (!rootId) {
            throw new Error("TODO");
        }

        const rootElement = document.getElementById(rootId);
        if (!rootElement) {
            throw new Error("TODO");
        }

        rootElement.addEventListener("mouseover", this._itemOver);
        rootElement.addEventListener("mouseout", this._itemOut);
        rootElement.addEventListener("dragstart", (e: DragEvent) => e.preventDefault());
        rootElement.addEventListener("mousedown", this._mouseDown);
        document.addEventListener("mousemove", this._mouseMove);
        document.addEventListener("mouseup", this._mouseUp);
    }

    private _findItemElement(element: HTMLElement | null): HTMLElement | null {
        while (element && (!element.id || !this._layoutContext.idToItem(element.id))) {
            element = element.parentElement;
        }
        return element;
    }

    private _itemOver(e: Event): void {
        if (!e.target) {
            return;
        }

        const itemElement = this._findItemElement(e.target as HTMLElement);

        if (!itemElement) {
            return;
        }

        itemElement.classList.add("hovered");

        e.preventDefault();
    }

    private _itemOut(e: Event): void {
        if (!e.target) {
            return;
        }

        const itemElement = this._findItemElement(e.target as HTMLElement);

        if (!itemElement) {
            return;
        }

        itemElement.classList.remove("hovered");

        e.preventDefault();
    }

    private _mouseDown(e: MouseEvent): void {
        if (!e.target) {
            return;
        }

        const innerElement = this._findItemElement(e.target as HTMLElement);
        if (!innerElement) {
            return;
        }

        const innerId = innerElement.id;

        if (headerId(innerId) !== (e.target as HTMLElement).id) {
            return;
        }

        const innerItem = this._layoutContext.idToItem(innerId);
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

        const outerId = this._layoutContext.itemToId(outerItem);
        if (!outerId) {
            return;
        }

        const outerElement = document.getElementById(outerId);
        if (!outerElement) {
            return;
        }
        
        const rect = outerElement.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        this._dragContext = new DragContext(
            this._layoutContext,
            innerItem,
            outerItem,
            offsetX,
            offsetY,
            rect.width,
            rect.height
        );

        document.body.classList.add("dragging");
    }

    private _mouseMove(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        const innerElement = document.getElementById(this._dragContext.innerId) as HTMLElement;
        const outerElement = document.getElementById(this._dragContext.outerId) as HTMLElement;

        if (!this._dragContext.isDragging) {
            innerElement.classList.remove("hovered");
            outerElement.classList.add("dragged");
            document.body.append(outerElement);

            this._dragContext.beginDrag();
        }

        const dragRect = this._dragContext.calcDragRect(e.pageX, e.pageY);
        placeElementPixel(outerElement, dragRect);

        this._hideDropIndicator();
        
        let dropElement = this._getDropElement(e.clientX, e.clientY);
        if (!dropElement) {
            this._dropContext = undefined;
            return;
        }

        const dropItem = this._layoutContext.idToItem(dropElement.id);
        if (!dropItem) {
            this._dropContext = undefined;
            return;
        }

        if (!this._dropContext || this._dropContext.dropItem !== dropItem) {
            const dropElementRect = dropElement.getBoundingClientRect();
    
            this._dropContext = new DropContext(
                dropItem,
                dropElementRect.left,
                dropElementRect.top,
                dropElementRect.width,
                dropElementRect.height
            );
        }

        this._dropContext.calcDropEdge(e.clientX, e.clientY);

        const dropRect = this._dropContext.calcDropRect(window.pageXOffset, window.pageYOffset);

        this._showDropIndicator(dropRect, this._dragContext.dragColor);
    }

    private _mouseUp(e: MouseEvent): void {
        if (!this._dragContext) {
            return;
        }

        if (!this._dragContext.isDragging) {
            this._dragContext = undefined;
            return;
        }

        this._hideDropIndicator();

        document.body.classList.remove("dragging");

        const innerElement = document.getElementById(this._dragContext.innerId) as HTMLElement;
        const outerElement = document.getElementById(this._dragContext.outerId) as HTMLElement;

        innerElement.classList.add("hovered");
        outerElement.classList.remove("dragged");

        this._dragContext.endDrag(this._dropContext);

        this._dragContext = undefined;
        this._dropContext = undefined;
    }

    private _getDropElement(x: number, y: number): HTMLElement | null {
        if (!this._dragContext) {
            throw new Error("dragContext doesn't exist");
        }

        const outerElement = document.getElementById(this._dragContext.outerId) as HTMLElement;

        hideHTMLElement(outerElement);
        try {
            let dropElement = document.elementFromPoint(x, y);
            if (!dropElement) {
                return null;
            }

            dropElement = this._findItemElement(dropElement as HTMLElement);
            if (!dropElement) {
                return null;
            }

            if(!this._layoutContext.idToItem(dropElement.id)) {
                return null;
            }
            return dropElement as HTMLElement;
        }
        finally {
            showHTMLElement(outerElement);
        }
    }

    private _hideDropIndicator(): void {
        const dropIndicator = document.getElementById(dropIndicatorId);
        if (dropIndicator) {
            hideHTMLElement(dropIndicator);
        }
    }

    private _showDropIndicator(indicatorRect: LayoutItemRect, indicatorColor: string): void {
        let dropIndicator = document.getElementById(dropIndicatorId);
        if (!dropIndicator) {
            dropIndicator = document.createElement("div");
            dropIndicator.id = dropIndicatorId;
            document.body.append(dropIndicator);
        }
        dropIndicator.style.borderColor = indicatorColor;
        showHTMLElement(dropIndicator);
        placeElementPixel(dropIndicator, indicatorRect);
    }
}