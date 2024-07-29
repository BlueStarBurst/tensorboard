"use client";

import { createContext } from "react";
import { Component } from "../blocks";
import { Cell } from "../tabs/notebook-utils";

export class Element {
    x: number;
    y: number;
    w: number;
    h: number;
    lineToX: number;
    lineToY: number;
    lines: {};
    elements: any[];
    dragging: boolean;
    color: string;
    dragColor: string;
    component: any;
    text: string;
    id: any;
    selectedLine: any;
    selectedBot: any;
    top: any;
    bot: any;
    lineBotX: number;
    lineBotY: number;
    liningBot: boolean;
    botElements: any[];
    botLineX: number;
    botLineY: number;
    lining: boolean = false;
    getElements: () => {
        [key: string]: Element;
    };

    constructor(x: number, y: number, w: number, h: number, component: Component | null = null, getElements: any = {}) {
        this.x = x - w / 2;
        this.y = y - h / 2;
        this.w = w;
        this.h = h;
        this.lineToX = -1;
        this.lineToY = -1;
        this.lines = {};
        this.elements = [];
        this.dragging = false;
        this.color = component?.color || "#ff0000";
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
        this.getElements = () => getElements();
        this.botLineX = -1;
        this.botLineY = -1;

        if (this.text.length > 5) {
            this.w = Math.max(this.text.length * 25, this.w);
        }
    }



    draw(ctx: CanvasRenderingContext2D) {
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

    drawLines(ctx: CanvasRenderingContext2D) {
        for (var i = 0; i < this.elements.length; i++) {
            var elem = this.getElements()[this.elements[i]];
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
            var elem = this.getElements()[this.botElements[i]];
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
    isDragging(x: number, y: number) {
        console.log("isDragging", x, y, this.x, this.y, this.w, this.h,
            x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
        return (
            x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
        );
    }

    isLineEnd(x: number, y: number, override = false) {
        if (!override && this.component.numInputs == 0) return false;

        return (
            x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
        );
    }

    isLining(x: number, y: number) {
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

        console.log("lining", x, y, this.x + this.w, this.y + this.h, (
            x >= this.x + this.w - 15 &&
            x <= this.x + this.w + 25 &&
            y >= this.y + this.h / 2 - 15 &&
            y <= this.y + this.h / 2 + 25
        ));

        if (this.component.numOutputs == 0) return false;

        // check if the mouse is over the small rectangle at the right center of the element
        return (
            x >= this.x + this.w - 15 &&
            x <= this.x + this.w + 25 &&
            y >= this.y + this.h / 2 - 15 &&
            y <= this.y + this.h / 2 + 25
        );
    }

    isLineSelected(x: number, y: number) {
        if (this.botElements.length > 0) {
            for (var i = 0; i < this.botElements.length; i++) {
                var elem = this.getElements()[this.botElements[i]];
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
            var elem = this.getElements()[this.elements[i]];
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

    isInBounds(x1: number, y1: number, x2: number, y2: number) {
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
        return false;
    }

    move(dx: any, dy: any) {
        this.x += dx;
        this.y += dy;
    }

    moveTo(x: number, y: number) {
        this.x = x - this.w / 2;
        this.y = y - this.h / 2;
    }

    lineTo(x: any, y: any) {
        this.lineToX = x;
        this.lineToY = y;
    }

    fixLines() {
        for (var i = 0; i < this.elements.length; i++) {
            // if component is not in the elements list, remove it
            if (this.getElements()[this.elements[i]] == null) {
                this.elements.splice(i, 1);
                continue;
            }

            // if not in component outputs, add it
            this.component.outputs[this.elements[i]] =
                this.getElements()[this.elements[i]].component;
            this.getElements()[this.elements[i]].component.inputs[this.component.id] =
                this.component;
        }
        for (var i = 0; i < this.botElements.length; i++) {
            // if component is not in the elements list, remove it
            if (this.getElements()[this.botElements[i]] == null) {
                this.botElements.splice(i, 1);
                continue;
            }
            // if not in component outputs, add it
            this.component.topInputs[this.botElements[i]] =
                this.getElements()[this.botElements[i]].component;
            this.getElements()[this.botElements[i]].component.helpers[this.component.id] =
                this.component;
        }
        this.lineToX = -1;
        this.lineToY = -1;
    }

    findSelf(component: Component | null) {
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

    lineToElement(i: string | number) {
        if (
            i == this.id ||
            this.component.id in Object.keys(this.getElements()[i].component.outputs)
        ) {
            this.lineToX = -1;
            this.lineToY = -1;
            return false;
        }

        if (this.bot && this.liningBot) {
            if (this.getElements()[i].top && !this.botElements.includes(i)) {
                this.botLineX = -1;
                this.botLineY = -1;
                this.lineToX = -1;
                this.lineToY = -1;
                this.botElements.push(i);
                // this.component.helpers[this.component.id] = this.getElements()[i].component;
                this.getElements()[i].component.helpers[i] = this.component;
                this.component.topInputs[i] = this.getElements()[i].component;
                return true;
            }

            this.lineToX = -1;
            this.lineToY = -1;
            return false;
        }

        // prevent loop by recursing through the outputs
        var temp = this.getElements()[i].component;
        if (this.findSelf(temp)) {
            this.lineToX = -1;
            this.lineToY = -1;
            return false;
        }

        this.elements.push(i);
        this.component.outputs[i] = this.getElements()[i].component;
        this.getElements()[i].component.inputs[this.component.id] = this.component;
        return true;
    }

    removeElement() {
        for (var i = 0; i < this.elements.length; i++) {
            delete this.getElements()[this.elements[i]].component.inputs[this.component.id];
            delete this.component.outputs[this.elements[i]];
        }
        for (var i = 0; i < this.botElements.length; i++) {
            delete this.getElements()[this.botElements[i]].component.helpers[
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
            if (this.getElements()[key] == null) return;
            if (this.getElements()[key].elements == null) return;
            this.getElements()[key].elements = this.getElements()[key].elements.filter(
                (item: any) => item !== this.component.id
            );
            delete inputs[key].outputs[this.component.id];
        });
        Object.keys(outputs).forEach((key) => {
            delete outputs[key].inputs[this.component.id];
        });

        Object.keys(topIns).forEach((key) => {
            if (this.getElements()[key] == null) return;
            if (this.getElements()[key].botElements == null) return;
            this.getElements()[key].botElements = this.getElements()[key].botElements.filter(
                (item: any) => item !== this.component.id
            );
            delete topIns[key].helpers[this.component.id];
        });
        Object.keys(bots).forEach((key) => {
            delete bots[key].topInputs[this.component.id];
        });

        for (var i = 0; i < this.botElements.length; i++) {
            delete this.getElements()[this.botElements[i]].component.helpers[
                this.component.id
            ];
            delete this.component.topInputs[this.botElements[i]];
        }
    }

    disconnectOutput() {
        if (this.selectedBot) {
            // delete this.getElements()[this.botElement].component.inputs[this.component.id];
            // delete this.component.outputs[this.botElement];

            console.log("DISCONNECTED", this.botElements);
            this.botLineX = -1;
            this.botLineY = -1;

            // remove from bot elements
            this.botElements = this.botElements.filter(
                (item: any) => item !== this.selectedBot
            );

            delete this.getElements()[this.selectedBot].component.helpers[
                this.component.id
            ];
            delete this.component.topInputs[this.selectedBot];

            this.selectedBot = null;

            return;
        }

        if (this.elements.length > 0) {
            delete this.getElements()[this.selectedLine].component.inputs[
                this.component.id
            ];
            delete this.component.outputs[this.selectedLine];
            this.elements = this.elements.filter(
                (item: any) => item !== this.selectedLine
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
    fromJSON(json: { x: any; y: any; w: any; h: any; elements: any; lineToX: any; lineToY: any; botElements: any; }) {
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

type ElementsContextType = {
    elements: {
        [key: string]: Element;
    }
    setElements: (elements: { [key: string]: Element }) => void;
    selectedElement: Element | null;
    setSelectedElement: (element: Element | null) => void;
    notebookCells: Cell[];
    setNotebookCells: (cells: Cell[]) => void;
};

export const ElementsContext = createContext<ElementsContextType>({
    elements: {},
    setElements: () => { },
    selectedElement: null,
    setSelectedElement: () => { },
    notebookCells: [],
    setNotebookCells: () => { },
});
