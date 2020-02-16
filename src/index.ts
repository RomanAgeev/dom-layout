import { LayoutItem, LayoutDirection, Layout } from "./layout";

window.onload = function() {
    const container = document.querySelector("#container") as HTMLElement;

    const root = new LayoutItem(null, LayoutDirection.Horizontal, "");
    const item1 = new LayoutItem(root, LayoutDirection.Vertical, "lightgreen", 1);
    const item2 = new LayoutItem(root, LayoutDirection.Vertical, "", 2);
    const item3 = new LayoutItem(root, LayoutDirection.Vertical, "blue", 3);

    const item22 = new LayoutItem(item2, LayoutDirection.Horizontal, "", 1)
    item22.children.push(new LayoutItem(item22, LayoutDirection.Vertical, "yellow", 1));
    item22.children.push(new LayoutItem(item22, LayoutDirection.Vertical, "orange", 2));

    const item23 = new LayoutItem(item2, LayoutDirection.Horizontal, "", 2);
    item23.children.push(new LayoutItem(item23, LayoutDirection.Vertical, "gray", 1));
    item23.children.push(new LayoutItem(item23, LayoutDirection.Vertical, "lightgray", 2));
    item23.children.push(new LayoutItem(item23, LayoutDirection.Vertical, "darkgray", 3));

    item2.children.push(new LayoutItem(item2, LayoutDirection.Horizontal, "red", 2));
    item2.children.push(item22);
    item2.children.push(item23);

    item3.children.push(new LayoutItem(item3, LayoutDirection.Horizontal, "blue"));
    item3.children.push(new LayoutItem(item3, LayoutDirection.Horizontal, "lightblue"));

    root.children.push(item1);
    root.children.push(item2);
    root.children.push(item3);

    const layout = new Layout(container, root);
    layout.build();
};
