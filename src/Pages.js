import { Button, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";

import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
hljs.registerLanguage("python", python);

import "highlight.js/styles/tokyo-night-dark.css";
import { DBManager } from "./DB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowRotateLeft,
	faCheck,
	faDownload,
	faFloppyDisk,
	faPlay,
	faSpinner,
	faUpload,
	faX,
} from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "react-bootstrap";

export function Notebook(props) {
	const [cells, setCells] = React.useState([]);
	const [prevCells, setPrevCells] = React.useState([]);
	const [statuses, setStatuses] = React.useState({});
	const [ready, setReady] = React.useState(false);
	const [restarting, setRestarting] = React.useState(false);

	useEffect(() => {
		if (props.cells.length != cells.length) {
			setPrevCells(props.cells);
		} else {
			setPrevCells(cells);
		}
		
		setCells(props.cells);
		setReady(false);
		// setCells(props.cells);
	}, [props.cells]);

	function runCell(cell, index) {
		// use pyodide to run the cell's source
		console.log(cell.source.join(""));
		if (props.pyodide == null) {
			return;
		}

		var id = cell.metadata.id;
		var tempStatuses = statuses;
		tempStatuses[id] = { status: "running", error: "", output: "" };
		setStatuses(tempStatuses);

		var output = "";
		var error = "";
		props.pyodide.setStdout({
			batched: (newOutput) => {
				// remove the last newline character
				// output = output.substring(0, output.length - 1);
				if (output == "") {
					output += newOutput;
				} else {
					output += "\n" + newOutput;
				}
				var tempStatuses = statuses;
				tempStatuses[id] = {
					status: "done",
					error: tempStatuses[id].error,
					output: output,
				};
				setStatuses(tempStatuses);
			},
		});
		props.pyodide.setStderr((output) => {
			var tempStatuses = statuses;
			tempStatuses[id] = {
				status: "error",
				error: output,
				output: tempStatuses[id].output,
			};
			setStatuses(tempStatuses);
		});

		// for each line in source, run it
		try {
			props.pyodide.runPython(cell.source.join("") + `\nprint("")`);
		} catch (e) {
			console.log(e);
			var tempStatuses = statuses;
			tempStatuses[id] = {
				status: "error",
				error: e + "",
				output: tempStatuses[id].output,
			};
			setStatuses(tempStatuses);
		}
	}

	function runAllCells() {
		// use pyodide to run the cell's source
		if (props.pyodide == null) {
			return;
		}

		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			runCell(cell, i);
		}
	}

	async function restartPyodide() {
		await props.setPyodideVal();

		// clear the output of all cells
		var temp = cells;
		for (var i = 0; i < temp.length; i++) {
			temp[i].output = "";
			temp[i].error = "";
			temp[i].status = "";
		}
		setCells(temp);
		setRestarting(false);
	}

	useEffect(() => {
		if (ready == false) {
			setTimeout(() => {
				Object.keys(cells).forEach((key) => {
					var code = document.getElementById(JSON.stringify(cells[key]));
					if (code) {
						if (code.attributes.getNamedItem("data-highlighted")) {
							code.attributes.removeNamedItem("data-highlighted");
						}
						var p = "<p>";
						var cell = cells[key];
						var source = cell.source;

						
						// if source is different from prevCells source, reset the status
						if (prevCells[key] != null) {
							if (source.join("") != prevCells[key].source.join("")) {
								console.log("source is different");
								var tempStatuses = statuses;
								tempStatuses[cell.metadata.id] = {
									status: "",
									error: "",
									output: "",
								};
								setStatuses(tempStatuses);
							}
						}

						for (var i = 0; i < source.length; i++) {
							p += source[i];
						}
						p += "</p>";
						code.innerHTML = p;

						// find all elements with the class "cell-selected" and scroll to them
						var selected = document.getElementsByClassName("cell-selected");
						for (var i = 0; i < selected.length; i++) {
							selected[i].scrollIntoView({
								behavior: "smooth",
								block: "center",
								inline: "center",
							});
						}
					}
				});
				hljs.highlightAll();
				setReady(true);
			}, 0.1);
		}
	}, [cells]);

	const [innerHTMLs, setInnerHTMLs] = React.useState([]);

	return (
		<div className="notebook-container">
			<div className="cell-container" key={"1"} id="1">
				{cells.map((cell, index) => {
					return (
						<div key={index} className="cell">
							<div
								className={
									cell.metadata.selected
										? "cell-line cell-selected"
										: "cell-line"
								}
								key={index}
							>
								<div className="cell-left">
									<p className="cell-index">
										[{" " + (index + 1) + " "}]:
										<FontAwesomeIcon
											className="play"
											icon={faPlay}
											onClick={(e) => {
												runCell(cell, index);
											}}
										/>
										<div className="status">
											{statuses[cell.metadata.id] != null && statuses[cell.metadata.id].status != "" ? (
												statuses[cell.metadata.id].status == "running" ||
												restarting ? (
													<CircularProgress className="stat-circular" />
												) : (
													<FontAwesomeIcon
														className={
															statuses[cell.metadata.id].status == "error"
																? "stat red"
																: "stat green"
														}
														icon={
															statuses[cell.metadata.id].status == "error"
																? faX
																: faCheck
														}
														onClick={(e) => {
															// runCell(cell, index);
														}}
													/>
												)
											) : (
												<></>
											)}
										</div>
									</p>

									{/* <p className="cell-id">{cell.metadata.id}</p> */}
								</div>
								<div className="cell-right">
									<pre style={{ width: "100%" }}>
										<code
											id={JSON.stringify(cell)}
											className="python highlight"
										>
											{/* {cell.source.map((line, i) => {
											return (
												<div key={i} className="cell-code">
													{line}
												</div>
											);
										})} */}
										</code>
									</pre>
									{statuses[cell.metadata.id] != null &&
									statuses[cell.metadata.id].output != null &&
									statuses[cell.metadata.id].output != "" ? (
										<div className="cell-output">
											<p>{statuses[cell.metadata.id].output}</p>
										</div>
									) : (
										<></>
									)}
									{statuses[cell.metadata.id] != null &&
									statuses[cell.metadata.id].status == "error" &&
									statuses[cell.metadata.id].error != null &&
									statuses[cell.metadata.id].error != "" ? (
										<div className="cell-output error">
											<p>{statuses[cell.metadata.id].error}</p>
										</div>
									) : (
										<></>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<div className="notebook-footer">
				<div className="notebook-python-options">
					<Button
						variant="contained"
						color="error"
						onClick={(e) => {
							setRestarting(true);
							restartPyodide();
						}}
						disabled={restarting}
					>
						<FontAwesomeIcon icon={faArrowRotateLeft} />
					</Button>
					<Button
						variant="contained"
						color="warning"
						onClick={(e) => {
							runAllCells();
						}}
					>
						<FontAwesomeIcon icon={faPlay} />
					</Button>
				</div>
				<div className="notebook-file-options">
					<Button
						variant="contained"
						color="warning"
						onClick={(e) => {
							// upload the database
							var input = document.createElement("input");
							input.type = "file";
							input.onchange = (e) => {
								var file = e.target.files[0];
								var reader = new FileReader();
								reader.onload = (e) => {
									var text = e.target.result;
									var temp = JSON.parse(text);
									DBManager.getInstance().setItems(temp);
									props.flop();
								};
								reader.readAsText(file);
							};
							input.click();
						}}
					>
						<FontAwesomeIcon icon={faUpload} />
					</Button>
					<Button
						variant="contained"
						color="success"
						onClick={(e) => {
							// download the database
							var temp = DBManager.getInstance().getItems();
							var json = JSON.stringify(temp, null, 4);
							var blob = new Blob([json], { type: "application/json" });
							var url = URL.createObjectURL(blob);
							var a = document.createElement("a");
							a.href = url;
							a.download = "notebook.tensorboard";
							a.click();
						}}
					>
						<FontAwesomeIcon icon={faFloppyDisk} />
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={(e) => {
							var json =
								props.start + JSON.stringify(cells, null, 4) + props.end;
							var blob = new Blob([json], { type: "application/json" });
							var url = URL.createObjectURL(blob);
							var a = document.createElement("a");
							a.href = url;
							a.download = "notebook.ipynb";
							a.click();
						}}
					>
						<FontAwesomeIcon icon={faDownload} />
					</Button>
				</div>
			</div>
		</div>
	);
}

export function Raw(props) {
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
