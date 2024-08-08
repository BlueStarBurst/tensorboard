import { createContext, useContext, useEffect, useState } from "react";
import { defaultElement, Element, ElementsContext } from "../canvas/elements-context";
import { clone } from "../tabs/notebook-utils";

type StorageContextType = {
    currentElements: { [key: string]: Element };
    setCurrentElements: (elements: { [key: string]: Element }) => void;
};

export const StorageContext = createContext<StorageContextType>({
    currentElements: {},
    setCurrentElements: () => { },
});

export function StorageContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [currentElements, setCurrentElements] = useState<{ [key: string]: Element }>({});

    const { elements, setElements } = useContext(ElementsContext);

    

    return (
        <StorageContext.Provider value={{ currentElements, setCurrentElements }}>
            {children}
        </StorageContext.Provider>
    );
}