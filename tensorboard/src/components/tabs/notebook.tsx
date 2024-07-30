import { useContext, useEffect, useState } from "react";
import { Component } from "../blocks";
import { ElementsContext } from "../canvas/elements-context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faCheck, faX, faArrowRotateLeft, faRefresh, faUpload, faFloppyDisk, faDownload } from '@fortawesome/free-solid-svg-icons'
import Button from "../ui/button";
import hljs from 'highlight.js';

import { loadPyodide } from "pyodide";

type Cell = {
    cell_type: string;
    execution_count: number;
    metadata: {
        id: number;
        selected: boolean;
    };
    outputs: any[];
    source: string[];
};

export default async function Notebook() {

    const { elements, setElements, notebookCells, statuses, setStatuses } = useContext(ElementsContext);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-full flex flex-col" key={"1"} id="1">
                {notebookCells.map((cell, index) => {
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
                                        [{" " + (index + 1) + " "}]
                                        <FontAwesomeIcon
                                            className="play"
                                            icon={faPlay}
                                            onClick={(e) => {
                                                // runCell(cell, index);
                                            }}
                                        />
                                        {/* <div className="status">
                                            {statuses[cell.metadata.id] != null &&
                                                statuses[cell.metadata.id].status != "" ? (
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
                                        </div> */}
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
                                    {/* {statuses[cell.metadata.id] != null &&
                                        statuses[cell.metadata.id].output != null &&
                                        statuses[cell.metadata.id].output.length > 0 ? (
                                        <div className="cell-output">
                                            {statuses[cell.metadata.id].output.map(
                                                (line, i) => {
                                                    return <p key={line}>{line}</p>;
                                                }
                                            )}
                                            {statuses[cell.metadata.id].img != "" ? (
                                                <img
                                                    className="cell-img w-100"
                                                    src={`data:image/png;base64,${statuses[cell.metadata.id].img}`}
                                                />
                                            ) : (
                                                <></>
                                            )}
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
                                    )} */}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="w-full flex flex-row justify-between">
                <div className="notebook-python-options">
                    <Button
                        // variant="contained"
                        // color="error"
                        onClick={(e) => {
                            // setRestarting(true);
                            // restartPyodide();
                        }}
                    // disabled={restarting}
                    >
                        <FontAwesomeIcon icon={faArrowRotateLeft} />
                    </Button>
                    <Button
                        // variant="contained"
                        // color="warning"
                        onClick={(e) => {
                            // runAllCells();
                        }}
                    >
                        <FontAwesomeIcon icon={faPlay} />
                    </Button>
                </div>

                <div className="notebook-file-options">
                    <Button
                        // variant="contained"
                        // color="warning"
                        onClick={(e) => {
                            // upload the database
                            var input = document.createElement("input");
                            input.type = "file";
                            input.onchange = (e: any) => {
                                var file = e.target!.files[0];
                                var reader = new FileReader();
                                reader.onload = (e: any) => {
                                    var text = e.target.result;
                                    var temp = JSON.parse(text);
                                    // DBManager.getInstance().setItems(temp);
                                    // flop();
                                };
                                reader.readAsText(file);
                            };
                            input.click();
                        }}
                    >
                        <FontAwesomeIcon icon={faUpload} />
                    </Button>
                    <Button
                        // variant="contained"
                        // color="success"
                        onClick={(e) => {
                            // download the database
                            // var temp = DBManager.getInstance().getItems();
                            // var json = JSON.stringify(temp, null, 4);
                            // var blob = new Blob([json], { type: "application/json" });
                            // var url = URL.createObjectURL(blob);
                            // var a = document.createElement("a");
                            // a.href = url;
                            // a.download = "notebook.tensorboard";
                            // a.click();
                        }}
                    >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                    </Button>
                    <Button
                        // variant="contained"
                        // color="primary"
                        onClick={(e) => {
                            // var json =
                            //     start + JSON.stringify(notebookCells, null, 4) + end;
                            // var blob = new Blob([json], { type: "application/json" });
                            // var url = URL.createObjectURL(blob);
                            // var a = document.createElement("a");
                            // a.href = url;
                            // a.download = "notebook.ipynb";
                            // a.click();
                        }}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </Button>
                </div>
            </div>
        </div>
    )
}