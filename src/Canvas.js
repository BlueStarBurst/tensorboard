import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import {
	Checkbox,
	FormControlLabel,
	FormLabel,
	InputLabel,
	Radio,
	RadioGroup,
	Slider,
} from "@mui/material";
import { InputGroup } from "react-bootstrap";

var interval = null;
var x,
	y = 0;

var elementsList = [];

var timer = null;
var busy = false;

export default function Canvas(props) {
	const canvas = React.useRef(null);
	const canvas2 = React.useRef(null);

	const [elements, setElements] = React.useState({});
	const [dragging, setDragging] = React.useState(false);
	const [lining, setLining] = React.useState(false);
	const [selectedElement, setSelectedElement] = React.useState(null);
	const [oldSelectedElement, setOldSelectedElement] = React.useState(null);
	const [isPanning, setIsPanning] = React.useState(false);

	function onKeyboard(e) {
		console.log("KEY", e.key);
		if (e.key == "Escape") {
			if (selectedElement) {
				selectedElement.dragging = false;
			}
			if (oldSelectedElement) {
				oldSelectedElement.dragging = false;
			}
			setDragging(false);
			setLining(false);
			setSelectedElement(null);
			setOldSelectedElement(null);
			props.selectElement(null);
			redrawCanvas();
		} else if (e.key == "Delete") {
			console.log("DELETE", selectedElement, oldSelectedElement);
			if (selectedElement != null) {
				selectedElement.deleteSelf();
				// selectedElement.removeElement();
				var tempElems = elements;
				delete tempElems[selectedElement.id];
				console.log("DELETED", tempElems);
				setElements(tempElems);
				props.updateNotebook(tempElems);
				elementsList = tempElems;
				redrawCanvas();
			} else if (oldSelectedElement != null) {
				oldSelectedElement.deleteSelf();
				// oldSelectedElement.removeElement();
				var tempElems = elements;
				delete tempElems[oldSelectedElement.id];
				console.log("DELETED", tempElems);
				setElements(tempElems);
				props.updateNotebook(tempElems);
				elementsList = tempElems;
				redrawCanvas();
			}
			props.selectElement(null);
		}
		props.setKeyDown(null);
	}

	useEffect(() => {
		if (props.keyDown != null) {
			onKeyboard(props.keyDown);
		}
	}, [props.keyDown]);

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
	}, [elements, selectedElement, oldSelectedElement]);

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
		// console.log(elementsList, elements);
		elementsList = elements;
		const ctx = canvas.current.getContext("2d");
		const w = canvas.current.width * 5;
		const h = canvas.current.height * 5;

		ctx.clearRect(0, 0, w, h);

		Object.keys(elements).forEach((key) => {
			elements[key].drawLines(ctx);
		});
		Object.keys(elements).forEach((key) => {
			console.log("DRAWING", key);
			elements[key].draw(ctx);
		});
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });

	function setBusy(b) {
		busy = b;
	}

	function onMouseDownCanvas(e) {
		// add a new element to the canvas
		var rect = canvas.current.getBoundingClientRect();
		console.log("CLICK", e.clientX, e.clientY, rect.left, rect.top);
		x = (e.clientX - rect.left) * (canvas.current.width / rect.width);
		y = (e.clientY - rect.top) * (canvas.current.height / rect.height);
		setLastMousePos({ x: x, y: y });

		props.setDisableOverlay(true);

		busy = false;

		Object.keys(elements).forEach((key) => {
			var elem = elements[key];
			if (elem.isLining(x, y)) {
				busy = true;
				setBusy(true);
				if (oldSelectedElement) {
					oldSelectedElement.dragging = false;
				}

				elem.dragging = true;
				elem.removeElement();
				elem.element = null;
				elem.lining = true;
				canvas.current.style.cursor = "crosshair";
				setSelectedElement(elem);
				props.selectElement(elem);
				setLining(true);
				redrawCanvas();
				props.updateNotebook(elements);
				return;
			} else if (elem.isDragging(x, y)) {
				busy = true;
				setBusy(true);
				if (oldSelectedElement) {
					oldSelectedElement.dragging = false;
				}

				setSelectedElement(elem);
				props.selectElement(elem);
				elem.dragging = true;
				timer = setTimeout(() => {
					canvas.current.style.cursor = "grabbing";
					setDragging(true);
					redrawCanvas();
					clearTimeout(timer);
					timer = null;
				}, 250);
				return;
			}
		});

		if (busy) return;

		timer = setTimeout(() => {
			clearTimeout(timer);
			timer = null;
		}, 250);
		canvas.current.style.cursor = "grabbing";
		setIsPanning(true);
	}

	useEffect(() => {
		var tx = props.mouseUp[0];
		var ty = props.mouseUp[1];
		console.log("TUP", tx, ty);
		if (tx < 0 || ty < 0 || tx == undefined || ty == undefined) return;
		console.log("TUP", tx, ty);

		console.log("SUCCESS");

		var rect = canvas.current.getBoundingClientRect();
		tx = (tx - rect.left) * (canvas.current.width / rect.width);
		ty = (ty - rect.top) * (canvas.current.height / rect.height);

		var element = new Element(tx, ty, 150, 150, props.currentComponent);
		var tempElements = elements;
		tempElements[props.currentComponent.id] = element;
		setElements(tempElements);
		props.updateNotebook(tempElements);
		elementsList = tempElements;
		setIsPanning(false);
		redrawCanvas();
	}, [props.mouseUp]);

	function onMouseUpCanvas(e) {
		if (timer) {
			setDragging(false);
			clearTimeout(timer);
			timer = null;
			if (isPanning) {
				if (selectedElement) {
					selectedElement.dragging = false;
				}
				if (oldSelectedElement) {
					oldSelectedElement.dragging = false;
				}
				setOldSelectedElement(null);
				props.selectElement(null);
				setIsPanning(false);
				canvas.current.style.cursor = "default";
			} else if (selectedElement) {
				selectedElement.dragging = true;
				setOldSelectedElement(selectedElement);
			}
			redrawCanvas();
			props.setDisableOverlay(false);
			return;
		}

		if (lining) {
			var didLine = false;
			Object.keys(elements).forEach((key) => {
				if (elements[key].isDragging(x, y)) {
					// connect the line to the element
					selectedElement.lineToElement(key);
					props.updateNotebook(elements);
					didLine = true;
				}
			});

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

			setLining(false);
			redrawCanvas();
		} else if (dragging) {
		} else {
		}

		// stop dragging the element
		// if (selectedElement) selectedElement.dragging = false;
		canvas.current.style.cursor = "default";
		setOldSelectedElement(selectedElement);
		// setSelectedElement(null);

		// props.selectElement(null);
		setDragging(false);
		redrawCanvas();
		setIsPanning(false);
		props.setDisableOverlay(false);
	}

	function dragElement(e) {
		if (timer && busy == true) {
			var rect = canvas.current.getBoundingClientRect();
			var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
			var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);
			x = tx;
			y = ty;

			var dist = Math.sqrt(
				(x - lastMousePos.x) ** 2 + (y - lastMousePos.y) ** 2
			);
			if (dist > 10) {
				console.log("TIMER");
				canvas.current.style.cursor = "grabbing";
				setDragging(true);
				redrawCanvas();
				clearTimeout(timer);
				timer = null;
				return;
			}
			return;
		}

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
				onKeyDown={onKeyboard}
				onKeyDownCapture={onKeyboard}
				ref={canvas}
				className="canvas-elem"
				width={props.size.x}
				height={props.size.y}
				onMouseDown={onMouseDownCanvas}
				onMouseUp={onMouseUpCanvas}
				onMouseMove={dragElement}
			/>
			<canvas
				onKeyDown={onKeyboard}
				onKeyDownCapture={onKeyboard}
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
	const [data, setData] = React.useState({});
	const [active, setActive] = React.useState(false);

	const [display, setDisplay] = React.useState(<></>);

	React.useEffect(() => {
		if (props.selectedElement) {
			setComponent(props.selectedElement.component);
			setData(props.selectedElement.component.data);
			setActive(true);
		} else {
			setActive(false);
		}
	}, [props.selectedElement]);

	React.useEffect(() => {
		if (component) {
			setDisplay(
				<>
					<h4>
						{component.name} ({component.id})
					</h4>
					<p>{component.description}</p>
					{Object.keys(data).map((key) => {
						if (data[key].hidden) return <></>;
						switch (data[key].type) {
							case "radio":
								console.log("RADIO");
								return (
									<RadioGroup
										row
										aria-labelledby="demo-radio-buttons-group-label"
										defaultValue={data[key].value || ""}
										name="radio-buttons-group"
										key={key + "radio" + component.id}
										id={key + "radio" + component.id}
										onChange={(e) => {
											updateData(e, key);
										}}
									>
										{data[key].options.map((option) => {
											return (
												<FormControlLabel
													value={option}
													control={<Radio />}
													label={option}
												/>
											);
										})}
									</RadioGroup>
								);
							case "checkbox":
								console.log("CHECKBOX");
								return (
									<FormControlLabel
										key={key + "checkbox" + component.id}
										id="checkbox"
										control={
											<Checkbox
												value={data[key].value == "True" ? true : false}
												defaultChecked={
													data[key].value == "True" ? true : false
												}
												defaultValue={data[key].value == "True" ? true : false}
												onChange={(e) => {
													data[key].value = e.target.checked ? "True" : "False";
													component.data[key] = data[key];
													component.reload();
													props.updateNotebook(elementsList);
													setData({ ...data, [key]: data[key] });
												}}
											/>
										}
										label={key}
									/>
								);
							case "slider":
								console.log("SLIDER");
								return (
									<InputGroup
										className="row"
										key={key + "slider" + component.id}
									>
										<TextField
											autoComplete="off"
											autoCorrect="off"
											key={key + "text" + component.id}
											id="outlined-basic"
											label={key}
											value={data[key].value || 0}
											style={{ width: "20%" }}
											variant="outlined"
											onChange={(e) => {
												// get only leading dashes, digits and dots
												if (data[key].step == 1) {
													e.target.value = e.target.value.replace(
														/[^\d-]/g,
														""
													);
												} else {
													e.target.value = e.target.value.replace(
														/[^\d.-]/g,
														""
													);
												}
												// remove leading zeros
												e.target.value = e.target.value.replace(/^0+/, "");
												updateData(e, key);
											}}
										/>
										<Slider
											key={key + "slider" + component.id}
											aria-label="Default"
											valueLabelDisplay="auto"
											defaultValue={data[key].value || 0}
											value={data[key].value || 0}
											step={data[key].step || 1}
											style={{ width: "75%" }}
											min={data[key].min || -100}
											max={data[key].max || 100}
											onChange={(e, value) => {
												data[key].value = value;
												component.data[key] = data[key];
												component.reload();
												props.updateNotebook(elementsList);
												setData({ ...data, [key]: data[key] });
											}}
										/>
									</InputGroup>
								);
							case "text":
							default:
								return (
									<TextField
										autoComplete="off"
										autoCorrect="off"
										key={key + "text" + component.id}
										id="outlined-basic"
										label={key}
										value={data[key].value || ""}
										variant="outlined"
										disabled={data[key].readonly || false}
										fullWidth
										onChange={(e) => {
											updateData(e, key);
										}}
									/>
								);
						}
					})}
				</>
			);
		} else {
			setDisplay(<></>);
		}
	}, [component, data]);

	function updateData(e, key) {
		var dat = data[key];
		dat.value = e.target.value;
		component.data[key] = dat;
		component.reload();
		props.updateNotebook(elementsList);

		setData({ ...data, [key]: dat });
	}

	return (
		<>
			{" "}
			{component && (
				<div className={active ? "canvas-overlay active" : "canvas-overlay"}>
					<div
						className={
							props.pointer
								? "canvas-overlay-content none_pointer_events"
								: "canvas-overlay-content"
						}
					>
						{display}
					</div>
				</div>
			)}
		</>
	);
}

class Element {
	constructor(x, y, w, h, component = null) {
		this.x = x - w / 2;
		this.y = y - h / 2;
		this.w = w;
		this.h = h;
		this.lineToX = -1;
		this.lineToY = -1;
		this.element = null;
		this.elementId = null;
		this.dragging = false;
		this.color = component.color || "#ff0000";
		this.dragColor = "#fff";
		this.component = component || {};
		this.text = this.component.name;
		this.id = this.component.id;

		console.log("CREATED", this.component);

		if (this.text.length > 5) {
			this.w = Math.max(this.text.length * 25, this.w);
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
		ctx.moveTo(this.x + 20, this.y);
		ctx.lineTo(this.x + this.w - 20, this.y);
		ctx.quadraticCurveTo(this.x + this.w, this.y, this.x + this.w, this.y + 20);
		ctx.lineTo(this.x + this.w, this.y + this.h - 20);
		ctx.quadraticCurveTo(
			this.x + this.w,
			this.y + this.h,
			this.x + this.w - 20,
			this.y + this.h
		);
		ctx.lineTo(this.x + 20, this.y + this.h);
		ctx.quadraticCurveTo(this.x, this.y + this.h, this.x, this.y + this.h - 20);
		ctx.lineTo(this.x, this.y + 20);
		ctx.quadraticCurveTo(this.x, this.y, this.x + 20, this.y);
		ctx.fill();

		// draw a small rectangle at the right center of the element
		if (this.dragging) {
			ctx.fillStyle = this.color;
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.fillRect(this.x + this.w - 10, this.y + this.h / 2 - 10, 20, 20);
		ctx.fillRect(this.x - 10, this.y + this.h / 2 - 10, 20, 20);

		// draw the text
		if (this.dragging) {
			ctx.fillStyle = "#000";
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.font = "25px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);

		// draw the id
		if (this.dragging) {
			ctx.fillStyle = "#000";
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.font = "18px Arial";
		ctx.textAlign = "center";
		ctx.fillText(
			this.component.id,
			this.x + this.w / 2,
			this.y + this.h / 2 + 20
		);
	}

	drawLines(ctx) {
		if (this.element != null) {
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
		if (this.component.id in Object.keys(elementsList[i].component.outputs)) {
			console.log("ALREADY CONNECTED");
			this.element = null;
			this.elementId = null;
			this.lineToX = -1;
			this.lineToY = -1;
			return false;
		}
		console.log(this.component.id);
		this.element = i;
		this.elementId = elementsList[i].component.id;
		this.component.outputs[this.elementId] = elementsList[i].component;
		elementsList[i].component.inputs[this.component.id] = this.component;
		return true;
	}

	removeElement() {
		if (this.element != null) {
			delete elementsList[this.element].component.inputs[this.component.id];
			delete this.component.outputs[this.elementId];
		}
	}

	deleteSelf() {
		var inputs = this.component.inputs;
		var outputs = this.component.outputs;
		Object.keys(inputs).forEach((key) => {
			elementsList[key].element = null;
			elementsList[key].elementId = null;
			elementsList[key].lineToX = -1;
			elementsList[key].lineToY = -1;
			delete inputs[key].outputs[this.component.id];
		});
		Object.keys(outputs).forEach((key) => {
			delete outputs[key].inputs[this.component.id];
		});
	}
}
