import { visualizeLayout } from "./visualizer";
import { LayoutItem, LayoutDirection } from "./layout";

window.onload = function() {
    const container = document.querySelector("#container") as HTMLElement;

    const layout = new LayoutItem(LayoutDirection.Horizontal, "");
    const item1 = new LayoutItem(LayoutDirection.Vertical, "lightgreen", 1);
    const item2 = new LayoutItem(LayoutDirection.Vertical, "", 2);
    const item3 = new LayoutItem(LayoutDirection.Vertical, "blue", 3);

    const item22 = new LayoutItem(LayoutDirection.Horizontal, "", 1)
    item22.children.push(new LayoutItem(LayoutDirection.Vertical, "yellow", 1));
    item22.children.push(new LayoutItem(LayoutDirection.Vertical, "orange", 2));

    const item23 = new LayoutItem(LayoutDirection.Horizontal, "", 2);
    item23.children.push(new LayoutItem(LayoutDirection.Vertical, "gray", 1));
    item23.children.push(new LayoutItem(LayoutDirection.Vertical, "lightgray", 2));
    item23.children.push(new LayoutItem(LayoutDirection.Vertical, "darkgray", 3));    

    item2.children.push(new LayoutItem(LayoutDirection.Horizontal, "red", 2));
    item2.children.push(item22);
    item2.children.push(item23);

    item3.children.push(new LayoutItem(LayoutDirection.Horizontal, "blue"));
    item3.children.push(new LayoutItem(LayoutDirection.Horizontal, "lightblue"));

    layout.children.push(item1);
    layout.children.push(item2);
    layout.children.push(item3);

    visualizeLayout(layout, container);
};
