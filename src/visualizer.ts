import { LayoutDirection, LayoutItem } from "./layout";
import { identity, constant } from "./utils";

export function visualizeLayout(root: LayoutItem, container: HTMLElement): void {
    if (!root) {
        throw new Error("layout root cannot be null of undefined");
    }
    visualizeItem(root, container);
}

function visualizeItem(item: LayoutItem, container: HTMLElement): void {
    if (!item.children || item.children.length === 0) {
        container.style.background = item.color;
        return;
    }

    const sum = item.children.reduce((acc, child) => acc + child.weight, 0);

    let getLeft: (start: number) => number;
    let getTop: (start: number) => number;
    let getWidth: (size: number) => number;
    let getHeight: (size: number) => number;
    if (item.direction === LayoutDirection.Horizontal) {
        getLeft = identity;
        getTop = constant(0);
        getWidth = identity;
        getHeight = constant(100);
    } else {
        getLeft = constant(0);
        getTop = identity;
        getWidth = constant(100);
        getHeight = identity;
    }

    let start = 0;
    for (const child of item.children) {
        const size = child.weight / sum * 100;

        const element = document.createElement("div");
        element.style.position = "absolute";
        element.style.left = getLeft(start) + "%";
        element.style.top = getTop(start) + "%";
        element.style.width = Math.ceil(getWidth(size)) + "%";
        element.style.height = Math.ceil(getHeight(size)) + "%";
        container.appendChild(element);

        start += size;

        visualizeItem(child, element);
    }
}
