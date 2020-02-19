import { LayoutGroup, LayoutItem } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class LayoutArranger {
    constructor(
        private readonly _getLeft: (x: number) => number,
        private readonly _getTop: (x: number) => number,
        private readonly _getWidth: (x: number) => number,
        private readonly _getHeight: (x: number) => number) {
    }    

    arrangeGroup(group: LayoutGroup, itemPredicate: (item: LayoutItem) => boolean): Map<LayoutItem, LayoutItemRect> {
        const rects = new Map<LayoutItem, LayoutItemRect>();

        let sum = 0;
        let count = 0;
        for (const [item, weight] of group) {
            if (itemPredicate(item)) {
                sum += weight;
                count++;
            }
        }

        if (count === 0) {
            return rects;
        }
        
        let start = 0;
        for (const [item, weight] of group) {
            if (!itemPredicate(item)) {
                continue;
            }

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