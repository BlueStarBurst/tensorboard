"use client";

import { useState } from "react";
import DockViewContainer from "./dockview-container";
import { ElementsContextProvider } from "./canvas/elements-provider";
import { StorageContext, StorageContextProvider } from "./misc/storage-context";

export default function Main() {
    return (
        <div className="w-full h-dvh flex items-center justify-center">
            <StorageContextProvider>
                <ElementsContextProvider>
                    <DockViewContainer />
                </ElementsContextProvider>
            </StorageContextProvider>
        </div>
    )
}