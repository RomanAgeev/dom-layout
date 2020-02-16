import { LayoutDirection, LayoutGroup } from "./layout";
import { LayoutRenderer } from "./layoutRenderer";

window.onload = function() {
    const container = document.querySelector("#container") as HTMLElement;

    const root = new LayoutGroup(null, LayoutDirection.Horizontal);

    root.addLeaf("lightgreen");
    const group2 = root.addGroup(LayoutDirection.Vertical, 2);
    const group3 = root.addGroup(LayoutDirection.Vertical, 3);

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

    new LayoutRenderer(root).render(container);
};
