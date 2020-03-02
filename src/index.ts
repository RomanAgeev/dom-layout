import { LayoutDirection, Layout } from "./layout";
import { LayoutRenderer, ItemRender } from "./layoutRenderer";
import { ready } from "./domUtils";

ready(() => {
    const container = document.getElementById("container")!;
    const container2 = document.getElementById("container2")!;

    const layout = new Layout(LayoutDirection.Horizontal);

    layout.root.addLeaf("lightgreen");
    const group2 = layout.root.addGroup(LayoutDirection.Vertical, 2);
    const group3 = layout.root.addGroup(LayoutDirection.Vertical, 3);

    group2.addLeaf("red", 2);
    const group22 = group2.addGroup(LayoutDirection.Horizontal);
    const group23 = group2.addGroup(LayoutDirection.Horizontal, 2);

    group22.addLeaf("yellow");
    group22.addLeaf("orange", 2);
    group23.addLeaf("gray");
    group23.addLeaf("lightgray", 2);
    group23.addLeaf("darkgray", 3);

    group3.addLeaf("blue");
    group3.addLeaf("lightblue");

    const itemRender: ItemRender = (payload: unknown, container: HTMLElement): void => {
        const element = document.createElement("div");
        element.style.width = "100%";
        element.style.height = "100%";
        element.style.overflow = "hidden";
        element.style.textOverflow = "hidden";
        element.textContent = payload as string;
        element.style.textAlign = "center";
        container.append(element);
    };

    new LayoutRenderer(layout, itemRender, "ra-layout-large").render(container);
    new LayoutRenderer(layout, itemRender, "ra-layout-small").render(container2);
});
