"use client";

import { SerializedDockview } from "dockview-core";
import { useContext, useEffect } from "react";
import { StorageContext } from "./storage-context";
import { defaultElement, Element, ElementsContext } from "../canvas/elements-context";
import { clone } from "../tabs/notebook-utils";
import components from "../blocks";

export function useStorage() {

    const {
        elements,
        setElements
    } = useContext(ElementsContext);

    function saveElements(newElements: { [key: string]: Element }) {
        localStorage.setItem("elements", JSON.stringify(newElements));
    }

    function getElements() {
        return elements;
    }

    function loadElements() {
        const elements = localStorage.getItem("elements");
        if (elements) {

            const newElements = JSON.parse(elements) as { [key: string]: Element };

            Object.keys(newElements).forEach((key) => {
                const newElement = new Element();

                // assign the new element to the old element
                newElement.fromJSON(newElements[key]);

                newElement.dragging = false;
                newElement.lining = false;
                
                newElement.component = clone(components[newElement.component.key!]);
                newElement.component.id = newElement.id;

                newElements[key] = newElement;

            });

            console.log(newElements);

            Object.keys(newElements).forEach((key) => {
                const newElement = newElements[key];
                newElement.getElements = () => {
                    return newElements;
                };
                newElement.fixLines();
            });

            setElements(newElements);
        }
    }

    return { saveElements, loadElements };
}