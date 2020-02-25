export const isHTMLElement = (obj: any): obj is HTMLElement => obj && "id" in obj;

export const hideHTMLElement = (element: HTMLElement) => element.style.display = "none";
export const showHTMLElement = (element: HTMLElement) => element.style.display = "";

export function ready(callback: () => void): void {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

