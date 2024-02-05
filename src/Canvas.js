import React, { useEffect } from "react";

var interval = null;
var x,
	y = 0;

var elementsList = [];

var timer = null;

export default function Canvas(props) {
	const canvas = React.useRef(null);
	const canvas2 = React.useRef(null);

	const [elements, setElements] = React.useState([]);
	const [dragging, setDragging] = React.useState(false);
	const [lining, setLining] = React.useState(false);
	const [selectedElement, setSelectedElement] = React.useState(null);
	const [isPanning, setIsPanning] = React.useState(false);

	React.useEffect(() => {
		if (canvas) {
			redrawCanvas();
			const ctx2 = canvas2.current.getContext("2d");
			drawGrid(ctx2);
		}
	}, [props.size, props.darkMode]);

	React.useEffect(() => {
		if (canvas) {
			redrawCanvas();
		}
	}, [elements]);

	React.useEffect(() => {
		if (dragging || lining) {
			interval = setInterval(() => {
				if (selectedElement) {
					if (dragging) {
						selectedElement.moveTo(x, y);
					} else if (lining) {
						selectedElement.lineTo(x, y);
					}
				}
				redrawCanvas();
			}, 1000 / 60);
		} else {
			clearInterval(interval);
		}
	}, [dragging, lining]);

	function drawGrid(ctx) {
		const r = 2;
		const dist = 30;
		const w = canvas.current.width * 5;
		const h = canvas.current.height * 5;

		ctx.clearRect(0, 0, w, h);

		if (props.darkMode) {
			ctx.fillStyle = "#ffffff25";
		} else {
			ctx.fillStyle = "#00000025";
		}
		for (var i = dist / 2; i < w; i += dist) {
			for (var j = dist / 2; j < h; j += dist) {
				ctx.beginPath();
				ctx.arc(i, j, r, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	function redrawCanvas() {
		// draw the background grid
		console.log(elementsList, elements);
		elementsList = elements;
		const ctx = canvas.current.getContext("2d");
		const w = canvas.current.width * 5;
		const h = canvas.current.height * 5;

		ctx.clearRect(0, 0, w, h);

		for (var i = 0; i < elements.length; i++) {
			elements[i].drawLines(ctx);
		}
		for (var i = 0; i < elements.length; i++) {
			elements[i].draw(ctx);
		}
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	const [oldSelectedElement, setOldSelectedElement] = React.useState(null);

	function onMouseDownCanvas(e) {
		// add a new element to the canvas
		var rect = canvas.current.getBoundingClientRect();
		console.log("CLICK", e.clientX, e.clientY, rect.left, rect.top);
		x = (e.clientX - rect.left) * (canvas.current.width / rect.width);
		y = (e.clientY - rect.top) * (canvas.current.height / rect.height);

		for (var i = 0; i < elements.length; i++) {
			if (elements[i].isLining(x, y)) {
				elements[i].element = null;
				elements[i].lining = true;
				canvas.current.style.cursor = "crosshair";
				setSelectedElement(elements[i]);
				props.selectElement(elements[i]);
				setLining(true);
				redrawCanvas();
				return;
			} else if (elements[i].isDragging(x, y)) {

				if (oldSelectedElement) {
					oldSelectedElement.dragging = false;
				}

				setSelectedElement(elements[i]);
				props.selectElement(elements[i]);
				elements[i].dragging = true;
				timer = setTimeout(() => {
					canvas.current.style.cursor = "grabbing";
					setDragging(true);
					redrawCanvas();
					clearTimeout(timer);
					timer = null;
				}, 250);
				return;
			}
		}
		canvas.current.style.cursor = "grabbing";
		setIsPanning(true);
	}

	useEffect(() => {
		var tx = props.mouseUp[0];
		var ty = props.mouseUp[1];
		console.log("TUP", tx, ty);
		if (tx < 0 || ty < 0) return;
		console.log("TUP", tx, ty);

		var rect = canvas.current.getBoundingClientRect();
		tx = (tx - rect.left) * (canvas.current.width / rect.width);
		ty = (ty - rect.top) * (canvas.current.height / rect.height);

		var element = new Element(
			tx,
			ty,
			100,
			100,
			"#ff0000",
			props.currentComponent
		);
		setElements([...elements, element]);
		elementsList = elements;
		setIsPanning(false);
	}, [props.mouseUp]);

	function onMouseUpCanvas(e) {

		if (timer) {
			clearTimeout(timer);
			timer = null;
			selectedElement.dragging = true;
			setOldSelectedElement(selectedElement);
			redrawCanvas();
			return;
		}

		if (lining) {
			var didLine = false;
			for (var i = 0; i < elements.length; i++) {
				if (elements[i].isDragging(x, y)) {
					// connect the line to the element
					selectedElement.lineToElement(i);
					didLine = true;
					break;
				}
			}

			// stop drawing the line
			if (selectedElement) {
				selectedElement.lining = false;
				if (!didLine) {
					selectedElement.lineToX = -1;
					selectedElement.lineToY = -1;
				}
			}
			selectedElement.lineToY = -1;
			canvas.current.style.cursor = "default";
			setSelectedElement(null);
			props.selectElement(null);
			setLining(false);
			redrawCanvas();
		}

		// stop dragging the element
		if (selectedElement) selectedElement.dragging = false;
		canvas.current.style.cursor = "default";
		setSelectedElement(null);
		props.selectElement(null);
		setDragging(false);
		redrawCanvas();
		setIsPanning(false);
	}

	function dragElement(e) {
		if (dragging) {
			// move the element that is being dragged
			var rect = canvas.current.getBoundingClientRect();
			var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
			var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);

			x = tx;
			y = ty;
		} else if (lining) {
			// draw a line from the element to the mouse position
			var rect = canvas.current.getBoundingClientRect();
			var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
			var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);

			x = tx;
			y = ty;
		} else if (isPanning) {
			props.setIsPanning(true);
			props.panCanvas(e);
		}
	}

	return (
		<>
			<canvas
				ref={canvas}
				className="canvas-elem"
				width={props.size.x}
				height={props.size.y}
				onMouseDown={onMouseDownCanvas}
				onMouseUp={onMouseUpCanvas}
				onMouseMove={dragElement}
			/>
			<canvas
				ref={canvas2}
				className="canvas-elem-abs"
				width={props.size.x}
				height={props.size.y}
			/>
		</>
	);
}

export function CanvasOverlay(props) {
	// overlays a modal that describes the current component
	const [component, setComponent] = React.useState(null);
	const [active, setActive] = React.useState(false);

	React.useEffect(() => {
		if (props.selectedElement) {
			setComponent(props.selectedElement.component);
			setActive(true);
		} else {
			setActive(false);
		}
	}, [props.selectedElement]);

	return (
		<>
			{" "}
			{component && (
				<div className={active ? "canvas-overlay active" : "canvas-overlay"}>
					<div className="canvas-overlay-content">
						<h4>{component.name}</h4>
						<p>{component.description}</p>
						
					</div>
				</div>
			)}
		</>
	);
}

class Element {
	constructor(x, y, w, h, color, component = null) {
		this.x = x - w / 2;
		this.y = y - h / 2;
		this.w = w;
		this.h = h;
		this.lineToX = -1;
		this.lineToY = -1;
		this.element = null;
		this.dragging = false;
		this.color = color;
		this.dragColor = "#00ff00";
		this.component = component || { name: "Test", inputs: [], outputs: [] };
		this.text = this.component.name;

		if (this.text.length > 5) {
			this.w = Math.max(this.text.length * 20, this.w);
		}
	}

	draw(ctx) {
		if (this.dragging) {
			ctx.fillStyle = this.dragColor;
		} else {
			ctx.fillStyle = this.color;
		}
		// round the corners of the rectangle
		ctx.beginPath();
		ctx.moveTo(this.x + 10, this.y);
		ctx.lineTo(this.x + this.w - 10, this.y);
		ctx.quadraticCurveTo(this.x + this.w, this.y, this.x + this.w, this.y + 10);
		ctx.lineTo(this.x + this.w, this.y + this.h - 10);
		ctx.quadraticCurveTo(
			this.x + this.w,
			this.y + this.h,
			this.x + this.w - 10,
			this.y + this.h
		);
		ctx.lineTo(this.x + 10, this.y + this.h);
		ctx.quadraticCurveTo(this.x, this.y + this.h, this.x, this.y + this.h - 10);
		ctx.lineTo(this.x, this.y + 10);
		ctx.quadraticCurveTo(this.x, this.y, this.x + 10, this.y);
		ctx.fill();

		// draw a small rectangle at the right center of the element
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x + this.w - 10, this.y + this.h / 2 - 10, 20, 20);
		ctx.fillRect(this.x - 10, this.y + this.h / 2 - 10, 20, 20);

		// draw the text
		ctx.fillStyle = "#fff";
		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2 + 10);
	}

	drawLines(ctx) {
		if (this.element) {
			this.lineToX = elementsList[this.element].x;
			this.lineToY =
				elementsList[this.element].y + elementsList[this.element].h / 2;
		}

		if (this.lineToX >= 0 && this.lineToY >= 0) {
			// draw a line with bezier curves

			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 4;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(this.x + this.w, this.y + this.h / 2);
			ctx.bezierCurveTo(
				this.x + this.w + 200,
				this.y + this.h / 2,
				this.lineToX - 200,
				this.lineToY,
				this.lineToX,
				this.lineToY
			);
			ctx.stroke();
		}
	}

	isDragging(x, y) {
		return (
			x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
		);
	}

	isLining(x, y) {
		// check if the mouse is over the small rectangle at the right center of the element
		return (
			x >= this.x + this.w - 5 &&
			x <= this.x + this.w + 15 &&
			y >= this.y + this.h / 2 - 5 &&
			y <= this.y + this.h / 2 + 15
		);
	}

	isLiningEnd(x, y) {
		// check if the mouse is over the small rectangle at the left center of the element
		return (
			x >= this.x - 5 &&
			x <= this.x + 15 &&
			y >= this.y + this.h / 2 - 5 &&
			y <= this.y + this.h / 2 + 15
		);
	}

	move(dx, dy) {
		this.x += dx;
		this.y += dy;
	}

	// moveTowards(x, y) {
	// 	// move to the new position smoothly over time
	// 	var dx = (x - this.w / 2 - this.x) / 2;
	// 	var dy = (y - this.h / 2 - this.y) / 2;
	// 	this.move(dx, dy);
	// }

	moveTo(x, y) {
		this.x = x - this.w / 2;
		this.y = y - this.h / 2;
	}

	lineTo(x, y) {
		this.lineToX = x;
		this.lineToY = y;
	}

	lineToElement(i) {
		this.element = i;
	}
}
