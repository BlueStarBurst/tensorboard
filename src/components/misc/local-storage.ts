"use client";

import { SerializedDockview } from "dockview-core";
import { useContext, useEffect } from "react";
import { StorageContext } from "./storage-context";

export function useStorage() {

    const {
        storage
    } = useContext(StorageContext);

    function doesExist(key: string) {
        console.log("KEY", key, storage);
        return storage?.getItem(key) !== null;
    }

    function saveLayout(page: SerializedDockview) {
        console.log("SAVING LAYOUT", page, storage);
        storage?.setItem("layout", JSON.stringify(page));
    }

    function loadLayout(): SerializedDockview | undefined {
        const layout = storage?.getItem("layout");
        if (layout) {
            return JSON.parse(layout);
        } else {
            return undefined;
        }
    }

    return {
        doesExist,
        saveLayout,
        loadLayout,
    };

}