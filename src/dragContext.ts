import { LayoutItem, LayoutSide, LayoutGroup } from "./layout";
import { LayoutItemRect, placeElementPixel } from "./layoutUtils";

export class DragContext {
    constructor(
        readonly item: LayoutItem,
        readonly group: LayoutGroup,
        readonly weight: number,
        readonly index: number,
        readonly innerElement: HTMLElement,
        readonly outerElement: HTMLElement,
        readonly shiftX: number,
        readonly shiftY: number,
        readonly width: number,
        readonly height: number) {
    }

    private _isDragging = false;

    dragBy(x: number, y: number): void {
        if (!this._isDragging) {
            this.innerElement.style.border = "";
            this.outerElement.style.opacity = "0.7";
            document.body.append(this.outerElement);
            this.group.removeItem(this.item);
            this._isDragging = true;
        }

        placeElementPixel(this.outerElement, {
            left: x - this.shiftX,
            top: y - this.shiftY,
            width: this.width,
            height: this.height
        });
    }

    hideDragElement(): void {
        this.outerElement.style.display = "none";
    }

    showDragElement(): void {
        this.outerElement.style.display = "";
    }
}