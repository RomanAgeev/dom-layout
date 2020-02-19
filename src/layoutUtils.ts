export type LayoutItemRect = Readonly<{
    left: number;
    top: number;
    width: number;
    height: number;
}>;

export function placeElement(element: HTMLElement, rect: LayoutItemRect) {
    element.style.position = "absolute";
    element.style.left = rect.left + "%";
    element.style.top = rect.top + "%";
    element.style.width = rect.width + "%";
    element.style.height = rect.height + "%";
}
