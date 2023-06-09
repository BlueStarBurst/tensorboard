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
        document.documentElement.style.setProperty('--bg-color', '#182031');
        document.documentElement.style.setProperty('--text-color', '#b0b0b0');
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

var mouseXext = 0;
var mouseYext = 0;

setDarkTheme(darkMode);

document.documentElement.style.setProperty('--mouse-x', w + '%');

function App() {

    const [darkThemes, setDarkThemes] = React.useState(false);

    const [isResizing, setIsResizing] = React.useState(false);

    const [mouseX, setMouseX] = React.useState(0);
    const [mouseY, setMouseY] = React.useState(0);

    const [panel, setPanel] = React.useState('tools');

    function setMouseCoords(e) {
        setMouseX(e.clientX);
        setMouseY(e.clientY);
        mouseXext = e.clientX;
        mouseYext = e.clientY;
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
        // setCanvasWidth(e.clientX);
        // setCanvasHeight(canvasContainer.current.clientHeight);

        refreshCanvasWidth();
    }

    function refreshCanvasWidth() {
        var canvas = canvasContainer.current.children[0];

        var newWidth = Math.max(canvas.clientWidth, window.innerWidth * w / 100 - 20);
        var newHeight = Math.max(canvas.clientHeight, window.innerWidth * w / 100 - 20);

        // resize the canvas element by the delta
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';

        // save to local storage
        localStorage.setItem('canvasWidth', newWidth);
        localStorage.setItem('canvasHeight', newHeight);

        // save scroll position
        localStorage.setItem('scrollX', canvasContainer.current.scrollLeft);
        localStorage.setItem('scrollY', canvasContainer.current.scrollTop);
    }

    function onKeyPressed(e) {
        // console.log('onKeyDown', e);
        // get ig b is pressed
        if (e.key === 'b') {
            console.log('b');
            console.log(darkThemes);
            setDarkThemes(!darkMode);
            setDarkTheme(!darkMode);
        }
    }

    const canvasContainer = React.useRef(null);

    function mouseUp(e) {
        console.log('mouseUp');
        setIsResizing(false);
        setIsPanning(false);
        setIsDragging(false);
        // save w and h to local storage

        // get all children of the element with id "parent" and add the transition-width class
        var children = document.getElementById('parent').children;
        for (var i = 0; i < children.length; i++) {
            children[i].classList.add('transition-width');
        }

        if (w > (80 + 20 / 2)) {
            document.documentElement.style.setProperty('--mouse-x', 100 + '%');
            w = 100;
        } else if (w > (80)) {
            document.documentElement.style.setProperty('--mouse-x', 80 + '%');
            w = 80;
        } else if (w < (60)) {
            document.documentElement.style.setProperty('--mouse-x', 60 + '%');
            w = 60;
        }



        localStorage.setItem('w', w);
        localStorage.setItem('h', h);

        document.documentElement.style.setProperty('--pointer-events', 'all');
        document.documentElement.style.setProperty('--cursor', 'auto');
        refreshCanvasWidth();
    }

    const [isPanning, setIsPanning] = React.useState(false);

    function panCanvas(e) {
        // pan the canvasContainer wheen the mouse is down and moving
        // console.log('panCanvas', e);

        if (!isPanning) {
            return;
        }
        document.documentElement.style.setProperty('--cursor', 'grabbing');
        // set the canvas container scroll position
        canvasContainer.current.scrollLeft -= e.movementX;
        canvasContainer.current.scrollTop -= e.movementY;

    }


    useEffect(() => {
        document.addEventListener('keydown', onKeyPressed);

        // prevent wheel scrolling on the canvasContainer element
        canvasContainer.current.addEventListener('wheel', zoomContainer, { passive: false });

        const canvas = canvasContainer.current.children[0];

        if (localStorage.getItem('canvasWidth') === null) {
            localStorage.setItem('canvasWidth', canvas.clientWidth);
            localStorage.setItem('canvasHeight', canvas.clientHeight);
        }

        setDarkThemes(darkMode)

        // set the canvas width and height
        console.log('canvasWidth', localStorage.getItem('canvasWidth'));
        canvas.style.width = localStorage.getItem('canvasWidth') + 'px';
        canvas.style.height = localStorage.getItem('canvasHeight') + 'px';

        // set the canvasContainer scroll position
        canvasContainer.current.scrollLeft = localStorage.getItem('scrollX') || 0;
        canvasContainer.current.scrollTop = localStorage.getItem('scrollY') || 0;


        // setCanvasWidth(localStorage.getItem('canvasWidth') || 300);
        // setCanvasHeight(canvasContainer.current.clientHeight);
        return () => {
            document.removeEventListener('keydown', onKeyPressed);
        }
    }, []);

    function preventDefault(e) {
        console.log('preventDefault')
        e.preventDefault();
    }

    function zoomContainer(e) {
        e.preventDefault();

        var delta = -1 * e.deltaY || e.detail || e.wheelDelta;

        // get the child of the canvasContainer element
        var canvas = canvasContainer.current.children[0];

        var newWidth = Math.max(canvas.clientWidth + delta, window.innerWidth * w / 100 - 20);
        var newHeight = Math.max(canvas.clientHeight + delta, window.innerWidth * w / 100 - 20);

        newWidth = Math.min(newWidth, 3000);
        newHeight = Math.min(newHeight, 3000);

        // resize the canvas element by the delta
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
        refreshCanvasWidth();
    }

    const [isDragging, setIsDragging] = React.useState(false);

    const [panelContent, setPanelContent] = React.useState(<Tools />);
    useEffect(() => {
        if (panel == 'tools') {
            setPanelContent(<Tools mouseX={mouseX} mouseY={mouseY} isDragging={isDragging} setIsDragging={setIsDragging} />);
        } else if (panel == 'notebook') {
            setPanelContent(<Notebook />);
        }
    }, [panel]);

    return (
        <div className='rows' id="parent" onMouseMove={setMouseCoords} onMouseUp={mouseUp}>
            <div className='canvas' onMouseMove={panCanvas} onKeyDown={onKeyPressed} onMouseDown={(e) => { setIsPanning(true) }} ref={canvasContainer} >
                <Canvas darkMode={darkThemes} />
                {/* <Canvas canvasHeight={canvasHeight} canvasWidth={canvasWidth} isOverride={isResizing} /> */}
            </div>
            <div className="slider" onMouseDown={(e) => {
                e.preventDefault(); setIsResizing(true);
                var children = document.getElementById('parent').children;
                for (var i = 0; i < children.length; i++) {
                    children[i].classList.remove('transition-width');
                }
            }}>
            </div>
            <div className='right-panel'>
                <div className='right-panel-header'>
                    <div className={'right-panel-header-option ' + (panel == 'tools' ? 'selected' : "")} onClick={(e) => {
                        setPanel('tools');
                    }}>
                        <h5>Tools</h5>
                    </div>
                    <div className={'right-panel-header-option ' + (panel == 'notebook' ? 'selected' : "")} onClick={(e) => {
                        setPanel('notebook');
                    }}>
                        <h5>Notebook</h5>
                    </div>
                </div>

                {panel == "tools" ?
                    <div className='tools'>
                        <DraggableTemplate mouseX={mouseX} mouseY={mouseY} isDragging={isDragging} setIsDragging={setIsDragging}>
                            Data
                        </DraggableTemplate>
                    </div>
                    : panelContent}

            </div>
        </div>
    );
}

function Tools(props) {
    return null;
}

function Notebook(props) {
    return null;
}

function DraggableTemplate(props) {

    const [thisComponent, setThisComponent] = React.useState(false);
    const ref = React.useRef(null);

    const [numInputs, setNumInputs] = React.useState(0);
    const [numOutputs, setNumOutputs] = React.useState(0);

    function mouseDown(e) {
        setThisComponent(true);
        props.setIsDragging(true);
    }

    useEffect(() => {
        if (!props.isDragging) {
            setThisComponent(false);
        }
        if (thisComponent) {
            ref.current.style.left = mouseXext + 'px';
            ref.current.style.top = mouseYext + 'px';
        }
    }, [thisComponent, props.mouseX, props.mouseY, props.isDragging]);

    return (
        <>
            {thisComponent ?
                <div
                    ref={ref}
                    className='draggable'
                    onMouseUp={(e) => { props.setIsDragging(false); setThisComponent(false) }}
                    onMouseMove={(e) => { console.log('dragging'); }}>
                    <div className='inputs'>
                        {
                            // loop for numOutputs
                            [...Array(numInputs)].map((e, i) => {
                                return <div className='input' key={i} />
                            })
                        }
                    </div>
                    {props.children}
                    <div className='outputs'>
                        {
                            // loop for numOutputs
                            [...Array(numOutputs)].map((e, i) => {
                                return <div className='output' key={i} />
                            })
                        }
                    </div>
                </div> : null}
            <div className='template-component' onMouseDown={mouseDown}>
                <div className='inputs'>
                    {
                        // loop for numOutputs
                        [...Array(numInputs)].map((e, i) => {
                            return <div className='input' key={i} />
                        })
                    }
                </div>
                <div className='template-component-content'>
                    {props.children}
                </div>
                <div className='outputs'>
                    {
                        // loop for numOutputs
                        [...Array(numOutputs)].map((e, i) => {
                            return <div className='output' key={i} />
                        })
                    }
                </div>
            </div>
        </>

    )
}

// render the app component
ReactDOM.render(<App />, document.getElementById('root'));