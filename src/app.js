import React, { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactDOM from "react-dom";

import Canvas, { CanvasOverlay } from "./Canvas.js";

import "./styles.css";
import { DBManager } from "./component.js";
import { Button, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Notebook, Raw, Web } from "./Pages.js";

var w = localStorage.getItem("w") || 50;
var h = localStorage.getItem("h") || 0;

const components = {
	Data: {
		name: "Data",
		// color: "#F1AB86",
		color: "#9e6649",
		description:
			"This component is used to download data from a remote URL for model training",
		id: -1,
		data: {
			Type: {
				type: "radio",
				options: ["HuggingFace", "Zip"],
				value: "HuggingFace",
				hidden: false,
			},
			URL: {
				type: "text",
				value: "",
				hidden: true,
			},
			RepoID: {
				type: "text",
				value: "",
				hidden: false,
			},
			FileName: {
				type: "text",
				value: "",
				hidden: false,
			},
		},
		transpile: function () {
			console.log("TRANSPILING", this.id, this.data);
			if (this.data.Type.value == "HuggingFace") {
				return `from huggingface_hub import hf_hub_download\nimport pandas as pd\nprint('Downloading data from https://hugingface.com/${
					this.data.RepoID.value
				}')\n${this.getOutput()} = pd.read_csv(\n\thf_hub_download(repo_id="${
					this.data.RepoID.value
				}", filename="${this.data.FileName.value}", repo_type="dataset")\n)`;
			} else {
				return `print('Downloading data from ${this.data.URL.value}')\n!wget -O dataset.zip ${this.data.URL.value}`;
			}
		},
		reload: function () {
			if (this.data.Type.value == "HuggingFace") {
				this.data.RepoID.hidden = false;
				this.data.FileName.hidden = false;
				this.data.URL.hidden = true;
			} else {
				this.data.RepoID.hidden = true;
				this.data.FileName.hidden = true;
				this.data.URL.hidden = false;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "dataset",
	},
	Normalize: {
		name: "Normalize",
		description: "Normalizes the input data",
		color: "#6A2E35",
		data: {
			Type: {
				type: "text",
				value: "",
			},
		},
		transpile: function () {
			return `print('Normalizing data')`;
		},
		reload: function () {},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "norm",
	},
	Value: {
		name: "Value",
		description: "Create variables of different types",
		color: "#943854",
		data: {
			Type: {
				type: "radio",
				options: ["Integer", "String", "Float", "Boolean"],
				value: "Integer",
				hidden: false,
			},
			Integer: {
				type: "slider",
				value: 0,
				min: -100,
				max: 100,
				step: 1,
				hidden: false,
			},
			String: {
				type: "text",
				value: "",
				hidden: true,
			},
			Float: {
				type: "slider",
				value: 0.0,
				min: -100,
				max: 100,
				step: 0.01,
				hidden: true,
			},
			Boolean: {
				type: "checkbox",
				value: "False",
				hidden: true,
			},
		},
		transpile: function () {
			if (this.data.Type.value == "Integer") {
				return `${this.getOutput()} = ${this.data.Integer.value}`;
			} else if (this.data.Type.value == "String") {
				return `${this.getOutput()} = "${this.data.String.value}"`;
			} else if (this.data.Type.value == "Float") {
				return `${this.getOutput()} = ${this.data.Float.value}`;
			} else if (this.data.Type.value == "Boolean") {
				return `${this.getOutput()} = ${this.data.Boolean.value}`;
			}
		},
		reload: function () {
			if (this.data.Type.value == "Integer") {
				this.data.Integer.hidden = false;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
			} else if (this.data.Type.value == "String") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = false;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = true;
			} else if (this.data.Type.value == "Float") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = false;
				this.data.Boolean.hidden = true;
			} else if (this.data.Type.value == "Boolean") {
				this.data.Integer.hidden = true;
				this.data.String.hidden = true;
				this.data.Float.hidden = true;
				this.data.Boolean.hidden = false;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.data.Type.value.toLowerCase() + this.id;
		},
		getValue: function () {
			if (this.data.Type.value == "Integer") {
				return this.data.Integer.value;
			} else if (this.data.Type.value == "String") {
				return this.data.String.value;
			} else if (this.data.Type.value == "Float") {
				return this.data.Float.value;
			} else if (this.data.Type.value == "Boolean") {
				return this.data.Boolean.value;
			}
		},
		output: "value",
	},
	Library: {
		name: "Library",
		description: "Install a library from pip",
		color: "#403e9c",
		data: {
			UseVersion: {
				type: "checkbox",
				value: "False",
				hidden: false,
			},
			Library: {
				type: "text",
				value: "",
				hidden: false,
			},
			Version: {
				type: "text",
				value: "",
				hidden: true,
			},
		},
		transpile: function () {
			if (this.data.Version.value) {
				return `%pip install ${this.data.Library.value}==${this.data.Version.value}`;
			}
			return `%pip install ${this.data.Library.value}`;
		},
		reload: function () {
			if (this.data.UseVersion.value == "True") {
				this.data.Version.hidden = false;
			} else {
				this.data.Version.hidden = true;
			}
		},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "library",
	},
	Import: {
		name: "Import",
		description: "Import a library or module",
		color: "#7f538c",
		data: {
			from: {
				type: "text",
				value: "",
			},
			import: {
				type: "text",
				value: "",
			},
			as: {
				type: "text",
				value: "",
			},
		},
		transpile: function () {
			var output = "";
			if (this.data.from.value) {
				output += `from ${this.data.from.value} `;
			}
			if (this.data.as.value) {
				return (
					output + `import ${this.data.import.value} as ${this.data.as.value}`
				);
			}
			return output + `import ${this.data.import.value}`;
		},
		reload: function () {},
		outputs: [],
		inputs: [],
		getOutput: function () {
			return this.output + this.id;
		},
		output: "import",
	},
	Array: {
		name: "Array",
		color: "#0c6fab",
		description: "Use Values as inputs to create an array of values",
		data: {
			Data: {
				type: "text",
				value: "text",
				readonly: true,
				hidden: false,
			},
		},
		transpile: function () {
			// get the outputs of the inputs

			var vals = [];
			var outputs = Object.keys(this.inputs).map((key, index) => {
				var input = this.inputs[key];
				if (input.getValue) {
					vals.push(input.getValue());
				}
				return input.getOutput();
			});
			console.log(outputs);

			this.data.Data.value = `[${vals.join(", ")}]`;

			// return an array of the outputs
			return `${this.getOutput()} = [${outputs.join(", ")}]`;
		},
		reload: function () {},
		getOutput: function () {
			return "array" + this.id;
		},
		getValue: function () {
			return this.data.Data.value;
		},
	},
	Print: {
		name: "Print",
		description: "Print a value to the console",
		color: "#4a8260",
		data: {
			Data: {
				type: "text",
				value: "",
				readonly: false,
				hidden: false,
			},
		},
		transpile: function () {
			// if there is an input, print the input
			if (Object.keys(this.inputs).length > 0) {
				// print all the inputs

				var outputs = Object.keys(this.inputs).map((key, index) => {
					if (this.inputs[key].getValue) {
						return this.inputs[key].getValue();
					}
				});
				this.data.Data.value = outputs.join(", ");
				this.data.Data.readonly = true;

				var trueOutputs = Object.keys(this.inputs).map((key, index) => {
					return this.inputs[key].getOutput();
				});

				return `print(${trueOutputs.join(", ")})`;
			} else {
				// print the value
				this.data.Data.readonly = false;
				return `print("${this.data.Data.value}")`;
			}
		},
		reload: function () {},
		getOutput: function () {
			return this.output + this.id;
		},
		output: "print",
	},
};

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

	function setTouchCoords(e) {
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

	function mobileResizeTools(e) {
		// set css variable --mouse-x to the mouse x position
		// console.log(e);
		pixelL = e.touches[0].clientX;
		var parentWidth = e.target.parentElement.clientWidth;
		var parentHeight = e.target.parentElement.clientHeight;
		console.log((e.touches[0].clientX / parentWidth) * 100);
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
		// if (e.key === "b") {
		// 	console.log("b");
		// 	console.log(darkThemes);
		// 	setDarkThemes(!darkMode);
		// 	setDarkTheme(!darkMode);
		// }
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
		document.addEventListener("keydown", onKeyboardDown);

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

	function addChildrenToComponentList(component) {
		console.log("Recursing");
		var finArray = [component.id];
		// loop through keys of component outputs {id : component}
		Object.keys(component.outputs).map((key, index) => {
			console.log("CHILD!", component.outputs[key]);
			var tempArr = addChildrenToComponentList(component.outputs[key]);
			// add the arr to the finArray
			finArray = finArray.concat(tempArr);
		});
		return finArray;
	}

	function updateNotebook(currentElements) {
		var tcomponents = [];
		var scomponents = {};
		var rootComponents = [];
		var keyList = [];
		var fcomponents = [];

		currentElements = Object.values(currentElements);

		for (var i = 0; i < currentElements.length; i++) {
			var element = currentElements[i];

			console.log(currentElements);
			tcomponents.push(element.component);
			scomponents[element.component.id] = element.component;
		}
		console.log("ELEMENTS", currentElements);

		// get all components with no inputs
		for (var i = 0; i < tcomponents.length; i++) {
			var component = tcomponents[i];
			console.log(component);
			if (Object.keys(component.inputs).length == 0) {
				console.log("NO INPUTS", i);

				keyList.push(component.id);
				rootComponents.push(component);
			}
		}
		console.log("ROOT COMPONENTS", rootComponents);
		// loop through all components with no inputs, adding their outputs to the inputs of other components
		for (var i = 0; i < rootComponents.length; i++) {
			var children = rootComponents[i].outputs;
			console.log("CHILDREN", children);
			Object.keys(children).map((key, index) => {
				console.log("CHILD", children[key]);
				// add the children to the components array
				var tempArr = addChildrenToComponentList(children[key]);
				console.log("TEMPARR", tempArr);
				keyList = keyList.concat(tempArr);
			});
		}

		// loop backwards through the keyList, keeping only the unique keys
		var uniqueKeyList = [];
		for (var i = keyList.length - 1; i >= 0; i--) {
			if (!uniqueKeyList.includes(keyList[i])) {
				// add to front of array
				uniqueKeyList.push(keyList[i]);
				fcomponents.unshift(scomponents[keyList[i]]);
			}
		}

		// console.log(scomponents);

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
					},
					outputs: [],
					source: raw_python,
				});
			}
		});
		console.log(tcells);
		setCells(tcells);
	}

	const [disableOverlay, setDisableOverlay] = React.useState(false);

	const [keyDown, setKeyDown] = React.useState(null);

	function onKeyboardDown(e) {
		console.log("onKeyboardDown", e);
		setKeyDown(e);
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
					createItem(e.clientX, e.clientY);
					mouseUp(e);
				}}
				onKeyDown={onKeyboardDown}
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
						<Notebook cells={cells} start={start} end={end} />
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
						console.log("dragging");
					}}
					onTouchMove={(e) => {
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
