import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactDOM from "react-dom";

import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
hljs.registerLanguage("python", python);

import "highlight.js/styles/tokyo-night-dark.css";

import Canvas, { CanvasOverlay } from "./Canvas.js";

import "./styles.css";
import { DBManager } from "./component.js";
import { Button, CssBaseline, ThemeProvider, createTheme } from "@mui/material";

var w = localStorage.getItem("w") || 50;
var h = localStorage.getItem("h") || 0;

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

// get local storage for dark mode
var darkMode = localStorage.getItem("darkMode");
if (darkMode === null) {
	darkMode = true;
	localStorage.setItem("darkMode", darkMode);
} else {
	darkMode = darkMode === "true";
}

function setDarkTheme(isDark) {
	if (isDark) {
		document.documentElement.style.setProperty("--bg-color", "#182031");
		document.documentElement.style.setProperty("--text-color", "#b0b0b0");
		document.documentElement.style.setProperty("--canvas-color", "#1c2a43");
	} else {
		document.documentElement.style.setProperty("--bg-color", "#fff");
		document.documentElement.style.setProperty("--text-color", "#000");
		document.documentElement.style.setProperty("--canvas-color", "#00000004");
	}
	localStorage.setItem("darkMode", isDark);
	darkMode = isDark;
}

var pixelL = localStorage.getItem("pixelL") || 10;

var mouseXext = 0;
var mouseYext = 0;

setDarkTheme(darkMode);

document.documentElement.style.setProperty("--mouse-x", w + "%");

const canvasSize = { x: 3000, y: 3000 };
const canvasSize2 = { x: 2000, y: 2000 };

function App() {
	const [darkThemes, setDarkThemes] = React.useState(false);

	const [isResizing, setIsResizing] = React.useState(false);

	const [mouseX, setMouseX] = React.useState(0);
	const [mouseY, setMouseY] = React.useState(0);

	const [panel, setPanel] = React.useState("tools");
	const [isDragging, setIsDragging] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	const [panelContent, setPanelContent] = React.useState(<Tools />);
	const [items, setItems] = React.useState(DBManager.getInstance().getItems());
	const [currentComponent, setCurrentComponent] = React.useState(null);

	const [webPointer, setWebPointer] = React.useState(false);

	const [components, setComponents] = React.useState({
		Data: {
			name: "Data",
			description:
				"This component is used to download data from a remote URL for model training",
			data: {
				Type: {
					type: "radio",
					options: ["HuggingFace", "Zip"],
					value: "HuggingFace",
				},
				URL: {
					type: "text",
					value: "",
				},
			},
			transpile: function () {
				return `print('Downloading data from ${this.data.URL.value}')\nprint("hello")\nfor i in range(10):\n\tprint(i)`;
			},
		},
		Normalize: {
			name: "Normalize",
			data: {
				Type: {
					type: "text",
					value: "",
				},
			},
			transpile: function () {
				return `print('Normalizing data')`;
			},
		}
	});

	const canvasOverlay = React.useRef(null);

	function setMouseCoords(e) {
		setMouseX(e.clientX);
		setMouseY(e.clientY);
		mouseXext = e.clientX;
		mouseYext = e.clientY;
		if (isResizing) {
			resizeTools(e);
		}
	}

	function resizeTools(e) {
		// set css variable --mouse-x to the mouse x position
		// console.log(e);
		pixelL = e.clientX;
		var parentWidth = e.target.parentElement.clientWidth;
		var parentHeight = e.target.parentElement.clientHeight;
		console.log((e.clientX / parentWidth) * 100);
		w = (e.clientX / parentWidth) * 100;
		document.documentElement.style.setProperty("--pointer-events", "none");
		document.documentElement.style.setProperty(
			"--mouse-x",
			(e.clientX / parentWidth) * 100 + "%"
		);
		document.documentElement.style.setProperty(
			"--mouse-y",
			(e.clientY / parentHeight) * 100 + "%"
		);
		// setCanvasWidth(e.clientX);
		// setCanvasHeight(canvasContainer.current.clientHeight);

		refreshCanvasWidth();
	}

	function refreshCanvasWidth() {
		var canvas =
			canvasContainer.current.children[
				canvasContainer.current.children.length - 1
			];
		var canvas2 = canvasContainer.current.children[0];

		var newWidth = Math.max(
			canvas.clientWidth,
			(window.innerWidth * w) / 100 - 20
			// 1
		);
		var newHeight = Math.max(
			canvas.clientHeight,
			(window.innerWidth * w) / 100 - 20
			// 1
		);

		// resize the canvas element by the delta
		canvas.style.width = newWidth + "px";
		canvas.style.height = newHeight + "px";
		canvas2.style.width = newWidth + "px";
		canvas2.style.height = newHeight + "px";
		if (canvasOverlay.current) {
			canvasOverlay.current.style.width = newWidth + "px";
			canvasOverlay.current.style.height = newHeight + "px";
		}

		// save to local storage
		localStorage.setItem("canvasWidth", newWidth);
		localStorage.setItem("canvasHeight", newHeight);

		// save scroll position
		localStorage.setItem("scrollX", canvasContainer.current.scrollLeft);
		localStorage.setItem("scrollY", canvasContainer.current.scrollTop);
	}

	function onKeyPressed(e) {
		// console.log('onKeyDown', e);
		// get ig b is pressed
		if (e.key === "b") {
			console.log("b");
			console.log(darkThemes);
			setDarkThemes(!darkMode);
			setDarkTheme(!darkMode);
		}
	}

	const canvasContainer = React.useRef(null);

	function mouseUp(e) {
		console.log("mouseUp");
		setIsResizing(false);
		setWebPointer(false);
		setIsPanning(false);
		setIsDragging(false);
		// save w and h to local storage

		// get all children of the element with id "parent" and add the transition-width class
		var children = document.getElementById("parent").children;
		for (var i = 0; i < children.length; i++) {
			children[i].classList.add("transition-width");
		}

		if (w > 80 + 20 / 2) {
			document.documentElement.style.setProperty("--mouse-x", 99.99 + "%");
			w = 99.99;
		} else if (w > 80) {
			document.documentElement.style.setProperty("--mouse-x", 80 + "%");
			w = 80;
			// } else if (w < 60 && w > 40) {
			// 	document.documentElement.style.setProperty("--mouse-x", 60 + "%");
			// 	w = 60;
		} else if (w < 20) {
			document.documentElement.style.setProperty("--mouse-x", 20 + "%");
			w = 20;
		}

		localStorage.setItem("w", w);
		localStorage.setItem("h", h);

		document.documentElement.style.setProperty("--pointer-events", "all");
		document.documentElement.style.setProperty("--cursor", "auto");
		refreshCanvasWidth();
	}

	const [isPanning, setIsPanning] = React.useState(false);

	function panCanvas(e) {
		// pan the canvasContainer wheen the mouse is down and moving
		// console.log('panCanvas', e);

		if (!isPanning) {
			return;
		}
		document.documentElement.style.setProperty("--cursor", "grabbing");
		// set the canvas container scroll position
		canvasContainer.current.scrollLeft -= e.movementX;
		canvasContainer.current.scrollTop -= e.movementY;
		// canvasContainer.current.scrollTo({
		// 	top: canvasContainer.current.scrollTop - e.movementY,
		// 	left: canvasContainer.current.scrollLeft - e.movementX,
		// 	behavior: "smooth",
		// });
	}

	useEffect(() => {
		document.addEventListener("keydown", onKeyPressed);

		// prevent wheel scrolling on the canvasContainer element
		canvasContainer.current.addEventListener("wheel", zoomContainer, {
			passive: false,
		});

		var canvas =
			canvasContainer.current.children[
				canvasContainer.current.children.length - 1
			];
		const canvas2 = canvasContainer.current.children[0];

		if (localStorage.getItem("canvasWidth") === null) {
			localStorage.setItem("canvasWidth", canvas.clientWidth);
			localStorage.setItem("canvasHeight", canvas.clientHeight);
		}

		setDarkThemes(darkMode);

		// set the canvas width and height
		console.log("canvasWidth", localStorage.getItem("canvasWidth"));
		canvas.style.width = localStorage.getItem("canvasWidth") + "px";
		canvas.style.height = localStorage.getItem("canvasHeight") + "px";
		canvas2.style.width = localStorage.getItem("canvasWidth") + "px";
		canvas2.style.height = localStorage.getItem("canvasHeight") + "px";

		// set the canvasContainer scroll position
		canvasContainer.current.scrollLeft = localStorage.getItem("scrollX") || 0;
		canvasContainer.current.scrollTop = localStorage.getItem("scrollY") || 0;

		// setCanvasWidth(localStorage.getItem('canvasWidth') || 300);
		// setCanvasHeight(canvasContainer.current.clientHeight);

		return () => {
			document.removeEventListener("keydown", onKeyPressed);
		};
	}, []);

	useEffect(() => {
		if (isDragging == false && isCreating == true) {
			createItem();
			setIsCreating(false);
		}
	}, [isDragging]);

	const [refresh, setRefresh] = React.useState(false);
	useEffect(() => {
		refreshCanvasWidth();
	}, [items]);

	function preventDefault(e) {
		console.log("preventDefault");
		e.preventDefault();
	}

	function zoomContainer(e) {
		e.preventDefault();
		// console.log(e.clientX, e.clientY);
		// zoom in where the mouse is
		var mouseX =
			e.clientX -
			canvasContainer.current.offsetLeft +
			canvasContainer.current.scrollLeft;
		var mouseY =
			e.clientY -
			canvasContainer.current.offsetTop +
			canvasContainer.current.scrollTop;
		// get the delta
		var delta = -1 * e.deltaY || e.detail || e.wheelDelta;

		// get the child of the canvasContainer element
		var canvas =
			canvasContainer.current.children[
				canvasContainer.current.children.length - 1
			];
		var canvas2 = canvasContainer.current.children[0];

		// get the new width and height
		var newWidth = Math.max(
			canvas.clientWidth + delta,
			(window.innerWidth * w) / 100 - 20
			// 1
		);
		var newHeight = Math.max(
			canvas.clientHeight + delta,
			(window.innerWidth * w) / 100 - 20
			// 1
		);

		console.log(newWidth, newHeight);

		// set the new width and height
		newWidth = Math.min(newWidth, canvasSize2.x);
		newHeight = Math.min(newHeight, canvasSize2.y);

		// resize the canvas element by the delta
		canvas.style.width = newWidth + "px";
		canvas.style.height = newHeight + "px";
		canvas2.style.width = newWidth + "px";
		canvas2.style.height = newHeight + "px";

		if (delta > 0) {
			// set the scroll position so that the mouse position is the same
			canvasContainer.current.scrollLeft += (mouseX * delta) / newWidth;
			canvasContainer.current.scrollTop += (mouseY * delta) / newHeight;
		} else {
			// set the scroll position so that the mouse position is the same
			// canvasContainer.current.scrollLeft -= (mouseX * delta) / newWidth;
			// canvasContainer.current.scrollTop -= (mouseY * delta) / newHeight;
		}

		if (canvasOverlay.current) {
			canvasOverlay.current.style.width = newWidth + "px";
			canvasOverlay.current.style.height = newHeight + "px";
		}
		refreshCanvasWidth();
	}

	const [canvasMouseUp, setCanvasMouseUp] = React.useState([-1, -1]);

	function createItem(ax, ay) {
		if (isCreating) {
			setCanvasMouseUp([ax, ay]);
		}
	}

	function getNewId() {
		var id = Math.floor(Math.random() * 1000000000);
		while (id in Object.keys(items)) {
			id = Math.floor(Math.random() * 1000000000);
		}
		return id;
	}

	const [cells, setCells] = React.useState([]);

	const [start, setStart] = React.useState(`{"cells": `);
	const [end, setEnd] = React.useState(
		`,"metadata": {"kernelspec": {"display_name": "Python 3","language": "python","name": "python3"},"language_info": {"codemirror_mode": {"name": "ipython","version": 3},"file_extension": ".py","mimetype": "text/x-python","name": "python","nbconvert_exporter": "python","pygments_lexer": "ipython3","version": "3.10.13"},"colab": {"provenance": []}},"nbformat": 4,"nbformat_minor": 0}`
	);

	const [webSelected, setWebSelected] = React.useState(false);

	useEffect(() => {
		setWebSelected(false);
		if (panel == "tools") {
			setPanelContent(
				<Tools
					mouseX={mouseX}
					mouseY={mouseY}
					isDragging={isDragging}
					setIsDragging={setIsDragging}
				/>
			);
		} else if (panel == "notebook") {
			setPanelContent(<Notebook cells={cells} start={start} end={end} />);
		} else if (panel == "raw") {
			setPanelContent(
				<Raw value={start + JSON.stringify(cells, null, 4) + end}></Raw>
			);
		} else if (panel == "web") {
			setPanelContent(<></>);
			setWebSelected(true);
		}
	}, [panel]);

	const [selectedElement, setSelectedElement] = React.useState(null);
	function selectElement(element) {
		setSelectedElement(element);
	}

	useEffect(() => {
		// parse the components into JSON cells
		var tcells = [];
		Object.keys(components).map((key, index) => {
			var raw_python = components[key].transpile();
			// split by new line
			raw_python = raw_python.split("\n");
			// add a new line to the end of each line
			raw_python = raw_python.map((line) => {
				return line + "\n";
			});

			tcells.push({
				cell_type: "code",
				execution_count: 1,
				metadata: {},
				outputs: [],
				source: raw_python,
			});
		});
		console.log(tcells);
		setCells(tcells);
	}, [components]);

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<div
				className="rows"
				id="parent"
				onMouseMove={setMouseCoords}
				onMouseUp={(e) => {
					createItem(e.clientX, e.clientY);
					mouseUp(e);
				}}
			>
				<CanvasOverlay selectedElement={selectedElement} />
				<div
					className="canvas"
					// onMouseMove={panCanvas}
					// onKeyDown={onKeyPressed}
					// onMouseDown={(e) => {
					// setIsPanning(true);
					// }}
					ref={canvasContainer}
				>
					<Canvas
						darkMode={darkThemes}
						size={canvasSize}
						mouseUp={canvasMouseUp}
						panCanvas={panCanvas}
						setIsPanning={setIsPanning}
						currentComponent={currentComponent}
						selectElement={selectElement}
					/>

					{/* <Canvas canvasHeight={canvasHeight} canvasWidth={canvasWidth} isOverride={isResizing} /> */}
				</div>
				<div
					className="slider"
					onMouseDown={(e) => {
						e.preventDefault();
						setIsResizing(true);
						setWebPointer(true);
						var children = document.getElementById("parent").children;
						for (var i = 0; i < children.length; i++) {
							children[i].classList.remove("transition-width");
						}
					}}
				></div>
				<div className="right-panel">
					<div className="right-panel-header">
						<div
							className={
								"right-panel-header-option " +
								(panel == "tools" ? "selected" : "")
							}
							onClick={(e) => {
								setPanel("tools");
							}}
						>
							<h5>Tools</h5>
						</div>

						<div
							className={
								"right-panel-header-option " +
								(panel == "raw" ? "selected" : "")
							}
							onClick={(e) => {
								setPanel("raw");
							}}
						>
							<h5>Raw</h5>
						</div>

						<div
							className={
								"right-panel-header-option " +
								(panel == "notebook" ? "selected" : "")
							}
							onClick={(e) => {
								setPanel("notebook");
							}}
						>
							<h5>Notebook</h5>
						</div>

						<div
							className={
								"right-panel-header-option " +
								(panel == "web" ? "selected" : "")
							}
							onClick={(e) => {
								setPanel("web");
							}}
						>
							<h5>Web</h5>
						</div>

						<div className="filler" />
					</div>

					{panel == "tools" ? (
						<div className="tools">
							{/* <p>Components</p> */}
							{Object.keys(components).map((key, index) => {
								return (
									<DraggableTemplate
										key={index}
										mouseX={mouseX}
										mouseY={mouseY}
										isDragging={isDragging}
										setIsDragging={setIsDragging}
										setIsCreating={setIsCreating}
										setCurrentComponent={setCurrentComponent}
										component={components[key]}
									>
										{components[key].name}
									</DraggableTemplate>
								);
							})}
						</div>
					) : (
						panelContent
					)}
					<div
						className={
							webSelected
								? webPointer
									? "web-container web-pointer"
									: "web-container"
								: "web-container web-hidden"
						}
					>
						<Web />
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}

function Tools(props) {
	return null;
}

function Notebook(props) {
	return (
		<div className="notebook-container">
			<div className="cell-container">
				{props.cells.map((cell, index) => {
					if (index == props.cells.length - 1) {
						setTimeout(() => {
							hljs.highlightAll();
						}, 1);
					}

					return (
						<div key={index} className="cell">
							<div className="cell-line" key={index}>
								<p className="cell-index">[{index + 1}]: </p>
								<pre style={{ width: "100%" }}>
									<code>
										{cell.source.map((line, i) => {
											return <div className="cell-code">{line}</div>;
										})}
									</code>
								</pre>
							</div>
						</div>
					);
				})}
			</div>
			<div className="notebook-footer">
				<Button
					variant="contained"
					color="warning"
					onClick={(e) => {
						
					}}
				>
					Save
				</Button>
				<Button
					variant="contained"
					color="primary"
					onClick={(e) => {
						var json = props.start + JSON.stringify(props.cells, null, 4) + props.end;
						var blob = new Blob([json], { type: "application/json" });
						var url = URL.createObjectURL(blob);
						var a = document.createElement("a");
						a.href = url;
						a.download = "notebook.ipynb";
						a.click();
					}}
				>
					Download
				</Button>
			</div>
		</div>
	);
}

function Web(props) {
	return (
		<iframe
			src="https://jupyterlite.github.io/demo/lab/index.html"
			width="100%"
			height="100%"
		></iframe>
	);
}

function Raw(props) {
	return (
		<textarea
			autoCorrect="off"
			spellCheck="false"
			style={{
				width: "100%",
				height: "100%",
				backgroundColor: "transparent",
				border: "none",
				color: "white",
				fontSize: "0.8em",
			}}
			value={props.value}
		></textarea>
	);
}

function DraggableTemplate(props) {
	const [thisComponent, setThisComponent] = React.useState(false);
	const ref = React.useRef(null);

	const [numInputs, setNumInputs] = React.useState(0);
	const [numOutputs, setNumOutputs] = React.useState(0);

	function mouseDown(e) {
		setThisComponent(true);
		props.setIsDragging(true);
		props.setIsCreating(true);
		props.setCurrentComponent(props.component);
	}

	useEffect(() => {
		if (!props.isDragging) {
			setThisComponent(false);
		}
		if (thisComponent) {
			ref.current.style.left = props.mouseX + "px";
			ref.current.style.top = props.mouseY + "px";
		}
	}, [thisComponent, props.mouseX, props.mouseY, props.isDragging]);

	return (
		<>
			{thisComponent ? (
				<div
					ref={ref}
					className="draggable"
					onMouseUp={(e) => {
						props.setIsDragging(false);
						setThisComponent(false);
					}}
					onMouseMove={(e) => {
						console.log("dragging");
					}}
				>
					<div className="inputs">
						{
							// loop for numOutputs
							[...Array(numInputs)].map((e, i) => {
								return <div className="input" key={i} />;
							})
						}
					</div>
					{props.children}
					<div className="outputs">
						{
							// loop for numOutputs
							[...Array(numOutputs)].map((e, i) => {
								return <div className="output" key={i} />;
							})
						}
					</div>
				</div>
			) : null}
			<div className="template-component" onMouseDown={mouseDown}>
				<div className="inputs">
					{
						// loop for numOutputs
						[...Array(numInputs)].map((e, i) => {
							return <div className="input" key={i} />;
						})
					}
				</div>
				<div className="template-component-content">{props.children}</div>
				<div className="outputs">
					{
						// loop for numOutputs
						[...Array(numOutputs)].map((e, i) => {
							return <div className="output" key={i} />;
						})
					}
				</div>
			</div>
		</>
	);
}

// render the app component
ReactDOM.render(<App />, document.getElementById("root"));
