import { LayoutSide, LayoutItem } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class DropContext {
    constructor(
        readonly dropItem: LayoutItem,
        private readonly _left: number,
        private readonly _top: number,
        private readonly _width: number,
        private readonly _height: number) {
    }

    private _dropEdge?: LayoutSide;

    get dropEdge(): LayoutSide {
        return this._dropEdge!;
    }

    calcDropEdge(x: number, y: number): void {
        const shiftX = x - this._left;
        const shiftY = y - this._top;

        const k = this._height / this._width;

        const y1 = k * shiftX;
        const y2 = -k * shiftX + this._height;

        const beforeY1 = shiftY < y1;
        const beforeY2 = shiftY < y2;

        if (beforeY1) {
            this._dropEdge = beforeY2 ? LayoutSide.Top : LayoutSide.Right;
        } else {
            this._dropEdge = beforeY2 ? LayoutSide.Left : LayoutSide.Bottom;
        }
    }

    calcDropRect(xOffset: number, yOffset: number): LayoutItemRect {
        const dropElementLeft = this._left + xOffset;
        const dropElementTop = this._top + yOffset;

        switch (this._dropEdge) {
            case LayoutSide.Top:
                return {
                    left: dropElementLeft,
                    top: dropElementTop,
                    width: this._width,
                    height: this._height / 2,
                };

            case LayoutSide.Right:
                return {
                    left: dropElementLeft + (this._width / 2),
                    top: dropElementTop,
                    width: this._width / 2,
                    height: this._height,
                };

            case LayoutSide.Bottom:
                return {
                    left: dropElementLeft,
                    top: dropElementTop + (this._height / 2),
                    width: this._width,
                    height: this._height / 2,
                };

            case LayoutSide.Left:
                return {
                    left: dropElementLeft,
                    top: dropElementTop,
                    width: this._width / 2,
                    height: this._height,
                };

            default:
                throw new Error();
        }
    }
}