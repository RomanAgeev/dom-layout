import { LayoutGroup, LayoutItem } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class LayoutArranger {
    constructor(
        private readonly _getLeft: (x: number) => number,
        private readonly _getTop: (x: number) => number,
        private readonly _getWidth: (x: number) => number,
        private readonly _getHeight: (x: number) => number) {
    }    

    arrangeGroup(group: LayoutGroup): Map<LayoutItem, LayoutItemRect> {
        const rects = new Map<LayoutItem, LayoutItemRect>();

        if (group.count === 0) {
            return rects;
        }

        let sum = 0;
        for (const [_item, weight] of group) {
            sum += weight;
        }
       
        let start = 0;
        for (const [item, weight] of group) {
            const size = weight / sum * 100;

            rects.set(item, {
                left: this._getLeft(start),
                top: this._getTop(start),
                width: this._getWidth(size),
                height: this._getHeight(size),
            });

            start += size;
        }

        return rects;
    }
}