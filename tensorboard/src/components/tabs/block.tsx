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
        event.dataTransfer.setData("componentKey", componentKey);
    }

    return (
        <div
            className="w-max h-max flex items-center justify-center p-6 rounded-lg cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
            style={{
                backgroundColor: component.color,
                margin: "10px"
            }}
            draggable
            onDragStart={dragStartHandler}
        >
            <h1>{component.name}</h1>
        </ div>
    )
}