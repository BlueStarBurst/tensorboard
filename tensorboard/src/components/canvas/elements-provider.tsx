"use client";

import { useState } from "react";
import { Element, ElementsContext } from "./elements-context";
import { Cell } from "../tabs/notebook-utils";

export function ElementsContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [elements, setElements] = useState<{
        [key: string]: Element;
    }>({});

    const [selectedElement, setSelectedElement] = useState<Element | null>(null);

    const [notebookCells, setNotebookCells] = useState<Cell[]>([]);

    const [statuses, setStatuses] = useState<{
        [key: string]: string;
    }>({});

    return (
        <ElementsContext.Provider value={{
            elements,
            setElements,
            selectedElement,
            setSelectedElement,
            notebookCells,
            setNotebookCells,
            statuses,
            setStatuses,
        }}>
            {children}
        </ElementsContext.Provider>
    );
}
