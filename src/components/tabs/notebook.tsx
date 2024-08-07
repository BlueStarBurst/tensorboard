import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Component } from "../blocks";
import { ElementsContext } from "../canvas/elements-context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faCheck, faX, faArrowRotateLeft, faUpload, faFloppyDisk, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Button from "../ui/button";
// Using ES6 import syntax
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import "highlight.js/styles/atom-one-dark.css";

// Then register the languages you need
hljs.registerLanguage('python', python);

import { loadPyodide, PyodideInterface } from "pyodide";

import { useScript } from "usehooks-ts";
import { Cell } from "./notebook-utils";
import { stat } from "fs";
const PYODIDE_VERSION = "0.25.0";
export function usePythonRunner() {
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
    const pyodideScriptStatus = useScript(
        `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`
    );

    const restartPyodide = async () => {
        const loadedPyodide = await (globalThis as any).loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        });

        await loadedPyodide.loadPackage("micropip");

        setPyodide(loadedPyodide);
    }

    useEffect(() => {
        if (pyodideScriptStatus === "ready" && !pyodide) {
            restartPyodide();
        }
    }, [pyodideScriptStatus, pyodide]);
    return { pyodide, restartPyodide };
}

export default function Notebook() {

    const { elements, setElements, notebookCells, setNotebookCells, statuses, setStatuses } = useContext(ElementsContext);

    const [cellCallbacks, setCellCallbacks] = useState<{ [key: number]: () => void }>({});

    const { pyodide, restartPyodide } = usePythonRunner();

    useEffect(() => {
        console.log("Pyodide", pyodide);
    }, [pyodide])

    function restartNotebook() {
        restartPyodide();
        setStatuses({});
    }

    const [currentCell, setCurrentCell] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(() => {

        const interval = setInterval(() => {
            if (isRunning) {

                if (currentCell >= notebookCells.length) {
                    setIsRunning(false);
                    return;
                }

                const cell = notebookCells[currentCell];
                const status = statuses[cell.metadata.id];

                console.log("Checking status", status);

                if (status?.status == "completed") {
                    setCurrentCell(currentCell + 1);
                } else if (status?.status == "error") {
                    setIsRunning(false);
                } else {
                    setStatuses({
                        ...statuses,
                        [cell.metadata.id]: {
                            status: "running",
                            error: "",
                            img: "",
                            output: "",
                            source: cell.source.join("\n"),
                        }
                    });
                }
            }
        }, 100);

        return () => {
            clearInterval(interval);
        }

    }, [isRunning, statuses, notebookCells, currentCell])

    function runAllCellsButton() {
        setStatuses({});
        setCurrentCell(0);
        setIsRunning(true);
    }

    return (
        <div className="w-full h-full overflow-auto scroll flex flex-col justify-start items-center">

            <div className="fixed bottom-0 p-2 flex flex-row gap-1 rounded-t-lg" style={{ backgroundColor: "#252526" }}>
                <FontAwesomeIcon
                    icon={faPlay}
                    onClick={runAllCellsButton}
                    className="text-black bg-yellow-400 p-2 rounded-lg cursor-pointer w-4 h-4"
                />
                <FontAwesomeIcon
                    icon={faArrowRotateLeft}
                    onClick={restartNotebook}
                    className="text-black bg-red-400 p-2 rounded-lg cursor-pointer w-4 h-4"
                />
                <FontAwesomeIcon
                    icon={faUpload}
                    className="text-black bg-purple-400 p-2 rounded-lg cursor-pointer w-4 h-4"
                />
                <FontAwesomeIcon
                    icon={faFloppyDisk}
                    className="text-black bg-blue-400 p-2 rounded-lg cursor-pointer w-4 h-4"
                />
                <FontAwesomeIcon
                    icon={faDownload}
                    className="text-black bg-green-400 p-2 rounded-lg cursor-pointer w-4 h-4"
                />
            </div>

            {notebookCells.map((cell, index) => {
                return <NotebookCell pyodide={pyodide} cell={cell} index={index} key={cell.metadata.id} />
            })}
        </div>
    )
}

export function NotebookCell({ pyodide, cell, index }: {
    pyodide: PyodideInterface | null,
    cell: Cell,
    index: number
}) {

    const { statuses, setStatuses, notebookCells } = useContext(ElementsContext);

    const codeRef = useRef<HTMLPreElement>(null);
    const outputRef = useRef<HTMLPreElement>(null);
    const errorRef = useRef<HTMLPreElement>(null);

    const [source, setSource] = useState<string>(cell.source.join("\n"));

    useEffect(() => {
        setSource(cell.source.join("\n"));
        console.log("Setting source", cell.source.join("\n"));
    }, [cell.source.join("\n")])

    useEffect(() => {
        function highlightCode() {
            console.log("highlighting code");
            console.log(cell.source.join("\n"));

            codeRef.current!.innerHTML = cell.source.join("\n");

            if (codeRef.current!.attributes.getNamedItem("data-highlighted")) {
                codeRef.current!.attributes.removeNamedItem("data-highlighted");
            }

            hljs.highlightElement(codeRef.current!);
            if (outputRef.current) {
                if (outputRef.current!.attributes.getNamedItem("data-highlighted")) {
                    outputRef.current!.attributes.removeNamedItem("data-highlighted");
                }
                hljs.highlightElement(outputRef.current!);
            }

            if (errorRef.current) {
                if (errorRef.current!.attributes.getNamedItem("data-highlighted")) {
                    errorRef.current!.attributes.removeNamedItem("data-highlighted");
                }
                hljs.highlightElement(errorRef.current!);
            }
        }

        highlightCode();
    }, [source])

    function prepareCell() {
        setStatuses({
            ...statuses,
            [cell.metadata.id]: {
                status: "running",
                error: "",
                img: "",
                output: "",
                source: cell.source.join("\n"),
            }
        });
    }

    async function runCell() {
        console.log("Running cell", cell);

        if (!pyodide) {
            console.error("Pyodide not loaded");
            return;
        }

        try {

            const currentOutput: string[] = [];

            var isDownloading = false;

            var src = cell.source.join("\n");

            while (src.indexOf("%pip install") != -1) {
                var pip = src.split("%pip install")[1];
                pip = pip.split("\n")[0];
                const micropip = pyodide.pyimport("micropip");
                await micropip.install(pip);
                src = src.replace("%pip install" + pip + "\n", "");
                src = src.replace("%pip install" + pip, "");
                console.log("downloading " + pip, src);
                isDownloading = true;
            }

            pyodide.setStdout({
                batched: (output) => {

                    if (output == "<end>") {
                        console.log("End of output");
                        setStatuses({
                            ...statuses,
                            [cell.metadata.id]: {
                                status: "completed",
                                error: "",
                                img: "",
                                output: currentOutput.join("\n"),
                                source: cell.source.join("\n"),
                            }
                        });
                    } else {
                        console.log("Output", output);
                        // outputRef.current!.innerText = output;
                        currentOutput.push(output);
                    }


                }
            });

            pyodide.setStderr({
                batched: (output) => {
                    setStatuses({
                        ...statuses,
                        [cell.metadata.id]: {
                            status: "error",
                            img: "",
                            error: output,
                            output: currentOutput.join("\n"),
                            source: cell.source.join("\n"),
                        }
                    });
                }
            });

            pyodide.runPython(src + "\nprint('<end>')");
        }
        catch (e: any) {

            setStatuses({
                ...statuses,
                [cell.metadata.id]: {
                    status: "error",
                    img: "",
                    error: e.toString(),
                    output: "",
                    source: cell.source.join("\n"),
                }
            });

            console.error("Error running cell", e);
        }
    }

    useEffect(() => {
        if (statuses[cell.metadata.id]?.status == "running") {
            runCell();
        }
    }, [statuses[cell.metadata.id]?.status])


    useEffect(() => {
        if (cell.metadata.selected) {
            console.log("Scrolling to cell");
            codeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [cell.metadata.selected])

    useEffect(() => {
        if (cell.metadata.run) {
            prepareCell();
        }
    }, [cell.metadata.run])


    return (
        <div className="w-full rounded-md shadow-md transition-colors p-4" style={{
            backgroundColor: cell.metadata.selected ? "#ffffff09" : "transparent"
        }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faPlay} className="text-gray-500 mr-2 cursor-pointer" onClick={prepareCell} />
                    <span className="text-sm text-gray-500">[{index + 1}]:</span>

                    {statuses[cell.metadata.id]?.status == "running" ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 ml-2" /> : null}
                    {statuses[cell.metadata.id]?.status == "completed" ? <FontAwesomeIcon icon={faCheck} className="text-green-500 ml-2" /> : null}
                    {statuses[cell.metadata.id]?.status == "error" ? <FontAwesomeIcon icon={faX} className="text-red-500 ml-2" /> : null}

                </div>
                <div className="flex items-center">

                </div>
            </div>
            <div className="mt-2">
                <pre ref={codeRef} className="python p-4 text-sm w-full overflow-auto scroll rounded-sm">
                    {source}
                </pre>
                {statuses[cell.metadata.id]?.status == "completed" && statuses[cell.metadata.id]?.output != "" ? <pre ref={outputRef} className="p-4 text-sm w-full overflow-auto scroll rounded-sm">
                    {statuses[cell.metadata.id]?.output}
                </pre> : null}
                {statuses[cell.metadata.id]?.status == "error" ? <pre ref={errorRef} className="p-4 text-sm w-full overflow-auto scroll rounded-sm text-red-500">
                    {statuses[cell.metadata.id]?.error}
                </pre> : null}
            </div>
        </div>
    )

}

