import { LayoutItem, LayoutSide, LayoutGroup } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class DragContext {
    constructor(
        readonly item: LayoutItem,
        readonly itemTarget: LayoutItem,
        readonly itemParent: LayoutGroup,
        readonly itemWeight: number,
        readonly shiftX: number,
        readonly shiftY: number,
        readonly width: number,
        readonly height: number) {
    }

    private _element?: HTMLElement;
    private _elementTarget?: HTMLElement;
    private _itemIndex?: number;
    private _dropElement?: HTMLElement;
    private _dropEdge?: LayoutSide;

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
    get dropElement(): HTMLElement {
        return this._dropElement!;
    }
    get dropEdge(): LayoutSide {
        return this._dropEdge!;
    }
    get hasDropTarget(): boolean {
        return !!this._dropElement && this._dropEdge != null;
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

    setDropTarget(dropElement: HTMLElement, dropEdge: LayoutSide): void {
        this._dropElement = dropElement;
        this._dropEdge = dropEdge;
    }

    clearDropTarget(): void {
        this._dropElement = undefined;
        this._dropEdge = undefined;
    }
}