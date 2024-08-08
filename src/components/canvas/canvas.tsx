"use client";

import {
    useEffect,
    useCallback,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import * as React from "react";
import { Element, ElementsContext } from "./elements-context";
import components from "../blocks";
import { clone, useNotebook } from "../tabs/notebook-utils";
import { useStorage } from "../misc/local-storage";

type CanvasProps = {
    canvasWidth: number;
    canvasHeight: number;
    maxScale?: number;
    minScale?: number;
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
};

type Point = {
    x: number;
    y: number;
};

const ORIGIN = Object.freeze({ x: 0, y: 0 });

function diffPoints(p1: Point, p2: Point) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1: Point, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

var timer: any = null;

export default function Canvas({
    maxScale = 3,
    minScale = 0.5,
    ...props
}: CanvasProps) {

    const {
        updateNotebook
    } = useNotebook();

    const {
        saveElements,
        loadElements
    } = useStorage();

    const {
        elements,
        setElements,
        selectedElement,
        setSelectedElement,
    } = React.useContext(ElementsContext);

    function getElements() {
        return elements;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<Point>(ORIGIN);
    const [mousePos, setMousePos] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const isResetRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);

    const [ratio, setRatio] = useState<number>(window.devicePixelRatio || 1);

    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = React.useState(false);
    const [multiDrag, setMultiDrag] = React.useState(false);
    const [lining, setLining] = React.useState(false);
    // const [selectedElement, setSelectedElement] = React.useState<Element | null>(null);
    const [oldSelectedElement, setOldSelectedElement] = React.useState<Element | null>(null);
    const [isPanning, setIsPanning] = React.useState(false);
    const [relativePos, setRelativePos] = React.useState({});

    const [selectBox, setSelectBox] = React.useState<{
        x1: number,
        y1: number,
        x2: number,
        y2: number
    } | null>(null);
    const [selectedElems, setSelectedElems] = React.useState<Element[]>([]);

    // update last offset
    useEffect(() => {
        lastOffsetRef.current = offset;
    }, [offset]);

    // functions for selecting elements
    const isOverLineStart = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasPoint = {
            x: (e.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
            y: (e.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
        };
        for (var key in elements) {
            if (elements[key].isLining(canvasPoint.x, canvasPoint.y)) {
                return elements[key];
            }
        }
        return null;
    }

    const isOverLineStartEnd = (e: MouseEvent) => {
        const canvasPoint = {
            x: (e.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
            y: (e.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
        };
        for (var key in elements) {
            if (elements[key].isLineEnd(canvasPoint.x, canvasPoint.y)) {
                return elements[key];
            }
        }
        return null;
    }

    const isOverElement = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasPoint = {
            x: (e.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
            y: (e.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
        };
        for (var key in elements) {
            if (elements[key].isDragging(canvasPoint.x, canvasPoint.y)) {
                return elements[key];
            }
        }
        return null;
    }

    const isOverLine = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasPoint = {
            x: (e.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
            y: (e.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
        };
        for (var key in elements) {
            if (elements[key].isLineSelected(canvasPoint.x, canvasPoint.y)) {
                return elements[key];
            }
        }
        return null;
    }

    // reset
    const reset = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (context && !isResetRef.current) {
                const _viewportTopLeft = JSON.parse(localStorage.getItem("viewportTopLeft") || JSON.stringify(ORIGIN));
                const _scale = JSON.parse(localStorage.getItem("scale") || "1");
                console.log("reset", _viewportTopLeft, _scale);
                // adjust for device pixel density
                context.canvas.width = props.canvasWidth * ratio;
                context.canvas.height = props.canvasHeight * ratio;
                context.scale(ratio * _scale, ratio * _scale);
                setScale(_scale);

                // reset state and refs
                setContext(context);
                setOffset(ORIGIN);
                setMousePos(ORIGIN);
                context.translate(-_viewportTopLeft.x, -_viewportTopLeft.y);
                setViewportTopLeft(_viewportTopLeft);
                lastOffsetRef.current = ORIGIN;
                lastMousePosRef.current = ORIGIN;

                // this thing is so multiple resets in a row don't clear canvas
                isResetRef.current = true;
                redrawCanvas();
            }
        },
        [props.canvasWidth, props.canvasHeight]
    );

    // functions for panning
    const panCanvas = useCallback(
        (event: MouseEvent) => {
            if (context) {
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);

                setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
        },
        [context]
    );

    const dragElement = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElement) {
                const canvasPoint = {
                    x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                };

                const diff = diffPoints(canvasPoint, { x: lastMousePosRef.current.x, y: lastMousePosRef.current.y });

                lastMousePosRef.current = { x: canvasPoint.x, y: canvasPoint.y };

                selectedElement.move(diff.x, diff.y);
                redrawCanvas();
            }
        },
        [scale, viewportTopLeft, selectedElement, lastMousePosRef]
    );

    const dragElements = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElems && selectedElems.length > 0) {
                const canvasPoint = {
                    x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                };

                const diff = diffPoints(canvasPoint, { x: lastMousePosRef.current.x, y: lastMousePosRef.current.y });

                lastMousePosRef.current = { x: canvasPoint.x, y: canvasPoint.y };

                selectedElems.forEach((element) => {
                    element.move(diff.x, diff.y);
                });
                redrawCanvas();

            }
        },
        [scale, viewportTopLeft, selectedElems, selectBox]
    );

    const lineElement = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElement) {
                const canvasPoint = {
                    x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                };

                // const diff = diffPoints(canvasPoint, { x: selectedElement.x + selectedElement.w/2, y: selectedElement.y + selectedElement.h/2 });

                selectedElement.lineTo(canvasPoint.x, canvasPoint.y);
                redrawCanvas();
            }
        },
        [scale, viewportTopLeft, selectedElement]
    );

    const selectBoxDrag = useCallback(
        (event: MouseEvent) => {
            if (context) {
                const canvasPoint = {
                    x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                };

                const selectedElements = Object.values(elements).filter((element) => {
                    const shouldSelect = element.isInBounds(lastMousePosRef.current.x, lastMousePosRef.current.y, canvasPoint.x, canvasPoint.y);

                    if (shouldSelect) {
                        element.dragging = true;
                    } else {
                        element.dragging = false;
                    }
                    return shouldSelect;
                });

                setSelectedElems(selectedElements);
                updateNotebook();

                setSelectBox((prev) => {
                    if (prev) {
                        return {
                            x1: prev.x1,
                            y1: prev.y1,
                            x2: canvasPoint.x,
                            y2: canvasPoint.y
                        };
                    }
                    return prev;
                });
                // redrawCanvas();
            }
        },
        [selectBox, scale, viewportTopLeft, elements, selectedElems]
    );

    const selectBoxEnd = useCallback(
        (event: MouseEvent) => {
            if (context) {
                const canvasPoint = {
                    x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                };

                const selectedElements = Object.values(elements).filter((element) => {
                    const shouldSelect = element.isInBounds(lastMousePosRef.current.x, lastMousePosRef.current.y, canvasPoint.x, canvasPoint.y);

                    if (shouldSelect) {
                        element.dragging = true;
                    } else {
                        element.dragging = false;
                    }
                    return shouldSelect;
                });

                setSelectedElems(selectedElements);
                updateNotebook();
                setSelectBox(null);
            }
            document.removeEventListener("mousemove", selectBoxDrag);
            document.removeEventListener("mouseup", selectBoxEnd);
        },
        [selectBox, selectBoxDrag, selectedElems]
    );

    const dropElement = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElement) {

                if (timer) {
                    // stay selected
                    clearTimeout(timer);
                    setDragging(false);
                    document.removeEventListener("mousemove", dragElement);
                    document.removeEventListener("mouseup", dropElement);
                    return;
                }

                // selectedElement.dragging = false;
                selectedElement.lining = false;
                setDragging(false);
                setLining(false);
                // setSelectedElement(null);
                console.log("drop element");
                updateNotebook();
            }
            document.removeEventListener("mousemove", dragElement);
            document.removeEventListener("mouseup", dropElement);
        },
        [panCanvas, dragElement, selectedElement, lastMousePosRef, canvasRef]
    );

    const dropElements = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElems) {
                selectedElems.forEach((element) => {
                    element.dragging = false;
                });
                setDragging(false);
                setMultiDrag(false);
                console.log("drop elements");
                updateNotebook();
            }
            document.removeEventListener("mousemove", dragElements);
            document.removeEventListener("mouseup", dropElements);
        },
        [panCanvas, dragElements, selectedElems]
    );

    const endLineElement = useCallback(
        (event: MouseEvent) => {
            if (context && selectedElement) {

                //check if line is over element
                const lineEnd = isOverLineStartEnd(event);
                if (lineEnd) {
                    selectedElement.lineToElement(lineEnd.id);
                } else {

                }
                selectedElement.lineTo(-1, -1);
                redrawCanvas();
                setDragging(false);
                setLining(false);
                updateNotebook();
            }
            document.removeEventListener("mousemove", lineElement);
            document.removeEventListener("mouseup", endLineElement);
        },
        [panCanvas, lineElement, selectedElement]
    );

    const mouseUp = useCallback(() => {
        document.removeEventListener("mousemove", panCanvas);
        document.removeEventListener("mouseup", mouseUp);
    }, [panCanvas, dragElement, selectedElement]);

    useEffect(() => {
        if (dragging) {
            document.addEventListener("mouseup", dropElement);
            document.addEventListener("mousemove", dragElement);
        } else {
            document.removeEventListener("mouseup", dropElement);
            document.removeEventListener("mousemove", dragElement);
        }
    }, [selectedElement, dragging]);

    useEffect(() => {
        if (lining) {
            document.addEventListener("mouseup", endLineElement);
            document.addEventListener("mousemove", lineElement);
        } else {
            document.removeEventListener("mouseup", endLineElement);
            document.removeEventListener("mousemove", lineElement);
        }
    }, [selectedElement, lining]);

    useEffect(() => {
        if (multiDrag) {
            setSelectBox(null);
            document.addEventListener("mouseup", dropElements);
            document.addEventListener("mousemove", dragElements);
        } else {
            document.removeEventListener("mouseup", dropElements);
            document.removeEventListener("mousemove", dragElements);
        }
    }, [multiDrag]);

    const interactCanvas = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

            lastMousePosRef.current = {
                x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
            };

            if (event.button === 2) {
                // right click
                event.preventDefault();
                setSelectBox({
                    x1: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y1: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y,
                    x2: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
                    y2: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
                });
                document.addEventListener("mouseup", selectBoxEnd);
                document.addEventListener("mousemove", selectBoxDrag);
                return;
            }


            const line = isOverLine(event);

            if (line) {

                if (selectedElement) {
                    selectedElement.dragging = false;
                    updateNotebook();
                }
                if (selectedElement && line.id != selectedElement.id) {
                    selectedElement.selectedLine = null;
                }
                setSelectedElement(line);
                setOldSelectedElement(line);
                setSelectedElems([]);
                redrawCanvas();
                return;
            } else {
                if (selectedElement) {
                    selectedElement.selectedLine = null;
                }
                setSelectedElement(null);
            }


            const lineStart = isOverLineStart(event);

            if (lineStart) {
                setLining(true);
                setSelectedElement(lineStart);
                setOldSelectedElement(lineStart);
                lineStart.lining = true;
                lineStart.dragging = true;
                return;
            } else {
                if (selectedElement) {
                    selectedElement.lining = false;
                }
                setLining(false);
                setSelectedElement(null);
            }

            const element = isOverElement(event);

            if (selectedElems.length > 0) {
                setSelectBox(null);
                if (element && selectedElems.includes(element)) {
                    selectedElems.forEach((elem) => {
                        elem.dragging = true;
                    });
                    // setDragging(true);
                    setMultiDrag(true);
                    return;
                } else {
                    selectedElems.forEach((elem) => {
                        elem.dragging = false;
                    });
                    // setDragging(false);
                    setMultiDrag(false);
                    setSelectedElems([]);
                    setSelectedElement(null);
                    setOldSelectedElement(null);
                    redrawCanvas();
                }
            }

            if (element) {

                if (selectedElement) {
                    selectedElement.dragging = false;
                    selectedElement.selectedLine = null;

                }

                timer = setTimeout(() => {
                    timer = null;
                    clearTimeout(timer);
                }, 200);

                setDragging(true);
                element.dragging = true;
                setSelectedElement(element);
                setOldSelectedElement(element);
                redrawCanvas();

                // document.addEventListener("mousemove", dragElement);
                updateNotebook();
                return;
            } else {
                if (selectedElement) {
                    selectedElement.dragging = false;
                    updateNotebook();
                }
                setDragging(false);
                setSelectedElement(null);
                setOldSelectedElement(null);
            }

            document.addEventListener("mouseup", mouseUp);
            document.addEventListener("mousemove", panCanvas);

            lastMousePosRef.current = { x: event.pageX, y: event.pageY };
        },
        [panCanvas, dragElement, dropElement, mouseUp, scale, viewportTopLeft, selectedElement, selectBoxDrag, selectBoxEnd, selectBox, selectedElems]
    );

    // setup canvas and set context
    useLayoutEffect(() => {
        if (canvasRef.current) {
            // get new drawing context
            const renderCtx = canvasRef.current.getContext("2d");

            if (renderCtx) {
                reset(renderCtx);
            }
        }
    }, [reset, props.canvasHeight, props.canvasWidth]);

    // pan when offset or scale changes
    useLayoutEffect(() => {
        if (context && lastOffsetRef.current) {
            const offsetDiff = scalePoint(
                diffPoints(offset, lastOffsetRef.current),
                scale
            );

            if (viewportTopLeft.x <= 0 && offsetDiff.x >= 0) {
                offsetDiff.x = viewportTopLeft.x;
            }
            if (viewportTopLeft.y <= 0 && offsetDiff.y >= 0) {
                offsetDiff.y = viewportTopLeft.y;
            }
            if (viewportTopLeft.x >= props.canvasWidth - containerRef.current!.getBoundingClientRect().width / scale && offsetDiff.x <= 0) {
                offsetDiff.x = viewportTopLeft.x - (props.canvasWidth - containerRef.current!.getBoundingClientRect().width / scale);
            }
            if (viewportTopLeft.y >= props.canvasHeight - containerRef.current!.getBoundingClientRect().height / scale && offsetDiff.y <= 0) {
                offsetDiff.y = viewportTopLeft.y - (props.canvasHeight - containerRef.current!.getBoundingClientRect().height / scale);
            }

            context.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            isResetRef.current = false;
            localStorage.setItem("viewportTopLeft", JSON.stringify(viewportTopLeft));
            localStorage.setItem("scale", JSON.stringify(scale));
        }
    }, [context, offset, scale, containerRef.current?.getBoundingClientRect().width]);

    // draw
    useLayoutEffect(() => {
        if (context) {
            redrawCanvas();
        }
    }, [
        props.canvasWidth,
        props.canvasHeight,
        context,
        scale,
        offset,
        viewportTopLeft,
        elements,
        selectedElement,
        oldSelectedElement,
        selectBox
    ]);

    function drawGrid() {

        if (!context) {
            return;
        }

        const r = 2;
        const dist = 60;
        const w = context.canvas.width;
        const h = context.canvas.height;

        context.clearRect(0, 0, w, h);

        context.fillStyle = "#ffffff40";

        for (var i = dist / 2; i < w; i += dist) {
            for (var j = dist / 2; j < h; j += dist) {
                context.beginPath();
                context.arc(i, j, r, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    // add event listener on canvas for mouse position
    useEffect(() => {

        loadElements();
        // set viewport top left



        const canvasElem = canvasRef.current;
        if (canvasElem === null) {
            return;
        }

        function handleUpdateMouse(event: MouseEvent) {
            event.preventDefault();
            if (canvasRef.current) {
                const viewportMousePos = { x: event.clientX, y: event.clientY };
                const topLeftCanvasPos = {
                    x: canvasRef.current.offsetLeft,
                    y: canvasRef.current.offsetTop
                };
                setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
            }
        }

        canvasElem.addEventListener("mousemove", handleUpdateMouse);
        canvasElem.addEventListener("wheel", handleUpdateMouse);
        return () => {
            canvasElem.removeEventListener("mousemove", handleUpdateMouse);
            canvasElem.removeEventListener("wheel", handleUpdateMouse);
        };
    }, []);

    // add event listener on canvas for zoom
    useEffect(() => {
        const canvasElem = canvasRef.current;
        if (canvasElem === null) {
            return;
        }

        // this is tricky. Update the viewport's "origin" such that
        // the mouse doesn't move during scale - the 'zoom point' of the mouse
        // before and after zoom is relatively the same position on the viewport
        function handleWheel(event: WheelEvent) {
            event.preventDefault();
            if (context) {

                // if scale is greater than 3, don't zoom in
                if (scale > maxScale && event.deltaY < 0) {
                    return;
                } else if (scale < minScale && event.deltaY > 0) {
                    return;
                }

                const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
                const viewportTopLeftDelta = {
                    x: (mousePos.x / scale) * (1 - 1 / zoom),
                    y: (mousePos.y / scale) * (1 - 1 / zoom)
                };
                const newViewportTopLeft = addPoints(
                    viewportTopLeft,
                    viewportTopLeftDelta
                );

                context.translate(viewportTopLeft.x, viewportTopLeft.y);
                context.scale(zoom, zoom);
                context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

                setViewportTopLeft(newViewportTopLeft);
                setScale(scale * zoom);
                isResetRef.current = false;

                localStorage.setItem("scale", JSON.stringify(scale * zoom));
            }
        }

        canvasElem.addEventListener("wheel", handleWheel);
        return () => canvasElem.removeEventListener("wheel", handleWheel);
    }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);

    const [currentKeys, setCurrentKeys] = useState<string[]>([]);

    const keyboardDownHandler = useCallback(
        (event: React.KeyboardEvent<HTMLCanvasElement>) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("key", event.key, currentKeys);
            setCurrentKeys((prev) => {
                if (prev.includes(event.key)) {
                    return prev;
                }
                return [...prev, event.key];
            });
            if (event.key === "Delete") {

                if (selectedElems.length > 0) {
                    selectedElems.forEach((element) => {
                        element.deleteSelf();
                        console.log("delete", selectedElems);
                        console.log("elements", elements);
                        delete elements[element.id];
                    });
                    setElements(elements);
                    setSelectedElems([]);
                    setSelectedElement(null);
                    updateNotebook();
                    redrawCanvas();
                } else if (selectedElement) {

                    if (selectedElement.selectedLine) {
                        selectedElement.disconnectOutput();
                        selectedElement.selectedLine = null;

                    } else {
                        selectedElement.deleteSelf();
                        delete elements[selectedElement.id];
                        console.log("delete", selectedElement.id);
                        console.log("elements", elements);
                        setElements(elements);
                        setSelectedElement(null);
                    }
                    redrawCanvas();
                    updateNotebook();
                }
            }
        },
        [elements, setElements, selectedElement, setSelectedElement, selectedElems, setSelectedElems, selectBox, updateNotebook, currentKeys, setCurrentKeys]
    );

    const keyboardUpHandler = useCallback(
        (event: React.KeyboardEvent<HTMLCanvasElement>) => {
            setCurrentKeys((prev) => {
                return prev.filter((key) => key !== event.key);
            });
        },
        [currentKeys, setCurrentKeys]
    );

    useEffect(() => {
        if (currentKeys.includes("Control")) {
            if (currentKeys.includes("z")) {
                console.log("undo");
            } else if (currentKeys.includes("y")) {
                console.log("redo");
            }
        }
    }, [currentKeys]);

    function getNewId() {
        // get new id of only 6 digits
        let newId = Math.floor(Math.random() * 1000000);
        while (elements[newId]) {
            newId = Math.floor(Math.random() * 1000000);
        }
        return newId;
    }

    function dropHandler(event: React.DragEvent) {
        event.preventDefault();
        const componentKey = event.dataTransfer.getData("componentKey");
        console.log("drop", componentKey);

        if (!components[componentKey]) {
            return;
        }

        // const obj = Object.create(components[componentKey]);

        // const newComponent = Object.assign(obj, components[componentKey]);
        const newComponent = clone(components[componentKey]);
        newComponent.id = getNewId();
        newComponent.key = componentKey;

        // mouse position relative to canvas
        const canvasPoint = {
            x: (event.clientX - canvasRef.current!.offsetLeft) / scale + viewportTopLeft.x,
            y: (event.clientY - canvasRef.current!.offsetTop) / scale + viewportTopLeft.y
        };

        console.log("canvasPoint", canvasPoint);

        var element = new Element(canvasPoint.x, canvasPoint.y, 150, 150, newComponent, getElements);
        var tempElements = elements;
        tempElements[newComponent.id] = element;
        setElements(tempElements);
        updateNotebook();
        // elementsList = tempElements;
        redrawCanvas();
    }

    function redrawCanvas() {
        // draw the background grid

        if (!context) {
            return;
        }

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        drawGrid();

        Object.keys(elements).forEach((key) => {
            elements[key].drawLines(context);
        });
        Object.keys(elements).forEach((key) => {
            elements[key].draw(context);
        });

        if (selectBox != null) {
            context.strokeStyle = "#fff";
            context.lineWidth = 2;
            context.strokeRect(
                selectBox.x1,
                selectBox.y1,
                selectBox.x2 - selectBox.x1,
                selectBox.y2 - selectBox.y1
            );
            context.fillStyle = "#ffffff25";
            context.fillRect(
                selectBox.x1,
                selectBox.y1,
                selectBox.x2 - selectBox.x1,
                selectBox.y2 - selectBox.y1
            );
        }
    }

    useEffect(() => {
        if (context) {
            console.log("REDRAWING NEW ELEMENTS", elements);

            // set getElements function for each element
            Object.keys(elements).forEach((key) => {
                elements[key].getElements = getElements;
                elements[key].fixLines();
            });

            updateNotebook();
            redrawCanvas();
        }
    }, [elements]);

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden border-none outline-none">
            {/* <div draggable={false} className="absolute pointer-events-none opacity-50 overflow-hidden" style={{
                userSelect: "none",
            }}>
                <pre>scale: {scale}</pre>
                <pre>offset: {JSON.stringify(offset)}</pre>
                <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
                <pre>mousePos: {JSON.stringify(mousePos)}</pre>
            </div> */}
            <canvas
                tabIndex={0}
                onDrop={dropHandler}
                onMouseDown={interactCanvas}
                onKeyDown={keyboardDownHandler}
                onKeyUp={keyboardUpHandler}
                ref={canvasRef}
                width={props.canvasWidth * ratio}
                height={props.canvasHeight * ratio}
                style={{
                    width: `${props.canvasWidth}px`,
                    height: `${props.canvasHeight}px`,
                    border: "none",
                    outline: "none",
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            ></canvas>

        </div>
    );
}
