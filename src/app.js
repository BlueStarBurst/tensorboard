import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactDOM from "react-dom";

import Canvas, { CanvasOverlay } from "./Canvas.js";

import "./styles.css";
import { DBManager } from "./DB.js";
import { Button, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Notebook, Raw, Web } from "./Pages.js";

import { components } from "./Components.js";

var w = localStorage.getItem("w") || 50;
var h = localStorage.getItem("h") || 0;

function isMobile() {
	if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
		return true;
	}
	return false;
}



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

var keys = [];

function App() {
	const [darkThemes, setDarkThemes] = React.useState(false);

	const [isResizing, setIsResizing] = React.useState(false);

	const [mouseX, setMouseX] = React.useState(0);
	const [mouseY, setMouseY] = React.useState(0);

	const [panel, setPanel] = React.useState("tools");
	const [isDragging, setIsDragging] = React.useState(false);
	const [isCreating, setIsCreating] = React.useState(false);

	const [panelContent, setPanelContent] = React.useState(null);
	const [items, setItems] = React.useState(DBManager.getInstance().getItems());
	const [currentComponent, setCurrentComponent] = React.useState(null);

	const [webPointer, setWebPointer] = React.useState(false);

	const [currentElements, setCurrentElements] = React.useState([]);

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

	const [prevTouch, setPrevTouch] = React.useState([-1, -1]);
	const [prevDistance, setPrevDistance] = React.useState(-1);

	function setTouchCoords(e) {
		// e.preventDefault();

		// if two fingers are touching the screen, detect zoom and pan gestures
		if (
			e.touches.length > 1 &&
			prevDistance > -1 &&
			prevTouch[0] > -1 &&
			prevTouch[1] > -1
		) {
			// get the distance between the two fingers
			var x1 = e.touches[0].clientX;
			var y1 = e.touches[0].clientY;
			var x2 = e.touches[1].clientX;
			var y2 = e.touches[1].clientY;
			var distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
			// if the distance is greater than the previous distance, zoom in
			if (distance > prevDistance) {
				zoomContainer({
					preventDefault: e.preventDefault,
					deltaY: -1,
					clientX: (x1 + x2) / 2,
					clientY: (y1 + y2) / 2,
				});
			} else {
				zoomContainer({
					preventDefault: e.preventDefault,
					deltaY: 1,
					clientX: (x1 + x2) / 2,
					clientY: (y1 + y2) / 2,
				});
			}
			setPrevDistance(distance);
			setPrevTouch([x1, y1]);
		} else if (e.touches.length > 1) {
			// if two fingers are touching the screen, set the distance and the first touch
			var x1 = e.touches[0].clientX;
			var y1 = e.touches[0].clientY;
			var x2 = e.touches[1].clientX;
			var y2 = e.touches[1].clientY;
			var distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
			setPrevDistance(distance);
			setPrevTouch([x1, y1]);
		}

		setMouseX(e.touches[0].clientX);
		setMouseY(e.touches[0].clientY);
		mouseXext = e.touches[0].clientX;
		mouseYext = e.touches[0].clientY;
		if (isResizing) {
			mobileResizeTools(e);
		}
	}

	function resizeTools(e) {
		// set css variable --mouse-x to the mouse x position
		pixelL = e.clientX;
		var parentWidth = e.target.parentElement.clientWidth;
		var parentHeight = e.target.parentElement.clientHeight;

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

	function mobileResizeTools(e) {
		// set css variable --mouse-x to the mouse x position

		pixelL = e.touches[0].clientX;
		var parentWidth = e.target.parentElement.clientWidth;
		var parentHeight = e.target.parentElement.clientHeight;

		w = (e.touches[0].clientX / parentWidth) * 100;
		document.documentElement.style.setProperty("--pointer-events", "none");
		document.documentElement.style.setProperty(
			"--mouse-x",
			(e.touches[0].clientX / parentWidth) * 100 + "%"
		);
		document.documentElement.style.setProperty(
			"--mouse-y",
			(e.touches[0].clientY / parentHeight) * 100 + "%"
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

		newWidth = Math.min(
			newWidth,
			canvasSize.x
			// 1
		);
		newHeight = Math.min(
			newHeight,
			canvasSize.y
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

		// get ig b is pressed
		// if (e.key === "b") {


		// 	setDarkThemes(!darkMode);
		// 	setDarkTheme(!darkMode);
		// }
	}

	const canvasContainer = React.useRef(null);

	function mouseUp(e) {

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
		document.addEventListener("keydown", onKeyboardDown);
		document.addEventListener("keyup", onKeyboardUp);

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

		canvas.style.width = localStorage.getItem("canvasWidth") + "px";
		canvas.style.height = localStorage.getItem("canvasHeight") + "px";
		canvas2.style.width = localStorage.getItem("canvasWidth") + "px";
		canvas2.style.height = localStorage.getItem("canvasHeight") + "px";

		// set the canvasContainer scroll position
		canvasContainer.current.scrollLeft = localStorage.getItem("scrollX") || 0;
		canvasContainer.current.scrollTop = localStorage.getItem("scrollY") || 0;

		// setCanvasWidth(localStorage.getItem('canvasWidth') || 300);
		// setCanvasHeight(canvasContainer.current.clientHeight);

		// if (isMobile()) {

		// 	// add event listeners for touch events
		// 	var div = document.createElement("div");

		// 	div.className = "fullscreen-button";

		// 	// add the div to the body
		// 	document.body.appendChild(div);

		// 	div.addEventListener("click", function () {
		// 		// request full screen

		// 		document.documentElement.requestFullscreen();

		// 		// remove self
		// 		document.body.removeChild(div);
		// 	});
		// 	// emulate click event
		// 	// div.click();


		// }

		return () => {
			document.removeEventListener("keydown", onKeyPressed);
		};
	}, []);

	useEffect(() => {
		if (isDragging == false && isCreating == true) {
			// createItem();
			setIsCreating(false);
		}
	}, [isDragging]);

	const [refresh, setRefresh] = React.useState(false);
	useEffect(() => {
		refreshCanvasWidth();
	}, [items]);

	function preventDefault(e) {

		e.preventDefault();
	}

	function zoomContainer(e) {
		e.preventDefault();

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

	function createItem(e, ax, ay) {

		if (e.target.id == "canvas") {
			if (isCreating) {
				setCanvasMouseUp([ax, ay]);
			}
		}
	}

	const [ids, setIds] = React.useState([]);

	function getNewId() {
		var id = Math.floor(Math.random() * 100000);
		while (id in ids) {
			id = Math.floor(Math.random() * 100000);
		}
		setIds([...ids, id]);
		return id;
	}

	const [cells, setCells] = React.useState([]);

	const [start, setStart] = React.useState(`{"cells": `);
	const [end, setEnd] = React.useState(
		`,"metadata": {"kernelspec": {"display_name": "Python 3","language": "python","name": "python3"},"language_info": {"codemirror_mode": {"name": "ipython","version": 3},"file_extension": ".py","mimetype": "text/x-python","name": "python","nbconvert_exporter": "python","pygments_lexer": "ipython3","version": "3.10.13"},"colab": {"provenance": []}},"nbformat": 4,"nbformat_minor": 0}`
	);

	const [webSelected, setWebSelected] = React.useState(false);

	useEffect(() => {
		if (panel == "web") {
			setWebSelected(true);
		} else {
			setWebSelected(false);
		}
	}, [panel]);

	const [selectedElement, setSelectedElement] = React.useState(null);
	function selectElement(element) {
		setSelectedElement(element);
	}

	function addChildrenToComponentList(component, idList = []) {

		var finArray = [component.id];

		if (idList.includes(component.id)) {
			// get index of id
			var index = idList.indexOf(component.id);
			if (idList[index - 1] == idList[idList.length - 1]) {
				return [];
			}
		}
		idList.push(component.id);
		// loop through keys of component outputs {id : component}
		Object.keys(component.outputs).map((key, index) => {

			var tempArr = addChildrenToComponentList(component.outputs[key], idList);
			// add the arr to the finArray
			finArray = finArray.concat(tempArr);
		});
		Object.keys(component.helpers).map((key, index) => {
			
			var tempArr = addChildrenToComponentList(component.helpers[key], idList);
			// add the arr to the finArray
			finArray = finArray.concat(tempArr);
		});
		return finArray;
	}

	const [flip, setFlip] = React.useState(false);

	function flop() {
		setFlip(!flip);
	}

	function updateNotebook(currentElements) {


		var saveElements = {};
		Object.keys(currentElements).map((key, index) => {
			saveElements[key] = currentElements[key].toJSON();
		});
		DBManager.getInstance().setItem("elements", saveElements);

		var tcomponents = [];
		var scomponents = {};
		var rootComponents = [];
		var keyList = [];
		var fcomponents = [];

		var tempElements = Object.values(currentElements);

		for (var i = 0; i < tempElements.length; i++) {
			var element = tempElements[i];


			tcomponents.push(element.component);
			scomponents[element.component.id] = element.component;
		}


		// get all components with no inputs
		for (var i = 0; i < tcomponents.length; i++) {
			var component = tcomponents[i];

			if (Object.keys(component.inputs).length == 0) {


				// keyList.push(component.id);
				rootComponents.push(component);
			}
		}


		// sort root components by priority low to high
		rootComponents = rootComponents.sort((a, b) => {
			var ap = a.priority || 100;
			var bp = b.priority || 100;
			return ap - bp;
		});

		for (var i = 0; i < rootComponents.length; i++) {

			keyList.push(rootComponents[i].id);
		}

		// loop through all components with no inputs, adding their outputs to the inputs of other components
		for (var i = 0; i < rootComponents.length; i++) {
			var children = rootComponents[i].outputs;

			Object.keys(children).map((key, index) => {

				// add the children to the components array
				var tempArr = addChildrenToComponentList(children[key]);

				keyList = keyList.concat(tempArr);
			});
		}

		// make sure 0 priority components are after 1 priority components
		// sort the keyList by priority
		keyList = keyList.sort((a, b) => {
			var ap = scomponents[a].priority || 100;
			var bp = scomponents[b].priority || 100;
			return ap - bp;
		});

		// loop backwards through the keyList, keeping only the unique keys
		var uniqueKeyList = [];
		for (var i = keyList.length - 1; i >= 0; i--) {
			if (
				!uniqueKeyList.includes(keyList[i]) &&
				scomponents[keyList[i]].name != "Connector"
			) {
				// add to front of array
				uniqueKeyList.push(keyList[i]);
				fcomponents.unshift(scomponents[keyList[i]]);
			}
		}



		// parse the components into JSON cells
		var tcells = [];
		fcomponents.map((value, index) => {
			if (value && value.transpile) {
				var raw_python = value.transpile();
				// split by new line
				raw_python = raw_python.split("\n");
				// add a new line to the end of each line
				raw_python = raw_python.map((line) => {
					return line + "\n";
				});



				tcells.push({
					cell_type: "code",
					execution_count: 1,
					metadata: {
						id: value.id,
						selected: currentElements[value.id].dragging,
					},
					outputs: [],
					source: raw_python,
				});
			}
		});

		setCells(tcells);
	}

	const [disableOverlay, setDisableOverlay] = React.useState(false);

	const [keyDown, setKeyDown] = React.useState(null);
	// const [currentKeys, setCurrentKeys] = React.useState([]);

	function onKeyboardDown(e) {

		setKeyDown(e);

		// if key is in keys, return
		if (keys.includes(e.key)) {
			return;
		}

		keys.push(e.key);



		// if control z is pressed, undo
		if (keys.includes("Control") && keys.includes("z")) {

			DBManager.getInstance().undo();
			flop();
		} else if (keys.includes("Control") && keys.includes("y")) {

			DBManager.getInstance().redo();
			flop();
		}
	}

	function onKeyboardUp(e) {
		// remove the key from keys
		var temp = keys;
		temp.splice(temp.indexOf(e.key), 1);
	}

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<div
				className="rows"
				id="parent"
				onMouseMove={setMouseCoords}
				onTouchMove={setTouchCoords}
				onMouseUp={(e) => {
					createItem(e, e.clientX, e.clientY);
					mouseUp(e);
				}}
				onTouchEnd={(e) => {

					createItem(e, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
					mouseUp(e);
				}}
				onKeyDown={onKeyboardDown}
				onKeyUp={onKeyboardUp}
			>
				<CanvasOverlay
					selectedElement={selectedElement}
					updateNotebook={updateNotebook}
					pointer={disableOverlay}
				/>
				<div
					className="canvas"
					// onMouseMove={panCanvas}

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
						updateNotebook={updateNotebook}
						setDisableOverlay={setDisableOverlay}
						keyDown={keyDown}
						setKeyDown={setKeyDown}
						components={components}
						flip={flip}
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
					onTouchStart={(e) => {
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
										getNewId={getNewId}
									>
										{components[key].name}
									</DraggableTemplate>
								);
							})}
						</div>
					) : panel == "raw" ? (
						<Raw value={start + JSON.stringify(cells, null, 4) + end}></Raw>
					) : panel == "notebook" ? (
						<Notebook cells={cells} start={start} end={end} flop={flop} />
					) : panel == "web" ? (
						<Web />
					) : null}
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

function DraggableTemplate(props) {
	const [thisComponent, setThisComponent] = React.useState(false);
	const ref = React.useRef(null);

	const [numInputs, setNumInputs] = React.useState(0);
	const [numOutputs, setNumOutputs] = React.useState(0);

	function mouseDown(e) {
		setThisComponent(true);
		props.setIsDragging(true);
		props.setIsCreating(true);
		// var newComponent = new Component(props.getNewId());
		// newComponent.name = props.component.name;
		// newComponent.description = props.component.description;
		// newComponent.data = props.component.data;
		// newComponent.inputs = [];
		// newComponent.outputs = [];
		// newComponent.transpile = props.component.transpile;
		// newComponent.reload = props.component.reload;
		var newComponent = Object.create(props.component);
		newComponent.data = JSON.parse(JSON.stringify(props.component.data));
		newComponent.inputs = {};
		newComponent.outputs = {};
		newComponent.helpers = {};

		newComponent.id = props.getNewId();
		props.setCurrentComponent(newComponent);
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
					onTouchEnd={(e) => {
						props.setIsDragging(false);
						setThisComponent(false);
					}}
					onMouseMove={(e) => {

					}}
					onTouchMove={(e) => {

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
			<div
				className="template-component"
				onMouseDown={mouseDown}
				onTouchStart={mouseDown}
				style={{ backgroundColor: props.component.color }}
			>
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

class Component {
	constructor(id) {
		this.name = "";
		this.description = "";
		this.data = {};
		this.inputs = {};
		this.outputs = {};
		this.id = id;
		this.reload = function () {};
		this.transpile = function () {};
	}
}

// render the app component
ReactDOM.render(<App />, document.getElementById("root"));
