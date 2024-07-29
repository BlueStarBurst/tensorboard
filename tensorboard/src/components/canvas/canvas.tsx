"use client";

import {
    useEffect,
    useCallback,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import * as React from "react";

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

export default function Canvas({
    maxScale = 3,
    minScale = 0.5,
    ...props
}: CanvasProps) {
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

    // update last offset
    useEffect(() => {
        lastOffsetRef.current = offset;
    }, [offset]);

    // reset
    const reset = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (context && !isResetRef.current) {
                // adjust for device pixel density
                context.canvas.width = props.canvasWidth * ratio;
                context.canvas.height = props.canvasHeight * ratio;
                context.scale(ratio, ratio);
                setScale(1);

                // reset state and refs
                setContext(context);
                setOffset(ORIGIN);
                setMousePos(ORIGIN);
                setViewportTopLeft(ORIGIN);
                lastOffsetRef.current = ORIGIN;
                lastMousePosRef.current = ORIGIN;

                // this thing is so multiple resets in a row don't clear canvas
                isResetRef.current = true;
            }
        },
        [props.canvasWidth, props.canvasHeight]
    );

    // functions for panning
    const mouseMove = useCallback(
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

    const mouseUp = useCallback(() => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
    }, [mouseMove]);

    const startPan = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
            lastMousePosRef.current = { x: event.pageX, y: event.pageY };
        },
        [mouseMove, mouseUp]
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
        }
    }, [context, offset, scale, containerRef.current?.getBoundingClientRect().width]);

    // draw
    useLayoutEffect(() => {
        if (context) {
            drawGrid();
        }
    }, [
        props.canvasWidth,
        props.canvasHeight,
        context,
        scale,
        offset,
        viewportTopLeft
    ]);

    function drawGrid() {

        if (!context) {
            return;
        }

        const r = 2;
        const dist = 30;
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
            }
        }

        canvasElem.addEventListener("wheel", handleWheel);
        return () => canvasElem.removeEventListener("wheel", handleWheel);
    }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);

    return (
        <div ref={containerRef} className="w-full h-full">
            {/* <button onClick={() => context && reset(context)}>Reset</button>
            <pre>scale: {scale}</pre>
            <pre>offset: {JSON.stringify(offset)}</pre>
            <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre> */}
            <canvas
                onMouseDown={startPan}
                ref={canvasRef}
                width={props.canvasWidth * ratio}
                height={props.canvasHeight * ratio}
                style={{
                    border: "2px solid #000",
                    width: `${props.canvasWidth}px`,
                    height: `${props.canvasHeight}px`
                }}
            ></canvas>
        </div>
    );
}
