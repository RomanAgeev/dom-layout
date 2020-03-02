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

    group22.addLeaf("gold");
    group22.addLeaf("orange", 2);
    group23.addLeaf("black");
    group23.addLeaf("gray", 2);
    group23.addLeaf("darkgray", 3);

    group3.addLeaf("blue");
    group3.addLeaf("lightblue");

    const itemRender: ItemRender = (payload: unknown, container: HTMLElement): void => {        
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        const textElement = document.createElement("span");
        textElement.classList.add("card-text");
        textElement.innerText = payload as string;
        textElement.style.color = payload as string;
        cardElement.append(textElement);

        container.append(cardElement);
    };

    new LayoutRenderer(layout, itemRender, "ra-layout-large").render(container);
    new LayoutRenderer(layout, itemRender, "ra-layout-small").render(container2);
});
