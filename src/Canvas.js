import React, { useEffect } from "react";

export default function Canvas(props) {
	const canvas = React.useRef(null);

	React.useEffect(() => {
		if (canvas) {
			// console.log("DARK THEME")
			// draw a grid of dots on the canvas element
			const ctx = canvas.current.getContext("2d");

			const r = 1;
			const dist = 20;
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
	}, [props]);

	function preventDefault(e) {
		e.preventDefault();
	}

	return (
		<canvas
			ref={canvas}
			className="canvas-elem"
			width={props.size.x}
			height={props.size.y}
			onDrag={preventDefault}
		/>
	);
}

export function CanvasOverlay(props) {
	// make a transparent canvas that covers the entire canvas area and is used to draw lines
	// const canvas = React.useRef(null);

	// React.useEffect(() => {
	//     if (props.canvas) {
	//         const ctx = props.canvas.current.getContext('2d');
	//         ctx.clearRect(0, 0, props.canvas.current.width, props.canvas.current.height);

	//     }
	// }, [props]);

	// pts look like [{x1: 0, y1: 0, x2: 0, y2: 0}]
	React.useEffect(() => {
		if (props.canvas) {
            if (!props.linePts) return;

            var startPoint = document.getElementById("startPoint");
            // get the position of the start point relative to the canvas
            var rect = startPoint.getBoundingClientRect();
            var x = rect.left;
            var y = rect.top;

			console.log("DRAWING LINES", props.linePts);
			const ctx = props.canvas.current.getContext("2d");
			ctx.clearRect(0, 0, props.canvas.current.width, props.canvas.current.height);
			console.log(
				"CANVAS",
				props.canvas.current.width,
				props.canvas.current.height
			);
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			// console.log("DRAWING LINE", props.linePts[i])
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(props.linePts.x2 / props.canvas.current.offsetWidth, props.linePts.y2 / props.canvas.current.offsetHeight);
			ctx.stroke();
		}
	}, [props.linePts]);

	useEffect(() => {
		if (props.canvas) {
			// // draw a line across the canvas
			// const ctx = props.canvas.current.getContext('2d');
			// // fill the entire canvas with a blue rectangle
			// // draw a line across the canvas
			// ctx.strokeStyle = '#fff';
			// ctx.lineWidth = 100;
			// ctx.lineCap = 'round';
			// ctx.lineJoin = 'round';
			// ctx.beginPath();
			// ctx.moveTo(0, 0);
			// ctx.lineTo(props.canvas.current.width, props.canvas.current.height);
			// ctx.stroke();
		}
	}, []);

	function preventDefault(e) {
		e.preventDefault();
	}

	return (
		<canvas
			ref={props.canvas}
			className="canvas-elem canvas-overlay none_pointer_events"
			width={props.size.x}
			height={props.size.y}
			onDrag={preventDefault}
		/>
	);
}
