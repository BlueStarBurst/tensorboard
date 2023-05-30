import React from 'react';

export default function Canvas(props) {
    const canvas = React.useRef(null);

    React.useEffect(() => {
        if (canvas) {
            console.log("DARK THEME")
            // draw a grid of dots on the canvas element
            const ctx = canvas.current.getContext('2d');

            const r = 2.5;
            const dist = 50;
            const w = canvas.current.width * 5;
            const h = canvas.current.height * 5;

            ctx.clearRect(0, 0, w, h);

            if (props.darkMode) {
                ctx.fillStyle = '#ffffff25';
            } else {
                ctx.fillStyle = '#00000025';
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
        <canvas ref={canvas} className='canvas-elem' width={3000} height={3000} onDrag={preventDefault} />
    )
}