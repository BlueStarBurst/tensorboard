import React from 'react';

export default function Canvas(props) {
    const canvas = React.useRef(null);

    React.useEffect(() => {
        if (canvas) {
            // draw a grid of dots on the canvas element
            const ctx = canvas.current.getContext('2d');

            const r = 3;
            const dist = 60;
            const w = canvas.current.width;
            const h = canvas.current.height;

            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = '#ffffff25';
            for (var i = dist / 2; i < w; i += dist) {
                for (var j = dist / 2; j < h; j += dist) {
                    ctx.beginPath();
                    ctx.arc(i, j, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }, [canvas]);

    function preventDefault(e) {
        e.preventDefault();
    }

    return (
        <canvas ref={canvas} className='canvas-elem' width={2000} height={2000} onDrag={preventDefault} />
    )
}