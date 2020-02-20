export type LayoutItemRect = Readonly<{
    left: number;
    top: number;
    width: number;
    height: number;
}>;

export const placeElement = (measure: string) => (element: HTMLElement, rect: LayoutItemRect) => {
    element.style.position = "absolute";
    element.style.left = rect.left + measure;
    element.style.top = rect.top + measure;
    element.style.width = rect.width + measure;
    element.style.height = rect.height + measure;
}

export const placeElementPercent = placeElement("%");
export const placeElementPixel = placeElement("px");
