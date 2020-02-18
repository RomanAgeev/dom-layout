export const isHTMLElement = (obj: any): obj is HTMLElement => obj && "id" in obj;

export function arrangeElement(element: HTMLElement, left: number, top: number, width: number, height: number) {
    element.style.position = "absolute";
    element.style.left = left + "%";
    element.style.top = top + "%";
    element.style.width = width + "%";
    element.style.height = height + "%";
}

export function ready(callback: () => void): void {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

