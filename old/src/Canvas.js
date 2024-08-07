import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";
import {
  Checkbox,
  FormControlLabel,
  FormLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Select,
  Slider,
} from "@mui/material";
import { InputGroup } from "react-bootstrap";
import { DBManager } from "./DB";
import { components } from "./Components";

import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { DragContainer } from "./Misc";

hljs.registerLanguage("python", python);

var interval = null;
var x,
  y = 0;

var touchX,
  touchY = -1;

var elementsList = [];

var timer = null;
var busy = false;

export default function Canvas(props) {
  const canvas = React.useRef(null);
  const canvas2 = React.useRef(null);

  const [elements, setElements] = React.useState({});
  const [dragging, setDragging] = React.useState(false);
  const [multiDrag, setMultiDrag] = React.useState(false);
  const [lining, setLining] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState(null);
  const [oldSelectedElement, setOldSelectedElement] = React.useState(null);
  const [isPanning, setIsPanning] = React.useState(false);

  const [selectBox, setSelectBox] = React.useState(null);
  const [selectedElems, setSelectedElems] = React.useState([]);

  useEffect(() => {
    elementsList = {};
    console.log("updating elements");
    var temp = DBManager.getInstance().getItem("elements") || {};

    Object.keys(temp).forEach((key) => {
      try {
        const proto = components[temp[key].component.key];

        var obj = Object.create(proto);
        // var tComp = temp[key].component;
        // obj = Object.assign(obj, tComp);

        // fill in the object with the default prototype values
        obj = Object.assign(obj, proto);

        obj.data = temp[key].component.data;
        // obj.inputs = temp[key].component.inputs;
        // obj.outputs = temp[key].component.outputs;
        // obj.helpers = temp[key].component.helpers;
        // obj.topInputs = temp[key].component.topInputs;

        var tComp = temp[key].component;
        obj = Object.assign(obj, tComp);

        // // assign the transpile function to the object
        obj.transpile = proto.transpile;
        obj.reload = proto.reload;
        obj.getOutput = proto.getOutput;
        obj.getHelp = proto.getHelp;

        // get prototype of the component

        // assign the new object to the element
        var elem = new Element(
          temp[key].x,
          temp[key].y,
          temp[key].w,
          temp[key].h,
          obj
        );

        console.log("loading element", elem);
        console.log(components[temp[key].component.key]);

        elem.fromJSON(temp[key]);
        elementsList[temp[key].component.id] = elem;
      } catch (e) {
        // remove the element from the list
        console.log("error loading element", e);
      }
    });

    // loop through the elements and fix the lines
    Object.keys(elementsList).forEach((key) => {
      elementsList[key].fixLines();
    });

    props.updateNotebook(elementsList);

    setElements(elementsList);

    redrawCanvas();
  }, [props.components, props.flip]);

  function onKeyboard(e) {

	// e.preventDefault();
	// e.stopPropagation();

    if (e.key == "Escape") {
      if (selectedElement) {
        selectedElement.dragging = false;
      }
      if (oldSelectedElement) {
        oldSelectedElement.dragging = false;
      }
      setDragging(false);
      setLining(false);
      setSelectedElement(null);
      setOldSelectedElement(null);
      props.selectElement(null);
      redrawCanvas();
    } else if (e.key == "Delete") {
      if (selectedElems.length > 0) {
        var tempElems = elements;
        selectedElems.forEach((elem) => {
          elem.deleteSelf();
          delete tempElems[elem.id];
          delete elementsList[elem.id];
        });
        props.updateNotebook(elementsList);
        setElements(tempElems);
        redrawCanvas();
      } else if (selectedElement != null) {
        console.log(selectedElement);
        if (
          selectedElement.selectedLine != null ||
          selectedElement.selectedBot != null
        ) {
          selectedElement.disconnectOutput();
          setSelectedElement(null);
          redrawCanvas();
          props.updateNotebook(elements);
          return;
        }

        selectedElement.deleteSelf();
        // selectedElement.removeElement();
        var tempElems = elements;
        delete tempElems[selectedElement.id];

        setElements(tempElems);
        props.updateNotebook(tempElems);
        elementsList = tempElems;
        redrawCanvas();
      } else if (oldSelectedElement != null) {
        if (
          oldSelectedElement.selectedLine != null ||
          oldSelectedElement.selectedBot != null
        ) {
          oldSelectedElement.disconnectOutput();
          setOldSelectedElement(null);
          redrawCanvas();
          props.updateNotebook(elements);
          return;
        }

        oldSelectedElement.deleteSelf();
        // oldSelectedElement.removeElement();
        var tempElems = elements;
        delete tempElems[oldSelectedElement.id];

        setElements(tempElems);
        props.updateNotebook(tempElems);
        elementsList = tempElems;
        redrawCanvas();
      }

      props.selectElement(null);
    } else if (e.key == "ArrowRight") {
      if (selectedElement != null) {
        var nextElem = selectedElement.getNext();
        if (nextElem) {
          nextElem = elementsList[nextElem];
          selectedElement.dragging = false;
          props.selectElement(nextElem);
          setSelectedElement(nextElem);
          nextElem.dragging = true;
          props.updateNotebook(elementsList);

          redrawCanvas();
        }
      }
    } else if (e.key == "ArrowLeft") {
      if (selectedElement != null) {
        var prevElem = selectedElement.getPrev();
        if (prevElem) {
          prevElem = elementsList[prevElem];
          selectedElement.dragging = false;
          props.selectElement(prevElem);
          setSelectedElement(prevElem);
          prevElem.dragging = true;
          props.updateNotebook(elementsList);

          redrawCanvas();
        }
      }
    } else if (e.key == "ArrowUp") {
      if (selectedElement != null) {
        var nextElem = selectedElement.getTop();
        if (nextElem) {
          nextElem = elementsList[nextElem];
          selectedElement.dragging = false;
          props.selectElement(nextElem);
          setSelectedElement(nextElem);
          nextElem.dragging = true;
          props.updateNotebook(elementsList);

          redrawCanvas();
        }
      }
    } else if (e.key == "ArrowDown") {
      if (selectedElement != null) {
        var prevElem = selectedElement.getBot();
        if (prevElem) {
          prevElem = elementsList[prevElem];
          selectedElement.dragging = false;
          props.selectElement(prevElem);
          setSelectedElement(prevElem);
          prevElem.dragging = true;
          props.updateNotebook(elementsList);

          redrawCanvas();
        }
      }
    } else if (e.key == "Space") {
      if (selectedElement != null) {
        selectedElement.toggleOutput();
        redrawCanvas();
      }
    }
    props.setKeyDown(null);
  }

  useEffect(() => {
    if (props.keyDown != null) {
      onKeyboard(props.keyDown);
    }
  }, [props.keyDown]);

  React.useEffect(() => {
    if (canvas) {
      redrawCanvas();
      const ctx2 = canvas2.current.getContext("2d");
      drawGrid(ctx2);
    }
  }, [props.size, props.darkMode]);

  React.useEffect(() => {
    if (canvas) {
      redrawCanvas();
    }
  }, [elements, selectedElement, oldSelectedElement, selectBox]);

  React.useEffect(() => {
    if (dragging || lining) {
      interval = setInterval(() => {
        if (selectedElement) {
          if (dragging) {
            selectedElement.moveTo(x, y);
          } else if (lining) {
            selectedElement.lineTo(x, y);
          }
        }
        redrawCanvas();
      }, 1000 / 60);
    } else {
      clearInterval(interval);
    }
  }, [dragging, lining]);

  function drawGrid(ctx) {
    const r = 2;
    const dist = 30;
    const w = canvas.current.width * 5;
    const h = canvas.current.height * 5;

    ctx.clearRect(0, 0, w, h);

    if (props.darkMode) {
      ctx.fillStyle = "#ffffff40";
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

  function redrawCanvas() {
    // draw the background grid

    elementsList = elements;
    const ctx = canvas.current.getContext("2d");
    const w = canvas.current.width * 5;
    const h = canvas.current.height * 5;

    ctx.clearRect(0, 0, w, h);

    Object.keys(elements).forEach((key) => {
      elements[key].drawLines(ctx);
    });
    Object.keys(elements).forEach((key) => {
      elements[key].draw(ctx);
    });

    if (selectBox != null) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectBox.x1,
        selectBox.y1,
        selectBox.x2 - selectBox.x1,
        selectBox.y2 - selectBox.y1
      );
      ctx.fillStyle = "#ffffff25";
      ctx.fillRect(
        selectBox.x1,
        selectBox.y1,
        selectBox.x2 - selectBox.x1,
        selectBox.y2 - selectBox.y1
      );
    }
  }

  function preventDefault(e) {
    e.preventDefault();
  }

  const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });

  function setBusy(b) {
    busy = b;
  }

  const [relativePos, setRelativePos] = React.useState({});

  function onMouseDownCanvas(e) {
    // add a new element to the canvas
    var rect = canvas.current.getBoundingClientRect();

    x = (e.clientX - rect.left) * (canvas.current.width / rect.width);
    y = (e.clientY - rect.top) * (canvas.current.height / rect.height);
    setLastMousePos({ x: x, y: y });

    props.setDisableOverlay(true);

    busy = false;

    if (selectedElement) {
      selectedElement.selectedLine == null;
      selectedElement.selectedBot == null;
    }
    if (oldSelectedElement) {
      oldSelectedElement.selectedLine = null;
      oldSelectedElement.selectedBot = null;
    }

    // if right click, start the select box
    if (e.button == 2) {
      props.selectElement(null);
      setSelectBox({ x1: x, y1: y, x2: x, y2: y });
      return;
    }

    var found = false;
    if (selectedElems.length > 0) {
      // loop through selected elements and check if the mouse is over one of them

      var tempRelPos = {};
      for (var i = 0; i < selectedElems.length; i++) {
        if (selectedElems[i].isDragging(x, y)) {
          // get relative position of the mouse to the element
          tempRelPos[selectedElems[i].id] = {
            x: x - selectedElems[i].x,
            y: y - selectedElems[i].y,
          };
          found = true;
          break;
        }
      }
      if (found) {
        setRelativePos(tempRelPos);
        setMultiDrag(true);
        canvas.current.style.cursor = "grabbing";
        return;
      }
    }

    Object.keys(elements).forEach((key) => {
      var elem = elements[key];
      if (elem.isLining(x, y)) {
        if (!found) {
          // unselect all elements
          for (var i = 0; i < selectedElems.length; i++) {
            selectedElems[i].dragging = false;
          }
          setSelectedElems([]);
        }
        busy = true;
        setBusy(true);
        if (oldSelectedElement) {
          oldSelectedElement.dragging = false;
        }
        if (selectedElement) {
          selectedElement.dragging = false;
        }

        elem.dragging = true;
        // elem.removeElement();
        elem.element = null;
        elem.lining = true;
        canvas.current.style.cursor = "crosshair";
        setSelectedElement(elem);
        props.selectElement(elem);
        setLining(true);
        redrawCanvas();
        props.updateNotebook(elements);
        return;
      } else if (elem.isDragging(x, y)) {
        if (!found) {
          // unselect all elements
          for (var i = 0; i < selectedElems.length; i++) {
            selectedElems[i].dragging = false;
          }
          setSelectedElems([]);
        }
        busy = true;
        setBusy(true);
        if (oldSelectedElement) {
          oldSelectedElement.dragging = false;
        }

        setSelectedElement(elem);
        props.selectElement(elem);
        elem.dragging = true;
        props.updateNotebook(elements);
        timer = setTimeout(() => {
          canvas.current.style.cursor = "grabbing";
          setDragging(true);
          redrawCanvas();
          clearTimeout(timer);
          timer = null;
        }, 250);
        return;
      } else if (elem.isLineSelected(x, y)) {
        if (!found) {
          // unselect all elements
          for (var i = 0; i < selectedElems.length; i++) {
            selectedElems[i].dragging = false;
          }
          setSelectedElems([]);
        }

        busy = true;
        setBusy(true);
        if (oldSelectedElement) {
          oldSelectedElement.dragging = false;
        }

        setSelectedElement(elem);
        props.selectElement(elem);
        // elem.dragging = true;
        elem.lining = true;
        canvas.current.style.cursor = "pointer";
        // setLining(true);
        redrawCanvas();
        return;
      }
    });

    if (busy) return;

    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
    }, 250);
    canvas.current.style.cursor = "grabbing";
    setIsPanning(true);
  }

  useEffect(() => {
    var tx = props.mouseUp[0];
    var ty = props.mouseUp[1];

    if (tx < 0 || ty < 0 || tx == undefined || ty == undefined) return;

    var rect = canvas.current.getBoundingClientRect();
    tx = (tx - rect.left) * (canvas.current.width / rect.width);
    ty = (ty - rect.top) * (canvas.current.height / rect.height);

    var element = new Element(tx, ty, 150, 150, props.currentComponent);
    var tempElements = elements;
    tempElements[props.currentComponent.id] = element;
    setElements(tempElements);
    props.updateNotebook(tempElements);
    elementsList = tempElements;
    setIsPanning(false);
    redrawCanvas();
  }, [props.mouseUp]);

  function onMouseUpCanvas(e) {
    if (timer) {
      // unselect all elements
      for (var i = 0; i < selectedElems.length; i++) {
        selectedElems[i].dragging = false;
      }
      setSelectedElems([]);
      setDragging(false);

      clearTimeout(timer);
      timer = null;
      if (isPanning) {
        if (selectedElement) {
          selectedElement.dragging = false;
        }
        if (oldSelectedElement) {
          oldSelectedElement.dragging = false;
        }
        setOldSelectedElement(null);
        props.selectElement(null);
        setIsPanning(false);
        canvas.current.style.cursor = "default";
      } else if (selectedElement) {
        selectedElement.dragging = true;
        setOldSelectedElement(selectedElement);
      }
      redrawCanvas();
      props.setDisableOverlay(false);
      props.updateNotebook(elements);
      return;
    }

    if (lining) {
      var didLine = false;
      Object.keys(elements).forEach((key) => {
        if (
          elements[key].isLineEnd(
            x,
            y,
            selectedElement.component.name == "Connector"
          )
        ) {
          // connect the line to the element
          selectedElement.lineToElement(key);
          props.updateNotebook(elements);
          didLine = true;
        }
      });

      // stop drawing the line
      if (selectedElement) {
        selectedElement.lining = false;
        selectedElement.liningBot = false;
        if (!didLine) {
          selectedElement.lineToX = -1;
          selectedElement.lineToY = -1;
        }
      }
      selectedElement.lineToY = -1;
      canvas.current.style.cursor = "default";
      setSelectedElement(null);

      setLining(false);
      redrawCanvas();
    } else if (dragging) {
      props.updateNotebook(elements);
    } else if (selectBox != null) {
      setSelectBox(null);
    } else if (multiDrag) {
      setMultiDrag(false);
      props.updateNotebook(elements);
      canvas.current.style.cursor = "default";
      return;
    }

    // stop dragging the element
    // if (selectedElement) selectedElement.dragging = false;
    canvas.current.style.cursor = "default";
    setOldSelectedElement(selectedElement);
    // setSelectedElement(null);

    // props.selectElement(null);
    setDragging(false);
    redrawCanvas();
    setIsPanning(false);
    props.setDisableOverlay(false);
  }

  function dragElement(e) {
    if (timer && busy == true) {
      var rect = canvas.current.getBoundingClientRect();
      var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
      var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);
      x = tx;
      y = ty;

      var dist = Math.sqrt(
        (x - lastMousePos.x) ** 2 + (y - lastMousePos.y) ** 2
      );
      if (dist > 10) {
        canvas.current.style.cursor = "grabbing";
        setDragging(true);
        redrawCanvas();
        clearTimeout(timer);
        timer = null;
        return;
      }
      return;
    }

    if (dragging) {
      // move the element that is being dragged
      var rect = canvas.current.getBoundingClientRect();
      var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
      var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);

      x = tx;
      y = ty;
    } else if (lining) {
      // draw a line from the element to the mouse position
      var rect = canvas.current.getBoundingClientRect();
      var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
      var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);

      x = tx;
      y = ty;
    } else if (isPanning) {
      if (selectedElement && selectedElement.selectedLine != null) {
        return;
      }

      props.setIsPanning(true);
      props.panCanvas(e);
    } else if (selectBox != null) {
      var rect = canvas.current.getBoundingClientRect();
      var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
      var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);
      setSelectBox({ ...selectBox, x2: tx, y2: ty });
      Object.keys(elements).forEach((key) => {
        var elem = elements[key];
        if (
          elem.isInBounds(
            selectBox.x1,
            selectBox.y1,
            selectBox.x2,
            selectBox.y2
          )
        ) {
          elem.dragging = true;

          // if not in the selected elements, add it
          if (!selectedElems.includes(elem)) {
            var tempselectedElems = selectedElems;
            tempselectedElems.push(elem);
            props.updateNotebook(elements);
            setSelectedElems(tempselectedElems);
          }
        } else {
          elem.dragging = false;
          // if in the selected elements, remove it
          if (selectedElems.includes(elem)) {
            var tempselectedElems = selectedElems;
            props.updateNotebook(elements);
            tempselectedElems.splice(tempselectedElems.indexOf(elem), 1);
            setSelectedElems(tempselectedElems);
          }
        }
      });
    } else if (multiDrag) {
      // move all selected elements
      var rect = canvas.current.getBoundingClientRect();
      var tx = (e.clientX - rect.left) * (canvas.current.width / rect.width);
      var ty = (e.clientY - rect.top) * (canvas.current.height / rect.height);
      var dx = tx - x;
      var dy = ty - y;
      x = tx;
      y = ty;
      selectedElems.forEach((elem) => {
        elem.move(dx, dy);
      });
      redrawCanvas();
    }
  }

  function onTouchStartCanvas(e) {
    var newE = {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    };

    onMouseDownCanvas(newE);
  }

  function touchDragElement(e) {
    e.preventDefault();

    if (touchX == -1 && touchY == -1) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      return;
    }
    var newE = {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      movementX: e.touches[0].clientX - touchX,
      movementY: e.touches[0].clientY - touchY,
    };
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    dragElement(newE);
  }

  function onTouchEndCanvas(e) {
    var newE = {
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY,
    };
    onMouseUpCanvas(newE);
  }

  return (
    <>
      <canvas
        onKeyDown={onKeyboard}
        onKeyDownCapture={onKeyboard}
        ref={canvas}
        className="canvas-elem"
        id="canvas"
        width={props.size.x}
        height={props.size.y}
        onMouseDown={onMouseDownCanvas}
        onTouchStart={onTouchStartCanvas}
        onMouseUp={onMouseUpCanvas}
        onTouchEnd={onTouchEndCanvas}
        onMouseMove={dragElement}
        onTouchMove={touchDragElement}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      />
      <canvas
        onKeyDown={onKeyboard}
        onKeyDownCapture={onKeyboard}
        ref={canvas2}
        className="canvas-elem-abs"
        width={props.size.x}
        height={props.size.y}
      />
    </>
  );
}

export function CanvasOverlay(props) {
  // overlays a modal that describes the current component
  const [component, setComponent] = React.useState(null);
  const [data, setData] = React.useState({});
  const [active, setActive] = React.useState(false);

  const [display, setDisplay] = React.useState(<></>);
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    if (props.selectedElement) {
      setComponent(props.selectedElement.component);
      setData(props.selectedElement.component.data);
      setActive(true);
    } else {
      setActive(false);
    }
  }, [props.selectedElement]);

  React.useEffect(() => {
    if (component) {
      setDisplay(
        <>
          <div className="canvas-overlay-header">
            <h4>{component.name}</h4>
            <h5>{component.id}</h5>
          </div>

          <p>{component.description}</p>
          {Object.keys(data).map((key) => {
            if (data[key].hidden) return <></>;
            switch (data[key].type) {
              case "matrix": {
                return (
                  <>
                    <InputLabel id="demo-simple-select-label">{key}</InputLabel>
                    {data[key].value.map((row, i) => {
                      return (
                        <>
                          <InputGroup className="row justify-center">
                            {row.map((val, j) => {
                              return (
                                <TextField
                                  autoComplete="off"
                                  autoCorrect="off"
                                  key={key + "text" + i + j + component.id}
                                  id="outlined-basic"
                                  label={i + "," + j}
                                  value={val}
                                  style={{ width: "20%" }}
                                  variant="outlined"
                                  onChange={(e) => {
                                    if (e.target.value == "" || e.target.value == "-") {
                                      data[key].value[i][j] = e.target.value;
                                      setData({ ...data, [key]: data[key] });
                                      return;
                                    }

                                    data[key].value[i][j] = parseInt(
                                      e.target.value
                                    );
                                    component.data[key] = data[key];
                                    component.reload();
                                    props.updateNotebook(elementsList);
                                    setData({ ...data, [key]: data[key] });
                                  }}
                                />
                              );
                            })}
                          </InputGroup>
                        </>
                      );
                    })}
                  </>
                );
              }

              case "sort": {
                return (
                  <>
                    <InputLabel id="demo-simple-select-label">{key}</InputLabel>
                    <DragContainer
                      order={data[key].value}
                      reorder={(order) => {
                        data[key].value = order;
                        component.data[key] = data[key];
                        component.reload();
                        props.updateNotebook(elementsList);
                        setData({ ...data, [key]: data[key] });
                      }}
                    />
                  </>
                );
              }
              case "radio":
                return (
                  <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue={data[key].value || ""}
                    name="radio-buttons-group"
                    key={key + "radio" + component.id}
                    id={key + "radio" + component.id}
                    onChange={(e) => {
                      updateData(e, key);
                    }}
                  >
                    {data[key].options.map((option) => {
                      return (
                        <FormControlLabel
                          value={option}
                          control={<Radio />}
                          label={option}
                        />
                      );
                    })}
                  </RadioGroup>
                );
              case "checkbox":
                return (
                  <FormControlLabel
                    key={key + "checkbox" + component.id}
                    id="checkbox"
                    control={
                      <Checkbox
                        value={data[key].value == "True" ? true : false}
                        defaultChecked={
                          data[key].value == "True" ? true : false
                        }
                        defaultValue={data[key].value == "True" ? true : false}
                        onChange={(e) => {
                          data[key].value = e.target.checked ? "True" : "False";
                          component.data[key] = data[key];
                          component.reload();
                          props.updateNotebook(elementsList);
                          setData({ ...data, [key]: data[key] });
                        }}
                      />
                    }
                    label={key}
                  />
                );
              case "slider":
                return (
                  <InputGroup
                    className="row"
                    key={key + "slider" + component.id}
                  >
                    <TextField
                      autoComplete="off"
                      autoCorrect="off"
                      key={key + "text" + component.id}
                      id="outlined-basic"
                      label={key}
                      value={data[key].value || 0}
                      style={{ width: "20%" }}
                      variant="outlined"
                      onChange={(e) => {
                        // get only leading dashes, digits and dots
                        if (data[key].step == 1) {
                          e.target.value = e.target.value.replace(
                            /[^\d-]/g,
                            ""
                          );
                        } else {
                          e.target.value = e.target.value.replace(
                            /[^\d.-]/g,
                            ""
                          );
                        }
                        // remove leading zeros
                        e.target.value = e.target.value.replace(/^0+/, "");
                        updateData(e, key);
                      }}
                    />
                    <Slider
                      key={key + "slider" + component.id}
                      aria-label="Default"
                      valueLabelDisplay="auto"
                      defaultValue={data[key].value || 0}
                      value={data[key].value || 0}
                      step={data[key].step || 1}
                      style={{ width: "75%" }}
                      min={data[key].min == null ? -100 : data[key].min}
                      max={data[key].max == null ? 100 : data[key].max}
                      onChange={(e, value) => {
                        data[key].value = value;
                        component.data[key] = data[key];
                        component.reload();
                        props.updateNotebook(elementsList);
                        setData({ ...data, [key]: data[key] });
                      }}
                    />
                  </InputGroup>
                );
              case "text":
              default:
                return (
                  <>
                    <TextField
                      autoComplete="off"
                      autoCorrect="off"
                      key={key + "text" + component.id}
                      id="outlined-basic"
                      label={key}
                      value={data[key].value || ""}
                      variant="outlined"
                      disabled={data[key].readonly || false}
                      fullWidth
                      multiline={data[key].multiline || false}
                      maxRows={data[key].rows || 1}
                      onChange={(e) => {
                        updateData(e, key);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key == "Tab") {
                          e.preventDefault();
                          e.target.value += "\t";
                          updateData(e, key);
                        }
                      }}
                    />
                    {key == "Code" && (
                      <pre style={{ width: "100%" }}>
                        <code
                          className="python"
                          class="python"
                          id={component.id + "code"}
                        >
                          <p>{data[key].value || ""}</p>
                        </code>
                      </pre>
                    )}
                  </>
                );
            }
          })}
        </>
      );
    } else {
      setDisplay(<></>);
    }
  }, [component, data]);

  useEffect(() => {
    if (component) {
      if (document.getElementById(component.id + "code")) {
        // destroy and rehighlight the code
        var code = document.getElementById(component.id + "code");
        if (code.attributes.getNamedItem("data-highlighted")) {
          code.attributes.removeNamedItem("data-highlighted");
        }
        code.innerHTML = "<p>" + component.transpile() + "</p>";
        hljs.highlightAll();
      }
    }
  }, [display]);

  function updateData(e, key) {
    var dat = data[key];
    dat.value = e.target.value;
    component.data[key] = dat;
    component.reload();
    props.updateNotebook(elementsList);
    setData({ ...data, [key]: dat });
  }

  return (
    <>
      {" "}
      {component && (
        <div className={active ? "canvas-overlay active" : "canvas-overlay"}>
          <div
            className={
              (props.pointer
                ? "canvas-overlay-content none_pointer_events"
                : "canvas-overlay-content") +
              (hidden ? " canvas-overlay-hidden" : "")
            }
          >
            <div className="canvas-overlay-dismiss">
              <FontAwesomeIcon
                icon={faChevronDown}
                className={
                  hidden
                    ? "canvas-overlay-dismiss-icon overlay-hidden"
                    : "canvas-overlay-dismiss-icon"
                }
                onClick={() => {
                  setHidden(!hidden);
                  // setActive(false);
                  // setComponent(null);
                }}
              />
            </div>
            {display}
          </div>
        </div>
      )}
    </>
  );
}

class Element {
  constructor(x, y, w, h, component = null) {
    this.x = x - w / 2;
    this.y = y - h / 2;
    this.w = w;
    this.h = h;
    this.lineToX = -1;
    this.lineToY = -1;
    this.lines = {};
    this.elements = [];
    this.dragging = false;
    this.color = component.color || "#ff0000";
    this.dragColor = "#fff";
    this.component = component || {};
    this.text = this.component.name || "Component";
    this.id = this.component.id;
    this.selectedLine = null;
    this.selectedBot = null;
    this.top = this.component.top || false;
    this.bot = this.component.bot || false;
    this.lineBotX = -1;
    this.lineBotY = -1;
    this.liningBot = false;
    this.botElements = [];

    if (this.text.length > 5) {
      this.w = Math.max(this.text.length * 25, this.w);
    }
  }

  draw(ctx) {
    if (this.dragging) {
      ctx.fillStyle = this.dragColor;
    } else {
      ctx.fillStyle = this.color;
    }
    // round the corners of the rectangle
    ctx.beginPath();
    ctx.moveTo(this.x + 20, this.y);
    ctx.lineTo(this.x + this.w - 20, this.y);
    ctx.quadraticCurveTo(this.x + this.w, this.y, this.x + this.w, this.y + 20);
    ctx.lineTo(this.x + this.w, this.y + this.h - 20);
    ctx.quadraticCurveTo(
      this.x + this.w,
      this.y + this.h,
      this.x + this.w - 20,
      this.y + this.h
    );
    ctx.lineTo(this.x + 20, this.y + this.h);
    ctx.quadraticCurveTo(this.x, this.y + this.h, this.x, this.y + this.h - 20);
    ctx.lineTo(this.x, this.y + 20);
    ctx.quadraticCurveTo(this.x, this.y, this.x + 20, this.y);
    ctx.fill();

    // draw a small rectangle at the right center of the element
    if (this.dragging) {
      ctx.fillStyle = this.color;
    } else {
      ctx.fillStyle = "#fff";
    }
    if (this.component.numOutputs != 0) {
      ctx.fillRect(this.x + this.w - 10, this.y + this.h / 2 - 10, 20, 20);
    }
    if (this.component.numInputs != 0) {
      ctx.fillRect(this.x - 10, this.y + this.h / 2 - 10, 20, 20);
    }
    if (this.bot) {
      ctx.fillRect(this.x + this.w / 2 - 10, this.y + this.h - 10, 20, 20);
    }
    if (this.top) {
      ctx.fillRect(this.x + this.w / 2 - 10, this.y - 10, 20, 20);
    }
    // draw the text
    if (this.dragging) {
      ctx.fillStyle = "#000";
    } else {
      ctx.fillStyle = "#fff";
    }
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.text,
      this.x + this.w / 2,
      this.y + this.h / 2 + (this.dragging ? 0 : 8)
    );

    // draw the id
    if (this.dragging) {
      ctx.fillStyle = "#000";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        this.component.id,
        this.x + this.w / 2,
        this.y + this.h / 2 + 20
      );
    } else {
      ctx.fillStyle = "#fff";
    }
  }

  drawLines(ctx) {
    for (var i = 0; i < this.elements.length; i++) {
      var elem = elementsList[this.elements[i]];
      if (elem == null) {
        this.elements.splice(i, 1);
        continue;
      }
      var tlineToX = elem.x;
      var tlineToY = elem.y + elem.h / 2;
      var dist = Math.sqrt(
        (this.x + this.w - tlineToX) ** 2 +
          (this.y + this.h / 2 - tlineToY) ** 2
      );

      var yAdjust = 0;
      if (this.x + this.w > tlineToX) {
        yAdjust = 50;
        dist *= 1.5;
        if (this.y + this.h / 2 < tlineToY) {
          yAdjust *= -1;
        }
      }

      if (tlineToX >= 0 && tlineToY >= 0) {
        // draw a line with bezier curves
        if (this.selectedLine != this.elements[i]) {
          ctx.strokeStyle = "#fff";
        } else {
          ctx.strokeStyle = this.color;
        }
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.x + this.w, this.y + this.h / 2);
        ctx.bezierCurveTo(
          this.x + this.w + (dist / 600) * 200,
          this.y + this.h / 2 - yAdjust,
          tlineToX - (dist / 600) * 200,
          tlineToY + yAdjust,
          tlineToX,
          tlineToY
        );
        ctx.stroke();

        var midX = (this.x + this.w + tlineToX) / 2;
        var midY = (this.y + this.h / 2 + tlineToY) / 2;
        var radius = 7.5;
        // draw a small circle at the middle of the line
        if (this.selectedLine == this.elements[i]) {
          ctx.fillStyle = this.color;
        } else {
          ctx.fillStyle = "#fff";
        }
        ctx.beginPath();
        ctx.arc(midX, midY, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    if (!this.liningBot && this.lineToX >= 0 && this.lineToY >= 0) {
      // draw a line with bezier curves
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      ctx.moveTo(this.x + this.w, this.y + this.h / 2);
      ctx.bezierCurveTo(
        this.x + this.w + 200,
        this.y + this.h / 2,
        this.lineToX - 200,
        this.lineToY,
        this.lineToX,
        this.lineToY
      );

      ctx.stroke();
    }

    if (this.bot && this.liningBot && this.lineToX >= 0 && this.lineToY >= 0) {
      // draw a line with bezier curves
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(this.x + this.w / 2, this.y + this.h);
      ctx.bezierCurveTo(
        this.x + this.w / 2,
        this.y + this.h + 200,
        this.lineToX,
        this.lineToY - 200,
        this.lineToX,
        this.lineToY
      );
      ctx.stroke();

      var midX = (this.x + this.w / 2 + this.lineToX) / 2;
      var midY = (this.y + this.h + this.lineToY) / 2;
      var radius = 7.5;
      // draw a small circle at the middle of the line
      if (this.liningBot) {
        ctx.fillStyle = this.color;
      } else {
        ctx.fillStyle = "#fff";
      }
      ctx.beginPath();
      ctx.arc(midX, midY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    for (var i = 0; i < this.botElements.length; i++) {
      var elem = elementsList[this.botElements[i]];
      if (elem == null) {
        this.botElements.splice(i, 1);
        continue;
      }
      var tlineToX = elem.x + elem.w / 2;
      var tlineToY = elem.y;
      var dist = Math.sqrt(
        (this.x + this.w - tlineToX) ** 2 +
          (this.y + this.h / 2 - tlineToY) ** 2
      );

      var xAdjust = 0;
      if (this.y + this.h / 2 > tlineToY) {
        xAdjust = 50;
        dist *= 1.5;
        if (this.x + this.w / 2 < tlineToX) {
          xAdjust *= -1;
        }
      }

      if (tlineToX >= 0 && tlineToY >= 0) {
        // draw a line with bezier curves
        if (this.selectedLine != this.botElements[i]) {
          ctx.strokeStyle = "#fff";
        } else {
          ctx.strokeStyle = this.color;
        }
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(this.x + this.w / 2, this.y + this.h);
        ctx.bezierCurveTo(
          this.x + this.w / 2 - xAdjust,
          this.y + this.h + (dist / 500) * 200,
          tlineToX + xAdjust,
          tlineToY - (dist / 500) * 200,
          tlineToX,
          tlineToY
        );
        ctx.stroke();

        var midX = (this.x + this.w / 2 + tlineToX) / 2;
        var midY = (this.y + this.h + tlineToY) / 2;
        var radius = 7.5;
        // draw a small circle at the middle of the line
        if (this.selectedLine == this.botElements[i]) {
          ctx.fillStyle = this.color;
        } else {
          ctx.fillStyle = "#fff";
        }
        ctx.beginPath();
        ctx.arc(midX, midY, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
  isDragging(x, y) {
    return (
      x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    );
  }

  isLineEnd(x, y, override = false) {
    if (!override && this.component.numInputs == 0) return false;

    return (
      x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    );
  }

  isLining(x, y) {
    this.liningBot = false;
    if (this.bot) {
      if (
        x >= this.x + this.w / 2 - 15 &&
        x <= this.x + this.w / 2 + 25 &&
        y >= this.y + this.h - 15 &&
        y <= this.y + this.h + 25
      ) {
        this.liningBot = true;
        console.log("lining bot");
        return true;
      }
    }

    if (this.component.numOutputs == 0) return false;

    // check if the mouse is over the small rectangle at the right center of the element
    return (
      x >= this.x + this.w - 15 &&
      x <= this.x + this.w + 25 &&
      y >= this.y + this.h / 2 - 15 &&
      y <= this.y + this.h / 2 + 25
    );
  }

  isLineSelected(x, y) {
    if (this.botElements.length > 0) {
      for (var i = 0; i < this.botElements.length; i++) {
        var elem = elementsList[this.botElements[i]];
        var tlineToX = elem.x + elem.w / 2;
        var tlineToY = elem.y;

        // check if mouse is near the middle of the line
        var midX = (this.x + this.w / 2 + tlineToX) / 2;
        var midY = (this.y + this.h + tlineToY) / 2;
        var tolerance = 20;
        if (
          x >= midX - tolerance &&
          x <= midX + tolerance &&
          y >= midY - tolerance &&
          y <= midY + tolerance
        ) {
          this.selectedLine = this.botElements[i];
          this.selectedBot = this.botElements[i];
          return true;
        }
      }
    }

    if (this.elements.length == 0) return false;
    for (var i = 0; i < this.elements.length; i++) {
      var elem = elementsList[this.elements[i]];
      var tlineToX = elem.x;
      var tlineToY = elem.y + elem.h / 2;

      // check if mouse is near the middle of the line
      var midX = (this.x + this.w + tlineToX) / 2;
      var midY = (this.y + this.h / 2 + tlineToY) / 2;
      var tolerance = 20;
      if (
        x >= midX - tolerance &&
        x <= midX + tolerance &&
        y >= midY - tolerance &&
        y <= midY + tolerance
      ) {
        this.selectedLine = this.elements[i];
        return true;
      }
    }
    return false;
  }

  isInBounds(x1, y1, x2, y2) {
    // if any of the corners of the element are in the bounds, return true
    var tx,
      ty = -1;
    if (x1 > x2) {
      tx = x1;
      x1 = x2;
      x2 = tx;
    }
    if (y1 > y2) {
      ty = y1;
      y1 = y2;
      y2 = ty;
    }

    if (
      (this.x >= x1 && this.x <= x2 && this.y >= y1 && this.y <= y2) ||
      (this.x + this.w >= x1 &&
        this.x + this.w <= x2 &&
        this.y >= y1 &&
        this.y <= y2) ||
      (this.x >= x1 &&
        this.x <= x2 &&
        this.y + this.h >= y1 &&
        this.y + this.h <= y2) ||
      (this.x + this.w >= x1 &&
        this.x + this.w <= x2 &&
        this.y + this.h >= y1 &&
        this.y + this.h <= y2)
    ) {
      return true;
    }
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  moveTo(x, y) {
    this.x = x - this.w / 2;
    this.y = y - this.h / 2;
  }

  lineTo(x, y) {
    this.lineToX = x;
    this.lineToY = y;
  }

  fixLines() {
    for (var i = 0; i < this.elements.length; i++) {
      // if component is not in the elements list, remove it
      if (elementsList[this.elements[i]] == null) {
        this.elements.splice(i, 1);
        continue;
      }

      // if not in component outputs, add it
      this.component.outputs[this.elements[i]] =
        elementsList[this.elements[i]].component;
      elementsList[this.elements[i]].component.inputs[this.component.id] =
        this.component;
    }
    for (var i = 0; i < this.botElements.length; i++) {
      // if component is not in the elements list, remove it
      if (elementsList[this.botElements[i]] == null) {
        this.botElements.splice(i, 1);
        continue;
      }
      // if not in component outputs, add it
      this.component.topInputs[this.botElements[i]] =
        elementsList[this.botElements[i]].component;
      elementsList[this.botElements[i]].component.helpers[this.component.id] =
        this.component;
    }
    this.lineToX = -1;
    this.lineToY = -1;
  }

  findSelf(component) {
    if (component == null) return false;
    if (this.component.id + "" == component.id + "") return true;

    var flip = false;
    Object.keys(component.outputs).forEach((key) => {
      if (this.findSelf(component.outputs[key])) {
        flip = true;
      }
    });
    if (flip) return true;
    return false;
  }

  lineToElement(i) {
    if (
      i == this.id ||
      this.component.id in Object.keys(elementsList[i].component.outputs)
    ) {
      this.lineToX = -1;
      this.lineToY = -1;
      return false;
    }

    if (this.bot && this.liningBot) {
      if (elementsList[i].top && !this.botElements.includes(i)) {
        this.botLineX = -1;
        this.botLineY = -1;
        this.lineToX = -1;
        this.lineToY = -1;
        this.botElements.push(i);
        // this.component.helpers[this.component.id] = elementsList[i].component;
        elementsList[i].component.helpers[i] = this.component;
        this.component.topInputs[i] = elementsList[i].component;
        return true;
      }

      this.lineToX = -1;
      this.lineToY = -1;
      return false;
    }

    // prevent loop by recursing through the outputs
    var temp = elementsList[i].component;
    if (this.findSelf(temp)) {
      this.lineToX = -1;
      this.lineToY = -1;
      return false;
    }

    this.elements.push(i);
    this.component.outputs[i] = elementsList[i].component;
    elementsList[i].component.inputs[this.component.id] = this.component;
    return true;
  }

  removeElement() {
    for (var i = 0; i < this.elements.length; i++) {
      delete elementsList[this.element[i]].component.inputs[this.component.id];
      delete this.component.outputs[this.element[i]];
    }
    for (var i = 0; i < this.botElements.length; i++) {
      delete elementsList[this.botElements[i]].component.helpers[
        this.component.id
      ];
      delete this.component.topInputs[this.botElements[i]];
    }
  }

  deleteSelf() {
    var inputs = this.component.inputs;
    var outputs = this.component.outputs;

    var topIns = this.component.topInputs;
    var bots = this.component.helpers;
    Object.keys(inputs).forEach((key) => {
      if (elementsList[key] == null) return;
      if (elementsList[key].elements == null) return;
      elementsList[key].elements = elementsList[key].elements.filter(
        (item) => item !== this.component.id
      );
      delete inputs[key].outputs[this.component.id];
    });
    Object.keys(outputs).forEach((key) => {
      delete outputs[key].inputs[this.component.id];
    });

    Object.keys(topIns).forEach((key) => {
      if (elementsList[key] == null) return;
      if (elementsList[key].botElements == null) return;
      elementsList[key].botElements = elementsList[key].botElements.filter(
        (item) => item !== this.component.id
      );
      delete topIns[key].helpers[this.component.id];
    });
    Object.keys(bots).forEach((key) => {
      delete bots[key].topInputs[this.component.id];
    });

    for (var i = 0; i < this.botElements.length; i++) {
      delete elementsList[this.botElements[i]].component.helpers[
        this.component.id
      ];
      delete this.component.topInputs[this.botElements[i]];
    }
  }

  disconnectOutput() {
    if (this.selectedBot) {
      // delete elementsList[this.botElement].component.inputs[this.component.id];
      // delete this.component.outputs[this.botElement];

      console.log("DISCONNECTED", this.botElements);
      this.botLineX = -1;
      this.botLineY = -1;

      // remove from bot elements
      this.botElements = this.botElements.filter(
        (item) => item !== this.selectedBot
      );

      delete elementsList[this.selectedBot].component.helpers[
        this.component.id
      ];
      delete this.component.topInputs[this.selectedBot];

      this.selectedBot = null;

      return;
    }

    if (this.elements.length > 0) {
      delete elementsList[this.selectedLine].component.inputs[
        this.component.id
      ];
      delete this.component.outputs[this.selectedLine];
      this.elements = this.elements.filter(
        (item) => item !== this.selectedLine
      );
      this.lineToX = -1;
      this.lineToY = -1;
      this.selectedLine = null;
    }
  }

  getNext() {
    // get random next element id from component outputs
    var keys = Object.keys(this.component.outputs);
    if (keys.length == 0) return null;
    var rand = Math.floor(Math.random() * keys.length);

    return keys[rand];
  }

  getPrev() {
    // get random prev element id from component inputs
    var keys = Object.keys(this.component.inputs);
    if (keys.length == 0) return null;
    var rand = Math.floor(Math.random() * keys.length);

    return keys[rand];
  }

  getBot() {
    // get random prev element id from component inputs
    var keys = Object.keys(this.component.topInputs);
    if (keys.length == 0) return null;
    var rand = Math.floor(Math.random() * keys.length);

    return keys[rand];
  }

  getTop() {
    // get random prev element id from component inputs
    var keys = Object.keys(this.component.helpers);
    if (keys.length == 0) return null;
    var rand = Math.floor(Math.random() * keys.length);

    return keys[rand];
  }

  // to json
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      component: {
        id: this.component.id,
        key: this.component.key,
        name: this.component.name,
        description: this.component.description,
        data: this.component.data,
        inputs: {},
        outputs: {},
        helpers: {},
        topInputs: {},
        color: this.component.color,
      },
      elements: this.elements,
      botElements: this.botElements,
      lineToX: this.lineToX,
      lineToY: this.lineToY,
    };
  }

  // from json
  fromJSON(json) {
    this.x = json.x;
    this.y = json.y;
    this.w = json.w;
    this.h = json.h;
    this.elements = json.elements;
    this.lineToX = json.lineToX;
    this.lineToY = json.lineToY;
    this.botElements = json.botElements;
  }
}
