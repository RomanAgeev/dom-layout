import { LayoutSide, LayoutItem } from "./layout";
import { LayoutItemRect, placeElementPixel } from "./layoutUtils";

export class DropContext {
    constructor(
        readonly dropElement: HTMLElement,
        readonly left: number,
        readonly top: number,
        readonly width: number,
        readonly height: number) {
    }

    private _dropEdge?: LayoutSide;

    get dropEdge(): LayoutSide {
        return this._dropEdge!;
    }

    calcDropEdge(x: number, y: number): void {
        const shiftX = x - this.left;
        const shiftY = y - this.top;

        const k = this.height / this.width;

        const y1 = k * shiftX;
        const y2 = -k * shiftX + this.height;

        const beforeY1 = shiftY < y1;
        const beforeY2 = shiftY < y2;

        if (beforeY1) {
            this._dropEdge = beforeY2 ? LayoutSide.Top : LayoutSide.Right;
        } else {
            this._dropEdge = beforeY2 ? LayoutSide.Left : LayoutSide.Bottom;
        }
    }

    calcDropRect(xOffset: number, yOffset: number): LayoutItemRect {
        const dropElementLeft = this.left + xOffset;
        const dropElementTop = this.top + yOffset;

        switch (this._dropEdge) {
            case LayoutSide.Top:
                return {
                    left: dropElementLeft,
                    top: dropElementTop,
                    width: this.width,
                    height: this.height / 2,
                };

            case LayoutSide.Right:
                return {
                    left: dropElementLeft + (this.width / 2),
                    top: dropElementTop,
                    width: this.width / 2,
                    height: this.height,
                };

            case LayoutSide.Bottom:
                return {
                    left: dropElementLeft,
                    top: dropElementTop + (this.height / 2),
                    width: this.width,
                    height: this.height / 2,
                };

            case LayoutSide.Left:
                return {
                    left: dropElementLeft,
                    top: dropElementTop,
                    width: this.width / 2,
                    height: this.height,
                };

            default:
                throw new Error();
        }
    }
}