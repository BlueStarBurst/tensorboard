import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReactDOM from 'react-dom';

import Canvas from './Canvas.js';

import './styles.css';

var w = localStorage.getItem('w') || 50;
var h = localStorage.getItem('h') || 0;

// get local storage for dark mode
var darkMode = localStorage.getItem('darkMode');
if (darkMode === null) {
    darkMode = false;
    localStorage.setItem('darkMode', darkMode);
} else {
    darkMode = darkMode === 'true';
}

function setDarkTheme(isDark) {
    if (isDark) {
        document.documentElement.style.setProperty('--bg-color', '#222');
        document.documentElement.style.setProperty('--text-color', '#fff');
        document.documentElement.style.setProperty('--canvas-color', '#1c2a43');
    } else {
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--canvas-color', '#00000004');
    }
    localStorage.setItem('darkMode', isDark);
    darkMode = isDark;
}

var pixelL = localStorage.getItem('pixelL') || 10;

setDarkTheme(darkMode);

document.documentElement.style.setProperty('--mouse-x', w + '%');

function App() {

    const [isResizing, setIsResizing] = React.useState(false);

    function setMouseCoords(e) {
        if (isResizing) {
            resizeTools(e);
        }
    }

    function resizeTools(e) {
        // set css variable --mouse-x to the mouse x position
        // console.log(e);
        pixelL = e.clientX;
        var parentWidth = e.target.parentElement.clientWidth;
        var parentHeight = e.target.parentElement.clientHeight;
        console.log(e.clientX / parentWidth * 100)
        w = (e.clientX / parentWidth * 100);
        document.documentElement.style.setProperty('--pointer-events', 'none');
        document.documentElement.style.setProperty('--mouse-x', (e.clientX / parentWidth * 100) + '%');
        document.documentElement.style.setProperty('--mouse-y', (e.clientY / parentHeight * 100) + '%');
        setCanvasWidth(e.clientX);
        setCanvasHeight(canvasContainer.current.clientHeight);
    }

    function onKeyPressed(e) {
        // console.log('onKeyDown', e);
        // get ig b is pressed
        if (e.key === 'b') {
            console.log('b');
            setDarkTheme(!darkMode);
        }
    }

    

    const canvasContainer = React.useRef(null);
    const [canvasWidth, setCanvasWidth] = React.useState(300);
    const [canvasHeight, setCanvasHeight] = React.useState(300);

    function mouseUp(e) {
        console.log('mouseUp');
        setIsResizing(false);
        // save w and h to local storage
        localStorage.setItem('w', w);
        localStorage.setItem('h', h);
        localStorage.setItem('pixelL', pixelL);
        document.documentElement.style.setProperty('--pointer-events', 'all');
    }

    useEffect(() => {
        document.addEventListener('keydown', onKeyPressed);
        
        setCanvasWidth(localStorage.getItem('canvasWidth') || 300);
        setCanvasHeight(canvasContainer.current.clientHeight);
        return () => {
            document.removeEventListener('keydown', onKeyPressed);
        }
    }, []);

    

    return (
        <div className='rows' onMouseMove={setMouseCoords} onMouseUp={mouseUp}>
            <div className='canvas' onKeyDown={onKeyPressed} ref={canvasContainer} >
                <Canvas />
                {/* <Canvas canvasHeight={canvasHeight} canvasWidth={canvasWidth} isOverride={isResizing} /> */}
            </div>
            <div className="slider" onMouseDown={(e) => {e.preventDefault();setIsResizing(true)}}>
            </div>
            <div className='notebook'>
                NOTEBOOK
            </div>
        </div>
    );
}

// render the app component
ReactDOM.render(<App />, document.getElementById('root'));