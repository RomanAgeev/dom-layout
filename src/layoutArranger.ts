import { LayoutGroup, LayoutItem } from "./layout";
import { LayoutItemRect } from "./layoutUtils";

export class LayoutArranger {
    constructor(
        private readonly _getLeft: (x: number) => number,
        private readonly _getTop: (x: number) => number,
        private readonly _getWidth: (x: number) => number,
        private readonly _getHeight: (x: number) => number) {
    }    

    arrangeGroup(group: LayoutGroup): { item: LayoutItem | null, rect: LayoutItemRect }[] {
        const rects: { item: LayoutItem | null, rect: LayoutItemRect }[] = [];

        if (group.count === 0) {
            return rects;
        }

        let sum = 0;
        for (const [_item, weight] of group) {
            sum += weight;
        }

        const totalPercent = 100 - group.count + 1;
       
        let start = 0;
        for (const [item, weight] of group) {
            if (start > 0) {
                const separatorRect = {
                    left: this._getLeft(start),
                    top: this._getTop(start),
                    width: this._getWidth(1),
                    height: this._getHeight(1),
                };

                rects.push({ item: null, rect: separatorRect });

                start++;
            }

            const size = weight / sum * totalPercent;

            const rect: LayoutItemRect = {
                left: this._getLeft(start),
                top: this._getTop(start),
                width: this._getWidth(size),
                height: this._getHeight(size),
            };

            rects.push({item, rect });

            start += size;
        }

        return rects;
    }
}