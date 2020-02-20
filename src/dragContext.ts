import { LayoutItem } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class DragContext {
    constructor(
        readonly item: LayoutItem,
        readonly itemTarget: LayoutItem,
        readonly shiftX: number,
        readonly shiftY: number,
        readonly width: number,
        readonly height: number) {
    }

    private _element?: HTMLElement;
    private _elementTarget?: HTMLElement;
    private _itemIndex?: number;

    get element(): HTMLElement | undefined {
        return this._element;
    }
    get elementTarget(): HTMLElement | undefined {
        return this._elementTarget;
    }
    get itemIndex(): number | undefined {
        return this._itemIndex;
    }
    get isDragging(): boolean {
        return !!this._element && !!this._elementTarget;
    }

    startDrag(element: HTMLElement, elementTarget: HTMLElement, itemIndex: number): void {
        this._element = element;
        this._elementTarget = elementTarget;
        this._itemIndex = itemIndex;
    }

    getRect(x: number, y: number): LayoutItemRect {
        return {
            left: x - this.shiftX,
            top: y - this.shiftY,
            width: this.width,
            height: this.height
        };
    }
}