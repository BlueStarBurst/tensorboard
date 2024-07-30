import { useContext } from "react";
import { Component } from "../blocks";
import { ElementsContext } from "../canvas/elements-context";

export type Cell = {
    cell_type: string;
    execution_count: number;
    metadata: {
        id: number;
        selected: boolean;
    };
    outputs: any[];
    source: string[];
};

export function useNotebook() {
    const { elements, setElements, setNotebookCells } = useContext(ElementsContext);

    function addChildrenToComponentList(component: Component, idList: number[] = []) {
        var finArray = [component.id];
        // console.log("IDLIST", idList);

        if (idList.includes(component.id)) {
            // get index of id
            var index = idList.lastIndexOf(component.id);
            if (idList[index - 1] == idList[idList.length - 1]) {
                return [];
            }
        }
        idList.push(component.id);

        Object.keys(component.helpers).map((key, index) => {
            var tempArr = addChildrenToComponentList(component.helpers[key], idList);
            // add the arr to the finArray
            finArray = finArray.concat(tempArr);
        });

        // loop through keys of component outputs {id : component}
        Object.keys(component.outputs).map((key, index) => {
            var tempArr = addChildrenToComponentList(component.outputs[key], idList);
            // add the arr to the finArray
            finArray = finArray.concat(tempArr);
        });

        return finArray;
    }


    function updateNotebook() {

        if (Object.keys(elements).length == 0) {
            return;
        }

        var saveElements = {
            [Object.keys(elements)[0]]: elements[Object.keys(elements)[0]].toJSON(),
        };
        Object.keys(elements).map((key, index) => {
            saveElements[key] = elements[key].toJSON();
        });
        // DBManager.getInstance().setItem("elements", saveElements);

        const tcomponents: Component[] = [];
        var scomponents: {
            [key: number]: Component
        } = {};
        var rootComponents: Component[] = [];
        var keyList: number[] = [];
        var fcomponents: Component[] = [];

        var tempElements = Object.values(elements);

        for (var i = 0; i < tempElements.length; i++) {
            var element = tempElements[i];
            tcomponents.push(element.component);
            scomponents[element.component.id] = element.component;
        }

        // get all components with no inputs
        for (var i = 0; i < tcomponents.length; i++) {
            var component = tcomponents[i];

            console.log("COMPONENT", component.name, component.id, component.inputs);

            if (Object.keys(component.inputs).length == 0) {
                // keyList.push(component.id);
                rootComponents.push(component);
                console.log("ROOT COMPONENT", component);
            }
        }

        // sort root components by priority low to high
        rootComponents = rootComponents.sort((a, b) => {
            var ap = a.priority || 100;
            var bp = b.priority || 100;
            return ap - bp;
        });

        for (var i = 0; i < rootComponents.length; i++) {
            keyList.push(rootComponents[i].id);
        }

        console.log("ROOT COMPONENTS", rootComponents, keyList);

        // loop through all components with no inputs, adding their outputs to the inputs of other components
        for (var i = 0; i < rootComponents.length; i++) {
            var children = rootComponents[i].outputs;

            Object.keys(children).map((key, index) => {
                // add the children to the components array
                var tempArr = addChildrenToComponentList(children[key]);

                console.log("TEMPARR", tempArr);

                keyList = keyList.concat(tempArr);
            });
        }

        // make sure 0 priority components are after 1 priority components
        // sort the keyList by priority
        keyList = keyList.sort((a, b) => {
            var ap = scomponents[a].priority || 100;
            var bp = scomponents[b].priority || 100;
            return ap - bp;
        });

        // loop backwards through the keyList, keeping only the unique keys
        var uniqueKeyList: number[] = [];
        for (var i = keyList.length - 1; i >= 0; i--) {
            if (
                !uniqueKeyList.includes(keyList[i]) &&
                scomponents[keyList[i]].name != "Connector"
            ) {
                // add to front of array
                uniqueKeyList.push(keyList[i]);
                fcomponents.unshift(scomponents[keyList[i]]);
            }
        }
        console.log("F COMPONENTS", fcomponents);
        console.log("S COMPONENTS", scomponents);
        console.log("KEY LIST", keyList);
        console.log("UNIQUE KEY LIST", uniqueKeyList);

        // parse the components into JSON cells
        var tcells: Cell[] = [];
        fcomponents.map((value, index) => {
            if (value && value.transpile) {
                let raw_python = "ERROR";

                try {
                    raw_python = value.transpile();
                    console.log("RAW PYTHON", raw_python);
                } catch (e) {
                    console.log("ERROR", e);
                }
                // split by new line
                const raw_python_arr = raw_python.split("\n");
                // add a new line to the end of each line
                const parsed_raw_python_arr = raw_python_arr.map((line, i) => {
                    if (i != raw_python.length - 1) {
                        return line + "\n";
                    } else {
                        return line;
                    }
                });
                // remove the last new line

                tcells.push({
                    cell_type: "code",
                    execution_count: 1,
                    metadata: {
                        id: value.id,
                        selected: elements[value.id].dragging,
                    },
                    outputs: [],
                    source: parsed_raw_python_arr,
                });
            }
        });

        setNotebookCells(tcells);

        // if (ws && ws.readyState == 1) {
        //     const newNote = start + JSON.stringify(tcells, null, 4) + end;
        //     console.log("NOTE: " + newNote + " " + oldNote);
        //     if (newNote != oldNote) {
        //         ws.send(
        //             JSON.stringify({
        //                 type: "setNotebook",
        //                 data: newNote,
        //             })
        //         );
        //     }
        //     setOldNote(newNote);
        // }
    }

    return {
        updateNotebook,
    };

}

export function clone(obj: any) {
    var copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}