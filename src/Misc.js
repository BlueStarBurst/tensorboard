import { Box, TextField } from "@mui/material";
import * as React from "react";
import { useEffect } from "react";

export function DragContainer(props) {
	const [order, setOrder] = React.useState(props.order || []);
	const [draggingObj, setDraggingObj] = React.useState(null);
	const [x, setX] = React.useState(0);
	const [index, setIndex] = React.useState(0);
    const [originalIndex, setOriginalIndex] = React.useState(0);

	useEffect(() => {
		setOrder(props.order);
	}, [props.order]);

    function reorder(id) {
        const newOrder = order.filter((i) => i !== draggingObj);
        var i = index
        if (originalIndex < index) {
            i -= 1;
        }
        newOrder.splice(i, 0, draggingObj);
        setOrder(newOrder);
        setDraggingObj(null);
        props.reorder(newOrder);
    }

	return (
		<Box
			className="drag-container"
			onDragOver={(e) => {
				// console.log("drag over", e);
				setX(e.clientX);
				e.preventDefault();
			}}
			onDrop={(e) => {
				e.preventDefault();
				const id = e.dataTransfer.getData("text/plain");
				console.log("dropped", id);
				reorder(id);
			}}
		>
			{order.map((obj, i) => {
				return (
					<>
						<EmptySpace x={x} draggingObj={draggingObj} id={obj.id} key={obj.id + "e"} index={i} obj={obj} setIndex={setIndex} />
						<DragOption
							x={x}
							key={obj.id}
							setDraggingObj={setDraggingObj}
							draggingObj={draggingObj}
							id={obj.id}
                            obj={obj}
                            index={i}
                            setOriginalIndex={setOriginalIndex}
						>
							
						</DragOption>
					</>
				);
			})}
            <EmptySpace x={x} draggingObj={draggingObj} obj={"help"} id={"id"} index={order.length} setIndex={setIndex} />
		</Box>
	);
}

export function DragOption(props) {
	const [isDragging, setIsDragging] = React.useState(false);

	return (
		<div className={"auto-width " + (isDragging ? "zero-width" : "")}>
			<div
				className={"drag-option " + (isDragging ? "dragging" : "")}
				draggable={true}
				onDragStart={(e) => {
					e.dataTransfer.setData("text/plain", props.id);
					props.setDraggingObj(props.obj);
					setIsDragging(true);
                    props.setOriginalIndex(props.index);
				}}
				onDragEnd={(e) => {
					setIsDragging(false);
					props.setDraggingObj(null);
				}}
			>
				<TextField value={props.obj.value} label={props.obj.id} fullWidth disabled />
			</div>
			<TextField
				className="invisible"
				value={props.obj.value}
				label={props.obj.id}
				disabled
				fullWidth
			/>
		</div>
	);
}

function EmptySpace(props) {
	const [isMouseOver, setIsMouseOver] = React.useState(false);

	const ref = React.useRef(null);

	useEffect(() => {
		if (props.obj === props.draggingObj) {
			setIsMouseOver(false);
			return;
		}
		// if x is within 50 px from the center of the element, set isMouseOver to true
		if (ref.current) {
			// console.log("rect", props.x, ref.current.getBoundingClientRect());
			const rect = ref.current.getBoundingClientRect();
			var dist = Math.max(rect.width / 2, 50);
			if (Math.abs(props.x - (rect.left + rect.width / 2)) < dist) {
				setIsMouseOver(true);
                props.setIndex(props.index);
			} else {
				setIsMouseOver(false);
			}
		}
	}, [props.x, props.draggingObj]);

	return (
		<div
			ref={ref}
			className={
				"auto-width " + ((isMouseOver && props.draggingObj) ? "" : "zero-width")
			}
		>
			<TextField
				className="invisible"
				value={props.draggingObj ? props.draggingObj.value : ""}
				label={props.draggingObj ? props.draggingObj.id : ""}
				fullWidth
				disabled
			/>
		</div>
	);
}
