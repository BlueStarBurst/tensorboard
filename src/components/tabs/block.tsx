import { Component } from "../blocks";

export default function Block({
    key,
    componentKey,
    component
}: {
    key: number;
    componentKey: string;
    component: Component;
}) {

    function dragStartHandler(event: React.DragEvent) {
        console.log("dragging", componentKey);
        event.dataTransfer.setData("componentKey", componentKey);
    }

    return (
        <div
            className="w-max h-max flex items-center justify-center p-5 rounded-lg cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
            style={{
                backgroundColor: component.color,
                margin: "6px"
            }}
            draggable
            onDragStart={dragStartHandler}
            onDrag={dragStartHandler}
            onDragCapture={dragStartHandler}
        >
            <h1 className="text-sm">{component.name}</h1>
        </ div>
    )
}